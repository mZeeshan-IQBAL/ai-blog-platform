// src/app/api/billing/sync-usage/route.js
export const dynamic = "force-dynamic";

import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { syncAllUsage, getUserUsageStats } from '@/lib/usageSync';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from session
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }

    console.log(`🔄 Manual usage sync requested for user: ${userId}`);

    // Sync all usage for the user
    const syncResult = await syncAllUsage(userId);
    
    // Get updated usage stats
    const usageStats = await getUserUsageStats(userId);

    return NextResponse.json({
      success: true,
      message: 'Usage synced successfully',
      syncResult,
      currentUsage: usageStats.recordedUsage,
      actualCounts: usageStats.actualCounts,
      discrepancies: usageStats.discrepancies
    });

  } catch (error) {
    console.error('❌ Error syncing usage:', error);
    return NextResponse.json(
      { 
        error: 'Failed to sync usage', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user ID from session
    const userId = session.user.id;
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 400 });
    }

    // Get usage statistics without syncing
    const usageStats = await getUserUsageStats(userId);

    return NextResponse.json({
      success: true,
      ...usageStats
    });

  } catch (error) {
    console.error('❌ Error getting usage stats:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get usage statistics', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}