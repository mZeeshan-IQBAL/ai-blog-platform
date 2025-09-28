// app/blog/[id]/page.js
import { getBlog } from "@/lib/api";
import { incrementViews } from "@/lib/analytics";
import PostHeader from "@/components/blog/PostHeader";
import PostContent from "@/components/blog/PostContent";
import LikeButton from "@/components/likes/LikeButton";
import ReactionBar from "@/components/engagement/ReactionBar";
import BookmarkButton from "@/components/engagement/BookmarkButton";
import CommentSection from "@/components/comments/CommentSection";
import { notFound } from "next/navigation";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import ReadTracker from "@/components/analytics/ReadTracker";

// ✅ Metadata with await params
export async function generateMetadata({ params }) {
  const { id } = await params;
  const blog = await getBlog(id);
  if (!blog) return { title: "Post Not Found" };

  return {
    title: `${blog.title} | AI Knowledge Hub`,
    description: blog.excerpt || blog.summary || "",
  };
}

// ✅ Blog Post Page
export default async function BlogPostPage({ params }) {
  const { id } = await params;
  const blog = await getBlog(id);

  if (!blog) return notFound();

  // ✅ Track views in MongoDB
  await incrementViews(blog.id);

  // Related posts (best-effort)
  let related = [];
  try {
    const { getRelatedPosts } = await import("@/lib/api");
    related = await getRelatedPosts(id, 6);
  } catch (e) {
    related = [];
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Blog", href: "/blog" },
            { label: blog.title },
          ]}
        />
        <Link
          href="/blog"
          className="md:hidden inline-flex items-center gap-2 border border-gray-200 px-3 py-2 rounded hover:bg-gray-50"
        >
          ← Back to Blog
        </Link>
        <Link
          href="/blog"
          className="hidden md:inline-flex items-center gap-2 border border-gray-200 px-3 py-2 rounded hover:bg-gray-50"
        >
          ← Back to Blog
        </Link>
      </div>

      {/* Header */}
      <PostHeader blog={blog} />

      {/* Enhanced Engagement Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 p-4 bg-gray-50 rounded-xl border">
        <div className="flex items-center gap-3 flex-wrap">
          <LikeButton
            postId={blog.id}
            initialLikes={blog.likes?.length || blog.likes || 0}
            initiallyLiked={false} // Component will check user's like status
          />
          <ReactionBar targetType="post" targetId={blog.id} />
          <BookmarkButton postId={blog.id} />
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>👁️ {blog.views || 0} views</span>
          <span>📅 {new Date(blog.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Blog Content */}
      <PostContent content={blog.content} />

      {/* Reading tracker */}
      <ReadTracker postId={blog.id} />

      <hr className="my-8" />

      {/* Comments Section */}
      <CommentSection postId={blog.id} />

      {related?.length ? (
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4">Related posts</h3>
          <div className="grid gap-6 sm:grid-cols-2">
            {related.map((p) => (
              <div key={p.id} className="border rounded p-4">
                <a href={`/blog/${p.slug}`} className="font-medium hover:underline">{p.title}</a>
                <p className="text-sm text-gray-600 mt-1">{p.excerpt}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
