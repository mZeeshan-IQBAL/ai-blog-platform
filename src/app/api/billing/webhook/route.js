// src/app/api/billing/webhook/route.js
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req) {
  const body = await req.text();
  const sig = headers().get("stripe-signature");

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Webhook signature verification failed" }, { status: 400 });
  }

  console.log("Received Stripe webhook event:", event.type);

  try {
    await connectToDB();

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object);
        break;
      
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object);
        break;
      
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object);
        break;
      
      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
      
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session) {
  console.log("Processing checkout.session.completed:", session.id);
  
  const { userId, userEmail, plan, replacesCancelledSubscription, oldSubscriptionId } = session.metadata;
  
  if (!userId || !userEmail || !plan) {
    console.error("Missing metadata in checkout session:", session.metadata);
    return;
  }

  // Update user subscription status
  const user = await User.findById(userId);
  if (!user) {
    console.error("User not found:", userId);
    return;
  }

  // If this replaces a cancelled subscription, delete the old one from Stripe
  if (replacesCancelledSubscription === 'true' && oldSubscriptionId) {
    try {
      console.log(`Deleting old cancelled subscription: ${oldSubscriptionId}`);
      await stripe.subscriptions.del(oldSubscriptionId);
      console.log(`Successfully deleted old subscription: ${oldSubscriptionId}`);
    } catch (error) {
      console.error(`Failed to delete old subscription ${oldSubscriptionId}:`, error.message);
      // Continue with creating new subscription even if deletion fails
    }
  }

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(session.subscription);
  
  await updateUserSubscription(user, subscription, plan, replacesCancelledSubscription === 'true');
}

async function handleSubscriptionCreated(subscription) {
  console.log("Processing customer.subscription.created:", subscription.id);
  
  const { userId, plan } = subscription.metadata;
  
  if (!userId || !plan) {
    console.error("Missing metadata in subscription:", subscription.metadata);
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    console.error("User not found:", userId);
    return;
  }

  await updateUserSubscription(user, subscription, plan);
}

async function handleSubscriptionUpdated(subscription) {
  console.log("Processing customer.subscription.updated:", subscription.id);
  
  const { userId, plan } = subscription.metadata;
  
  if (!userId || !plan) {
    console.error("Missing metadata in subscription:", subscription.metadata);
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    console.error("User not found:", userId);
    return;
  }

  await updateUserSubscription(user, subscription, plan);
}

async function handleSubscriptionDeleted(subscription) {
  console.log("Processing customer.subscription.deleted:", subscription.id);
  
  const { userId } = subscription.metadata;
  
  if (!userId) {
    console.error("Missing userId in subscription metadata:", subscription.metadata);
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    console.error("User not found:", userId);
    return;
  }

  // Set user subscription to cancelled/expired
  user.subscription = {
    ...user.subscription,
    status: 'cancelled',
    stripeSubscriptionId: null,
    stripeCustomerId: subscription.customer,
    cancelledAt: new Date()
  };

  await user.save();
  console.log(`Subscription cancelled for user: ${user.email}`);
}

async function handleInvoicePaymentSucceeded(invoice) {
  console.log("Processing invoice.payment_succeeded:", invoice.id);
  
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const { userId, plan } = subscription.metadata;
    
    if (userId && plan) {
      const user = await User.findById(userId);
      if (user) {
        await updateUserSubscription(user, subscription, plan);
      }
    }
  }
}

async function handleInvoicePaymentFailed(invoice) {
  console.log("Processing invoice.payment_failed:", invoice.id);
  
  if (invoice.subscription) {
    const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
    const { userId } = subscription.metadata;
    
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        // Update subscription status to indicate payment failure
        user.subscription = {
          ...user.subscription,
          status: 'past_due',
          lastPaymentFailed: new Date()
        };
        
        await user.save();
        console.log(`Payment failed for user: ${user.email}`);
      }
    }
  }
}

async function updateUserSubscription(user, stripeSubscription, plan, isReplacement = false) {
  const currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
  const currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
  
  // Update user subscription data
  user.subscription = {
    plan: plan,
    status: 'active', // ALWAYS set to active for new/updated subscriptions
    stripeSubscriptionId: stripeSubscription.id,
    stripeCustomerId: stripeSubscription.customer,
    stripePriceId: stripeSubscription.items.data[0]?.price?.id,
    currentPeriodStart: currentPeriodStart,
    currentPeriodEnd: currentPeriodEnd,
    expiresAt: currentPeriodEnd,
    startDate: isReplacement ? currentPeriodStart : (user.subscription?.startDate || currentPeriodStart),
    amount: stripeSubscription.items.data[0]?.price?.unit_amount / 100, // Convert from cents to dollars
    currency: 'USD',
    interval: stripeSubscription.items.data[0]?.price?.recurring?.interval,
    gateway: 'stripe',
    payerEmail: user.email,
    transactionId: stripeSubscription.latest_invoice,
    updatedAt: new Date(),
    // ALWAYS clear cancellation data for active subscriptions
    cancelledAt: null,
    // Reset usage for immediate plan changes
    usage: isReplacement ? {
      storage: user.subscription?.usage?.storage || 0,
      posts: 0,
      aiCalls: 0,
      aiTokens: 0,
      fileUploads: 0,
      customDomains: user.subscription?.usage?.customDomains || 0,
      teamMembers: user.subscription?.usage?.teamMembers || 0,
      analyticsViews: 0,
      emailsSent: 0,
    } : user.subscription?.usage || {}
  };

  await user.save();
  
  const actionType = isReplacement ? 'replaced' : 'updated';
  console.log(`Subscription ${actionType} for user: ${user.email} - Plan: ${plan} - Status: ${stripeSubscription.status}`);
}
