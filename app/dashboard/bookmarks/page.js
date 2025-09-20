import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BlogCard from "@/components/blog/BlogCard";

export const metadata = {
  title: "Bookmarks | AI Knowledge Hub",
};

export default async function BookmarksPage() {
  const res = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/bookmarks`, { cache: "no-store" });
  const bookmarks = res.ok ? await res.json() : [];
  return (
    <div className="max-w-7xl mx-auto py-12 px-6">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Dashboard", href: "/dashboard" }, { label: "Bookmarks" }]} />
      </div>
      <h1 className="text-3xl font-bold mb-6">Your Bookmarks</h1>
      {bookmarks.length === 0 ? (
        <p className="text-gray-500">No bookmarks yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bookmarks.map((p) => (
            <BlogCard key={p._id || p.id} blog={{ id: p._id || p.id, slug: p.slug, title: p.title, coverImage: p.coverImage, createdAt: p.createdAt, excerpt: "" }} />
          ))}
        </div>
      )}
    </div>
  );
}