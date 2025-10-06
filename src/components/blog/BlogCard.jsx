// components/blog/BlogCard.jsx
"use client";

import Link from "next/link";
import Image from "next/image";
import LikeButton from "@/components/likes/LikeButton";
import FollowButton from "@/components/engagement/FollowButton";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Avatar, { AvatarSizes } from "@/components/ui/Avatar";

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
  // Sanitize author image: treat non-URL strings as invalid so the Avatar falls back gracefully
  const rawAuthorImage = blog.authorImage || blog.author?.image;
  const authorImage = typeof rawAuthorImage === 'string' && /^https?:\/\//.test(rawAuthorImage) ? rawAuthorImage : undefined;
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
    <article className="feature-card group hover:-translate-y-0.5">
      {/* Cover Image - Mintlify style */}
      <div className="relative w-full h-48 overflow-hidden bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl mb-4">
        <Image
          src={src}
          alt={blog.title || "Blog Cover"}
          fill
          className="object-cover object-center group-hover:scale-[1.02] transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Category Badge - Clean style */}
        {blog.category && (
          <div className="absolute top-3 left-3">
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-white/90 text-gray-800 rounded-md shadow-sm backdrop-blur-sm">
              {blog.category}
            </span>
          </div>
        )}
      </div>

      {/* Content - Mintlify clean style */}
      <div className="space-y-3">
        {/* Category eyebrow */}
        {blog.category && (
          <div className="eyebrow-badge">
            <span className="text-xs font-medium">{blog.category.toUpperCase()}</span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-base font-bold leading-tight">
          <Link
            href={href}
            className="hover:text-primary transition-colors line-clamp-2"
          >
            {blog.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
          {excerpt}
        </p>

        {/* Tags - clean horizontal layout */}
        {blog.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {blog.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="inline-flex items-center px-2 py-0.5 text-xs font-medium text-muted-foreground bg-muted/50 rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Author and meta info - clean layout */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            {/* Author Avatar */}
            <Avatar
              src={authorImage}
              alt={authorName}
              size={AvatarSizes.sm}
              userId={authorId}
              className="w-6 h-6"
            />

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {/* Author Name */}
              <Link
                href={`/profile/${authorId}`}
                className="font-medium hover:text-primary transition-colors"
                title="View Profile"
              >
                {authorName}
              </Link>
              <span>•</span>
              <time>
                {new Date(blog.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </time>
              <span>•</span>
              <span>{readingTime} min read</span>
            </div>
          </div>

          {/* Minimal engagement indicators */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {blog.likes?.length || blog.likes || 0}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {blog.comments?.length || 0}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
