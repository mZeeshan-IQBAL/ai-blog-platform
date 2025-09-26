// src/app/api/billing/cancel/route.js
export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/db';
import User from '@/models/User';
import { auth } from '@/lib/auth';

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
    
    user.subscription.status = 'cancelled';
    user.subscription.cancelledAt = new Date();
    await user.save();
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' }, 
      { status: 500 }
    );
  }
}