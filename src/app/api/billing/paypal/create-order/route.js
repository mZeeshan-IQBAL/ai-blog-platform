// src/app/api/billing/paypal/create-order/route.js
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import { createPayPalOrder } from "@/lib/paypal";
import { PAYPAL_PLANS } from "@/config/payments";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { plan, successUrl, cancelUrl } = body || {};

    if (!plan || !PAYPAL_PLANS[plan]) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    await connectToDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const order = await createPayPalOrder({
      plan,
      userId: user._id.toString(),
      userEmail: session.user.email,
      returnUrl: successUrl || `${new URL(req.url).origin}/billing/success?plan=${plan}&gateway=paypal`,
      cancelUrl: cancelUrl || `${new URL(req.url).origin}/billing?plan=${plan}`,
    });

    const approveLink = order?.links?.find(l => l.rel === 'approve')?.href || null;

    return NextResponse.json({
      orderId: order?.id,
      status: order?.status,
      approveUrl: approveLink,
      message: "PayPal order created successfully",
    });
  } catch (error) {
    console.error("PayPal create order error:", error);
    return NextResponse.json(
      {
        error: "Failed to create PayPal order",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}
