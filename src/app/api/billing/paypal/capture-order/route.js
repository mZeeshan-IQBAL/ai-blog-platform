// src/app/api/billing/paypal/capture-order/route.js
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import { capturePayPalOrder } from "@/lib/paypal";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderId } = body || {};

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const capture = await capturePayPalOrder(orderId);

    if (!capture || (capture.status !== 'COMPLETED' && capture.status !== 'APPROVED')) {
      return NextResponse.json({ error: "Order not completed" }, { status: 400 });
    }

    // Extract details
    const purchaseUnit = capture.purchase_units?.[0];
    const customId = purchaseUnit?.custom_id;
    let custom = null;
    try {
      custom = customId ? JSON.parse(customId) : null;
    } catch (_) {}

    const payments = purchaseUnit?.payments;
    const cap = payments?.captures?.[0];
    const amountValue = cap?.amount?.value ? Number(cap.amount.value) : 0;
    const currency = cap?.amount?.currency_code || 'USD';

    const payerEmail = capture?.payer?.email_address || custom?.userEmail || session.user.email;
    const payerId = capture?.payer?.payer_id || undefined;

    const plan = custom?.plan || 'starter';

    await connectToDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update subscription for one-month access
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    // Create a completely new subscription, clearing any cancelled status
    user.subscription = {
      plan,
      status: 'active',
      interval: 'month',
      gateway: 'paypal',
      paypalOrderId: orderId,
      paypalPayerId: payerId,
      payerEmail,
      amount: amountValue,
      currency,
      startDate: now,
      expiresAt,
      updatedAt: now,
      // Clear any cancellation-related fields from previous subscription
      cancelledAt: null,
      stripeSubscriptionId: null,
      stripeCustomerId: null,
    };

    await user.save();

    return NextResponse.json({
      success: true,
      status: capture.status,
      orderId,
      amount: amountValue,
      currency,
      plan,
    });
  } catch (error) {
    console.error("PayPal capture order error:", error);
    return NextResponse.json(
      {
        error: "Failed to capture PayPal order",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
