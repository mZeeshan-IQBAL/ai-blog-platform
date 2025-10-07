// src/app/api/billing/verify-session/route.js
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { auth } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(req) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
    }

    // Retrieve the checkout session from Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!checkoutSession) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 404 });
    }

    // Verify the session belongs to the authenticated user
    if (checkoutSession.customer_email !== session.user.email) {
      return NextResponse.json({ error: "Session does not belong to user" }, { status: 403 });
    }

    // Check if payment was successful
    if (checkoutSession.payment_status !== 'paid') {
      return NextResponse.json({ 
        verified: false, 
        error: "Payment not completed",
        paymentStatus: checkoutSession.payment_status 
      });
    }

    // Get subscription details if it's a subscription
    let subscriptionData = null;
    if (checkoutSession.subscription) {
      const subscription = await stripe.subscriptions.retrieve(checkoutSession.subscription);
      subscriptionData = {
        id: subscription.id,
        status: subscription.status,
        plan: checkoutSession.metadata?.plan,
        currentPeriodStart: new Date(subscription.current_period_start * 1000),
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        amount: subscription.items.data[0]?.price?.unit_amount / 100,
        currency: subscription.items.data[0]?.price?.currency?.toUpperCase(),
        interval: subscription.items.data[0]?.price?.recurring?.interval
      };

      // Update user subscription in database
      await connectToDB();
      const user = await User.findOne({ email: session.user.email });
      if (user) {
        user.subscription = {
          ...user.subscription,
          plan: checkoutSession.metadata?.plan || 'starter',
          status: subscription.status,
          stripeSubscriptionId: subscription.id,
          stripeCustomerId: subscription.customer,
          stripePriceId: subscription.items.data[0]?.price?.id,
          currentPeriodStart: subscriptionData.currentPeriodStart,
          currentPeriodEnd: subscriptionData.currentPeriodEnd,
          expiresAt: subscriptionData.currentPeriodEnd,
          amount: subscriptionData.amount,
          currency: 'PKR',
          interval: subscriptionData.interval,
          payerEmail: session.user.email,
          transactionId: subscription.latest_invoice,
          updatedAt: new Date()
        };
        await user.save();
      }
    }

    return NextResponse.json({
      verified: true,
      sessionId: checkoutSession.id,
      paymentStatus: checkoutSession.payment_status,
      subscription: subscriptionData,
      metadata: checkoutSession.metadata
    });

  } catch (error) {
    console.error("Session verification error:", error);
    return NextResponse.json({ 
      error: "Failed to verify session",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}