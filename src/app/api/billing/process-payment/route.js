// src/app/api/billing/process-payment/route.js
import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import { auth } from '@/lib/auth';

export async function POST(request) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { paymentId, plan, payerInfo, amount } = body;

    const nextBillingDate = new Date();
    nextBillingDate.setDate(nextBillingDate.getDate() + 30);

    user.subscription = {
      plan: plan,
      status: 'active',
      paymentId: paymentId,
      payerEmail: payerInfo.email_address,
      amount: amount,
      startDate: new Date(),
      nextBillingDate: nextBillingDate,
      usage: user.subscription?.usage || {
        storage: 0,
        posts: 0,
        apiCalls: 0
      }
    };

    await user.save();

    return NextResponse.json({ 
      success: true, 
      message: 'Payment processed successfully',
      subscription: user.subscription
    });
    
  } catch (error) {
    console.error('Payment processing error:', error);
    return NextResponse.json(
      { error: 'Payment processing failed: ' + error.message }, 
      { status: 500 }
    );
  }
}