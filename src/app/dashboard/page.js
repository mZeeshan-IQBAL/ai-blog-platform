// app/dashboard/analytics/page.js
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "User Dashboard | AI Knowledge Hub",
  description: "Manage your profile, posts, and more.",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Dashboard" }]} />
      </div>
      <h2 className="text-xl font-semibold">Welcome to your Dashboard 🎉</h2>
      
      <p className="text-gray-600">
        Here you can manage your blog posts, track your activity, and explore analytics.
      </p>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-6 mt-6">
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
      </div>
    </div>
  );
}
