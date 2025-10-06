// src/components/homepage/ForYou.jsx
import Link from "next/link";
import BlogCard from "@/components/blog/BlogCard";
import { Button } from "@/components/ui/Button";
import { connectToDB } from "@/lib/db";
import Post from "@/models/Post";

export default async function ForYou() {
  try {
    // Direct database fetch instead of HTTP request to avoid build issues
    await connectToDB();

    // Fetch recent posts
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

    // Backfill/sanitize author info for accurate avatars
    const isValidUrl = (url) => typeof url === 'string' && /^https?:\/\//.test(url);
    if (Array.isArray(posts) && posts.length) {
      try {
        const { default: User } = await import("@/models/User");
        const authorIds = Array.from(new Set(posts.map(p => String(p.authorId)).filter(Boolean)));
        if (authorIds.length) {
          const users = await User.find({ _id: { $in: authorIds } }).select("name image").lean();
          const userMap = new Map(users.map(u => [String(u._id), u]));
          for (const p of posts) {
            const u = userMap.get(String(p.authorId));
            if (!p.authorName || p.authorName === "") p.authorName = u?.name || p.authorName || "Anonymous";
            if (!isValidUrl(p.authorImage)) p.authorImage = isValidUrl(u?.image) ? u.image : "";
          }
        }
      } catch (_) {}
    }
    
    if (!Array.isArray(posts) || posts.length === 0) {
      // Instead of returning null, show a friendly message
      return (
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="heading-responsive font-bold">For you</h2>
              <Button as="link" href="/blog" variant="link" size="sm">See all</Button>
            </div>
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No posts to show right now</p>
              <Button as="link" href="/blog" variant="link" size="sm">Browse all posts</Button>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="heading-responsive font-bold">For you</h2>
            <Button as="link" href="/blog" variant="link" size="sm">See all</Button>
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
