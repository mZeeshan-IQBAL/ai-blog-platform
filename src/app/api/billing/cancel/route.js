// src/app/api/billing/cancel/route.js
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import { auth } from '@/lib/auth';
import { stripe } from '@/lib/stripe';

export async function POST() {
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

    // Only allow cancellation for active paid subscriptions
    const currentPlan = user.subscription?.plan;
    const isActive = user.subscription?.status === 'active';
    
    if (!currentPlan || currentPlan === 'free') {
      return NextResponse.json(
        { error: 'No paid subscription to cancel' }, 
        { status: 400 }
      );
    }

    if (!isActive) {
      return NextResponse.json(
        { error: 'Subscription is already cancelled or inactive' }, 
        { status: 400 }
      );
    }

    // Handle Stripe subscription cancellation
    if (user.subscription.stripeSubscriptionId) {
      try {
        // Cancel the subscription in Stripe (will remain active until end of billing period)
        await stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId);
        
        user.subscription.status = 'cancelled';
        user.subscription.cancelledAt = new Date();
        await user.save();
        
        return NextResponse.json({ 
          success: true, 
          status: 'cancelled',
          message: 'Stripe subscription cancelled successfully. Access will continue until the end of your billing period.'
        });
      } catch (stripeError) {
        console.error('Stripe cancellation error:', stripeError);
        return NextResponse.json({ 
          error: 'Failed to cancel Stripe subscription',
          details: process.env.NODE_ENV === 'development' ? stripeError.message : undefined
        }, { status: 500 });
      }
    } else {
      // Handle local subscription cancellation (for legacy EasyPaisa/JazzCash)
      user.subscription.status = 'cancelled';
      user.subscription.cancelledAt = new Date();
      await user.save();
      
      return NextResponse.json({ success: true, status: 'cancelled' });
    }
    
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' }, 
      { status: 500 }
    );
  }
}