// src/components/homepage/ForYou.jsx
import Link from "next/link";
import BlogCard from "@/components/blog/BlogCard";

export default async function ForYou() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL || "http://localhost:3000"}/api/feed`, { cache: "no-store" });
  // Fallback to relative fetch in server environment if base URL missing
  const posts = res.ok ? await res.json() : [];

  if (!posts.length) return null;

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">For you</h2>
          <Link href="/blog" className="text-blue-600 hover:underline">See all</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.slice(0, 6).map((post) => (
            <BlogCard key={post._id || post.id} post={{
              id: String(post._id || post.id),
              slug: post.slug,
              title: post.title,
              excerpt: post.summary || (post.content ? post.content.replace(/<[^>]*>/g, '').slice(0, 140) + '...' : ''),
              author: { name: post.authorName, image: post.authorImage },
              coverImage: post.coverImage,
              tags: post.tags || [],
              views: post.views || 0,
              createdAt: post.createdAt,
            }} />
          ))}
        </div>
      </div>
    </section>
  );
}