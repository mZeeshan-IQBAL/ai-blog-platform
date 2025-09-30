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
    
    if (!Array.isArray(posts) || posts.length === 0) {
      // Instead of returning null, show a friendly message
      return (
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">For you</h2>
              <Link href="/blog" className="text-blue-600 hover:underline">See all</Link>
            </div>
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No posts to show right now</p>
              <Link href="/blog" className="text-blue-600 hover:underline">Browse all posts</Link>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">For you</h2>
            <Link href="/blog" className="text-blue-600 hover:underline">See all</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogCard key={post._id || post.id} blog={{
                _id: String(post._id || post.id),
                id: String(post._id || post.id),
                slug: post.slug,
                title: post.title,
                content: post.content || '',
                summary: post.summary,
                authorName: post.authorName,
                authorImage: post.authorImage,
                authorId: post.authorId,
                coverImage: post.coverImage,
                category: post.category,
                tags: post.tags || [],
                views: post.views || 0,
                likes: post.likes || [],
                comments: post.comments || [],
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
