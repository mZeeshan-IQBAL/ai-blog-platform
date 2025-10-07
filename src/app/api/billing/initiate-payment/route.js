// src/app/api/billing/initiate-payment/route.js
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import { auth } from "@/lib/auth";
import { stripe, getOrCreateStripePrice, STRIPE_PLANS } from "@/lib/stripe";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { plan, successUrl, cancelUrl } = body;

    // Validate plan
    if (!plan || !STRIPE_PLANS[plan]) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    // Validate URLs
    if (!successUrl || !cancelUrl) {
      return NextResponse.json({ error: "Missing success or cancel URL" }, { status: 400 });
    }

    // Security: Validate URL origins to prevent redirect attacks
    try {
      const successOrigin = new URL(successUrl).origin;
      const cancelOrigin = new URL(cancelUrl).origin;
      const expectedOrigin = new URL(req.url).origin;
      
      if (successOrigin !== expectedOrigin || cancelOrigin !== expectedOrigin) {
        return NextResponse.json({ error: "Invalid redirect URLs" }, { status: 400 });
      }
    } catch (e) {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
    }

    // Verify user exists in database
    await connectToDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has a cancelled subscription that can be immediately replaced
    const currentSubscription = user.subscription;
    const hasCancelledSubscription = currentSubscription?.status === 'cancelled' && 
                                   currentSubscription?.stripeSubscriptionId;

    // Get or create Stripe price for this plan
    const stripePrice = await getOrCreateStripePrice(plan);
    const planConfig = STRIPE_PLANS[plan];

    // If user has a cancelled subscription, we'll handle immediate plan change
    let checkoutSessionOptions = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePrice.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${successUrl}&session_id={CHECKOUT_SESSION_ID}&immediate_change=${hasCancelledSubscription}`,
      cancel_url: cancelUrl,
      customer_email: session.user.email,
      metadata: {
        userId: user._id.toString(),
        userEmail: session.user.email,
        plan: plan,
        platform: 'ai-blog-platform',
        replacesCancelledSubscription: hasCancelledSubscription ? 'true' : 'false',
        oldSubscriptionId: hasCancelledSubscription ? currentSubscription.stripeSubscriptionId : ''
      },
      subscription_data: {
        metadata: {
          userId: user._id.toString(),
          userEmail: session.user.email,
          plan: plan,
          platform: 'ai-blog-platform',
          replacesCancelledSubscription: hasCancelledSubscription ? 'true' : 'false'
        }
      }
    };

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create(checkoutSessionOptions);

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
      message: hasCancelledSubscription 
        ? "Checkout session created for immediate plan change" 
        : "Stripe checkout session created successfully",
      immediateChange: hasCancelledSubscription
    });

  } catch (error) {
    console.error("Stripe checkout session creation error:", error);
    return NextResponse.json({ 
      error: "Failed to create payment session",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
