// components/blog/BlogCard.jsx
import Link from "next/link";
import Image from "next/image";

export default function BlogCard({ blog }) {
  const src = blog.coverImage || blog.image || "/placeholder.jpg";
  const href = `/blog/${blog.slug || blog.id}`;
  return (
    <article className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
      <div className="relative w-full h-48">
        <Image
          src={src}
          alt={blog.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold mb-2">
          <Link href={href} className="hover:text-blue-600">
            {blog.title}
          </Link>
        </h3>
        <p className="text-gray-600 mb-3 line-clamp-3">{blog.excerpt}</p>

        {/* Author + Date */}
        <div className="flex justify-between items-center text-gray-500 text-sm">
          <span>{blog.author?.name || "Anonymous"}</span>
          <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
        </div>

        {/* ✅ Likes & Comments row */}
        <div className="flex justify-start items-center gap-4 mt-3 text-sm text-gray-600">
          <span>👍 {blog.likes}</span>
          <span>💬 {blog.comments}</span>
        </div>
      </div>
    </article>
  );
}
