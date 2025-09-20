// components/BlogCard.jsx
import Image from "next/image";
import FollowButton from "@/components/engagement/FollowButton";

export default function PostHeader({ blog }) {
  return (
    <header className="mb-8">
      <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
      {blog.coverImage && (
        <div className="relative w-full h-64 mb-6">
          <Image src={blog.coverImage} alt={blog.title} fill sizes="100vw" className="object-cover rounded-lg" />
        </div>
      )}
      <div className="flex items-center justify-between text-gray-500">
        <p>
          By {blog.author?.name || "Anonymous"} • {new Date(blog.createdAt).toLocaleDateString()}
        </p>
        {blog.authorId && <FollowButton authorId={blog.authorId} />}
      </div>
    </header>
  );
}
