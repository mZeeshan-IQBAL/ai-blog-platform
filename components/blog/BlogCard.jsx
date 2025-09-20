// components/blog/BlogCard.jsx
"use client";

import Link from "next/link";
import Image from "next/image";

export default function BlogCard({ blog }) {
  const src = blog.coverImage || "/images/placeholder.jpg";
  const href = `/blog/${blog.slug || blog.id}`;
  const authorImage = blog.author?.image || null;

  // Estimate reading time (basic: 200 words/minute)
  const wordCount = blog.content?.split(" ").length || 0;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <article className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group border border-gray-100 flex flex-col">
      {/* Cover Image */}
      <div className="relative w-full aspect-video overflow-hidden bg-gray-100">
        <Image
          src={src}
          alt={blog.title || "Blog Cover"}
          fill
          className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw,
                 (max-width: 1200px) 50vw,
                 33vw"
        />
        {/* Category Badge */}
        {blog.category && (
          <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow">
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
                className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3 className="text-xl font-bold mb-2 line-clamp-2 leading-snug">
          <Link href={href} className="hover:text-blue-600 transition-colors">
            {blog.title}
          </Link>
        </h3>

        {/* Excerpt */}
        <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
          {blog.excerpt}
        </p>

        {/* Author Info */}
        <div className="flex items-center gap-3 mb-4">
          {authorImage ? (
            <Image
              src={authorImage}
              alt={blog.author?.name || "Author"}
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">
              {blog.author?.name?.charAt(0) || "A"}
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-medium text-gray-800 text-sm">
              {blog.author?.name || "Anonymous"}
            </span>
            <time className="text-xs text-gray-500">
              {new Date(blog.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}{" "}
              • {readingTime} min read
            </time>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto flex justify-between items-center text-sm text-gray-600 border-t pt-3">
          {/* Stats */}
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 hover:text-blue-600 transition">
              👍 {blog.likes || 0}
            </span>
            <span className="flex items-center gap-1 hover:text-blue-600 transition">
              💬 {blog.comments || 0}
            </span>
          </div>
          {/* CTA */}
          <Link
            href={href}
            className="text-blue-600 font-medium hover:underline text-sm"
          >
            Read More →
          </Link>
        </div>
      </div>
    </article>
  );
}
