// src/app/api/billing/initiate-payment/route.js
export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/db";
import User from "@/models/User";
import { auth } from "@/lib/auth";

// Define valid plans and their PKR amounts
const PLAN_PRICES = {
  starter: 1120,
  pro: 2240,
  business: 4200,
};

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate required fields
    const { plan, amount, currency, successUrl, cancelUrl } = body;

    if (!plan || !PLAN_PRICES[plan]) {
      return NextResponse.json({ error: "Invalid plan selected" }, { status: 400 });
    }

    if (!amount || amount !== PLAN_PRICES[plan]) {
      return NextResponse.json({ error: "Invalid amount for selected plan" }, { status: 400 });
    }

    if (!currency || currency !== "PKR") {
      return NextResponse.json({ error: "Currency must be PKR" }, { status: 400 });
    }

    if (!successUrl || !cancelUrl) {
      return NextResponse.json({ error: "Missing success or cancel URL" }, { status: 400 });
    }

    // Optional: Verify user exists
    await connectToDB();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Mock payment URL (replace with real EasyPaisa/JazzCash gateway)
    const mockPaymentUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/mock-payment?plan=${plan}&amount=${amount}`;

    return NextResponse.json({
      paymentUrl: mockPaymentUrl,
      message: "Payment initiated successfully",
    });
  } catch (error) {
    console.error("Payment initiation error:", error);
    return NextResponse.json({ error: "Failed to initiate payment" }, { status: 500 });
  }
}
