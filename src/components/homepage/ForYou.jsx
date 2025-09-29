// src/components/homepage/ForYou.jsx
import Link from "next/link";
import BlogCard from "@/components/blog/BlogCard";
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";

export default async function ForYou() {
  try {
    // Direct database fetch instead of HTTP request to avoid build issues
    await connectToDB();
    
    const posts = await Post.find({ 
      published: true, 
      $or: [
        { scheduledAt: null }, 
        { scheduledAt: { $lte: new Date() } }
      ] 
    })
    .sort({ createdAt: -1 })
    .limit(6)
    .lean();
    
    if (!Array.isArray(posts) || posts.length === 0) return null;

    return (
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">For you</h2>
            <Link href="/blog" className="text-blue-600 hover:underline">See all</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
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
  } catch (err) {
    console.error('ForYou fetch error:', err);
    return null;
  }
}
