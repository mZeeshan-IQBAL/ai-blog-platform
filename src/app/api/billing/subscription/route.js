// src/app/api/billing/subscription/route.js
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { syncPostUsage } from '@/lib/usageSync';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDB();
    
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Auto-sync post usage to ensure accurate counts
    try {
      await syncPostUsage(user._id.toString());
      console.log('📊 Post usage synced for user:', user._id);
      // Refetch user to get updated usage data
      const updatedUser = await User.findById(user._id);
      if (updatedUser) {
        user.subscription = updatedUser.subscription;
      }
    } catch (syncError) {
      console.warn('⚠️ Failed to sync post usage:', syncError.message);
      // Continue without failing the request
    }

    // Safely extract subscription data with defaults
    const sub = user.subscription || {};
    
    // Determine effective status based on expiration and cancellation
    const now = new Date();
    let effectiveStatus = sub.status || 'inactive';
    
    if (sub.expiresAt) {
      const expirationDate = new Date(sub.expiresAt);
      
      if (expirationDate < now) {
        // Subscription has expired
        effectiveStatus = 'expired';
      } else if (sub.status === 'cancelled' && !sub.cancelledAt) {
        // This handles the edge case where status is 'cancelled' but cancelledAt is null
        // This usually means it's an old cancelled subscription that was replaced
        effectiveStatus = 'active';
      } else if (sub.status === 'cancelled' && sub.cancelledAt) {
        // Subscription is cancelled but still active until expiration
        effectiveStatus = 'cancelled_active';
      }
    }
    
    // CRITICAL FIX: If we have an active Stripe subscription ID and status is 'active',
    // always trust that over any other logic
    if (sub.status === 'active' && sub.stripeSubscriptionId) {
      effectiveStatus = 'active';
    }

    return NextResponse.json({ 
      subscription: {
        plan: sub.plan || 'free',
        status: effectiveStatus,
        amount: sub.amount || 0,
        currency: sub.currency || 'USD',
        startDate: sub.startDate || null,
        expiresAt: sub.expiresAt || null,
        payerEmail: sub.payerEmail || null,
        transactionId: sub.transactionId || null,
      },
      usage: sub.usage || {},
      limits: sub.limits || {}
    });
    
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription details' }, 
      { status: 500 }
    );
  }
}