// app/dashboard/analytics/page.js
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

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
        <Link href="/blog/create" className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
          <h3 className="font-bold mb-2">✍️ Create a Post</h3>
          <p className="text-gray-500">Write and publish new blogs.</p>
        </Link>
        <Link href="/dashboard/analytics" className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
          <h3 className="font-bold mb-2">📊 View Analytics</h3>
          <p className="text-gray-500">Track engagement on your posts.</p>
        </Link>
        <Link href="/dashboard/bookmarks" className="p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
          <h3 className="font-bold mb-2">🔖 Bookmarks</h3>
          <p className="text-gray-500">See your saved posts.</p>
        </Link>
      </div>
    </div>
  );
}
