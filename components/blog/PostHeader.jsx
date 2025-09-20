// components/blog/PostHeader.jsx
// components/blog/PostHeader.jsx
import Image from "next/image";
import FollowButton from "@/components/engagement/FollowButton";
import { FaFacebookF } from "react-icons/fa";
import { FaTwitter } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";

export default function PostHeader({ blog }) {
  // Simple reading time estimation (200 words/minute)
  const wordCount = blog.content ? blog.content.split(" ").length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <header className="mb-8">
      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold mb-4">{blog.title}</h1>

      {/* Cover Image */}
      {blog.coverImage && (
        <div className="relative w-full h-64 md:h-80 lg:h-96 mb-6">
          <Image
            src={blog.coverImage}
            alt={`Cover image for ${blog.title}`}
            fill
            sizes="100vw"
            className="object-cover rounded-lg"
          />
        </div>
      )}

      {/* Meta Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between text-gray-500 text-sm gap-3">
        <div className="flex items-center gap-3">
          {/* Author Avatar */}
          {blog.author?.image && (
            <Image
              src={blog.author.image}
              alt={blog.author.name}
              width={36}
              height={36}
              className="rounded-full"
            />
          )}
          <p>
            By <span className="font-medium">{blog.author?.name || "Anonymous"}</span> •{" "}
            {new Date(blog.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            • {readingTime} min read
          </p>
        </div>

        {/* Follow button */}
        {blog.authorId && <FollowButton authorId={blog.authorId} />}
      </div>

      {/* Categories / Tags */}
      {blog.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {blog.tags.map((tag, idx) => (
            <span key={idx} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Social Share */}
      <div className="flex items-center gap-3 mt-6 text-gray-500">
        <span className="text-xs uppercase">Share:</span>
        <a
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(
            process.env.NEXT_PUBLIC_SITE_URL + "/blog/" + blog.slug
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-500"
        >
          <FaTwitter />
        </a>
        <a
          href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            process.env.NEXT_PUBLIC_SITE_URL + "/blog/" + blog.slug
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-600"
        >
          <FaFacebookF />
        </a>
        <a
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            process.env.NEXT_PUBLIC_SITE_URL + "/blog/" + blog.slug
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-700"
        >
          <FaLinkedinIn />
        </a>
      </div>
    </header>
  );
}
