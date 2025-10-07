// app/dashboard/page.js
"use client";

import { useSession } from 'next-auth/react';
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";
import SubscriptionStatus from "@/components/subscription/SubscriptionStatus";

export default function DashboardPage() {
  const { data: session } = useSession();
  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Dashboard" }]} />
      </div>
      
      {/* Welcome Section */}
      <div className="flex items-center gap-4 mb-6">
        {session?.user?.image && (
          <img
            src={session.user.image}
            alt={session.user.name}
            className="w-12 h-12 rounded-full"
          />
        )}
        <div>
          <h2 className="text-2xl font-semibold">Welcome back{session?.user?.name ? `, ${session.user.name}` : ''}! 🎉</h2>
          <p className="text-gray-600">
            Here you can manage your blog posts, track your activity, and explore analytics.
          </p>
        </div>
      </div>

      {/* Subscription Status */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Your Subscription</h3>
        <SubscriptionStatus showUsage={true} showFeatures={false} compact={true} />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/blog/create" className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background">
          <Card className="card-hover card-padding">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✍️</span>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">Create a Post</h3>
                <p className="text-sm text-muted-foreground">Write and publish new blogs.</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/dashboard/analytics" className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background">
          <Card className="card-hover card-padding">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📊</span>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">View Analytics</h3>
                <p className="text-sm text-muted-foreground">Track engagement on your posts.</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/dashboard/bookmarks" className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background">
          <Card className="card-hover card-padding">
            <div className="flex items-start gap-3">
              <span className="text-2xl">🔖</span>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">Bookmarks</h3>
                <p className="text-sm text-muted-foreground">See your saved posts.</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/billing/manage" className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background">
          <Card className="card-hover card-padding">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💳</span>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">Manage Subscription</h3>
                <p className="text-sm text-muted-foreground">View billing details and manage your subscription.</p>
              </div>
            </div>
          </Card>
        </Link>
        <Link href="/pricing" className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background">
          <Card className="card-hover card-padding">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⬆️</span>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">Upgrade</h3>
                <p className="text-sm text-muted-foreground">View all plans.</p>
              </div>
            </div>
          </Card>
        </Link>
        </div>
      </div>
    </div>
  );
}
