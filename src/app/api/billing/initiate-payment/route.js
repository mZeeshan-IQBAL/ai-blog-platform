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

    // Get or create Stripe price for this plan
    const stripePrice = await getOrCreateStripePrice(plan);
    const planConfig = STRIPE_PLANS[plan];

    // Create Stripe checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePrice.id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${successUrl}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
      customer_email: session.user.email,
      metadata: {
        userId: user._id.toString(),
        userEmail: session.user.email,
        plan: plan,
        platform: 'ai-blog-platform'
      },
      subscription_data: {
        metadata: {
          userId: user._id.toString(),
          userEmail: session.user.email,
          plan: plan,
          platform: 'ai-blog-platform'
        }
      }
    });

    return NextResponse.json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id,
      message: "Stripe checkout session created successfully",
    });

  } catch (error) {
    console.error("Stripe checkout session creation error:", error);
    return NextResponse.json({ 
      error: "Failed to create payment session",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    }, { status: 500 });
  }
}
