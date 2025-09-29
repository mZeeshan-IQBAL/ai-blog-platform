// components/blog/BlogCard.jsx
"use client";

import Link from "next/link";
import Image from "next/image";
import LikeButton from "@/components/likes/LikeButton";
import FollowButton from "@/components/engagement/FollowButton";

// ✅ Function to strip HTML tags and get clean text
function stripHtmlTags(html) {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ") // Remove HTML tags
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export default function BlogCard({ blog }) {
  if (!blog) {
    return null;
  }
  const src = blog.coverImage || "/images/placeholder.jpg";
  const href = `/blog/${blog.slug || blog._id}`;

  // Author info fallback - support both flat and nested author structures
  const authorName = blog.authorName || blog.author?.name || "Anonymous";
  const authorImage = blog.authorImage || blog.author?.image || null;
  const authorId = blog.authorId || blog.author?.id;

  // ✅ Get clean text excerpt
  const cleanContent = stripHtmlTags(blog.content);
  const excerpt =
    blog.summary ||
    (cleanContent.slice(0, 150) +
      (cleanContent.length > 150 ? "..." : ""));

  // Estimate reading time (200 words per minute)
  const wordCount = cleanContent
    .split(" ")
    .filter((word) => word.length > 0).length;
  const readingTime = Math.ceil(wordCount / 200) || 1;

  return (
    <article className="bg-card text-card-foreground rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group border border-border flex flex-col">
      {/* Cover Image */}
      <div className="relative w-full aspect-video overflow-hidden bg-muted">
        <Image
          src={src}
          alt={blog.title || "Blog Cover"}
          fill
          priority={true}
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw,
                 (max-width: 1200px) 50vw,
                 33vw"
        />
        {/* Category Badge */}
        {blog.category && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-full shadow">
            {blog.category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        {/* Tags */}
        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {blog.tags.slice(0, 3).map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full bg-accent text-accent-foreground text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-bold mb-2 line-clamp-2 leading-snug">
          <Link
            href={href}
            className="hover:text-primary transition-colors"
          >
            {blog.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">
          {excerpt}
        </p>

        {/* Author Info - ✅ Updated with clickable profile */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Author Avatar - Clickable */}
            <Link
              href={`/profile/${authorId}`}
              className="flex-shrink-0 hover:opacity-80 transition-opacity"
              title="View Profile"
            >
              {authorImage ? (
                <Image
                  src={authorImage}
                  alt={authorName}
                  width={32}
                  height={32}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                  {authorName.charAt(0)}
                </div>
              )}
            </Link>

            <div className="flex flex-col">
              {/* Author Name - Clickable */}
              <Link
                href={`/profile/${authorId}`}
                className="font-medium text-sm hover:text-primary transition-colors"
                title="View Profile"
              >
                {authorName}
              </Link>
              <time className="text-xs text-muted-foreground">
                {new Date(blog.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}{" "}
                • {readingTime} min read
              </time>
            </div>
          </div>

          {/* Follow Button */}
          {authorId && <FollowButton authorId={authorId} />}
        </div>

        {/* Footer */}
        <div className="mt-auto flex justify-between items-center text-sm text-muted-foreground border-t border-border pt-3">
          <div className="flex items-center gap-3">
            <LikeButton
              postId={blog._id || blog.id}
              initialLikes={blog.likes?.length || blog.likes || 0}
              initiallyLiked={false}
            />
            <span className="flex items-center gap-1 hover:text-foreground transition">
              💬 {blog.comments?.length || 0}
            </span>
          </div>
          <Link
            href={href}
            className="text-primary font-medium hover:underline text-sm"
          >
            Read More →
          </Link>
        </div>
      </div>
    </article>
  );
}
