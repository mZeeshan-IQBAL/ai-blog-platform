// components/blog/PostHeader.jsx
import Image from "next/image";
import Link from "next/link";
import FollowButton from "@/components/engagement/FollowButton";
import { FaFacebookF, FaTwitter, FaLinkedinIn } from "react-icons/fa";
import ClientReportButton from "./ClientReportButton";
import Avatar, { AvatarSizes } from "@/components/ui/Avatar";

export default function PostHeader({ blog }) {
  // Simple reading time estimation (200 words/minute)
  const wordCount = blog.content ? blog.content.split(" ").length : 0;
  const readingTime = Math.ceil(wordCount / 200);

  const authorId = blog.authorId || blog.author?.id;
  const authorName = blog.author?.name || blog.authorName || "Anonymous";
  const authorImage = blog.author?.image || blog.authorImage;

  return (
    <header className="mb-8">
      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
        {blog.title}
      </h1>

      {/* Cover Image */}
      {blog.coverImage && (
        <div className="relative w-full h-64 md:h-80 lg:h-96 mb-6">
          <Image
            src={blog.coverImage}
            alt={`Cover image for ${blog.title}`}
            fill
            sizes="100vw"
            className="object-cover rounded-xl shadow-lg"
            priority
          />
        </div>
      )}

      {/* Meta Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between text-muted-foreground text-sm gap-4 mb-6">
        <div className="flex items-center gap-3">
          {/* Author Avatar - Clickable with fallback */}
          <Avatar
            src={authorImage}
            alt={authorName}
            size={AvatarSizes.sm}
            userId={authorId}
            className="ring-2 ring-background"
          />
          
          <div>
            {/* Author Name - Clickable */}
            <Link 
              href={`/profile/${authorId}`}
              className="font-medium hover:text-primary transition-colors"
            >
              {authorName}
            </Link>
            <p className="text-muted-foreground">
              {new Date(blog.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}{" "}
              • {readingTime} min read
            </p>
          </div>
        </div>

        {/* Follow button */}
        {authorId && (
          <FollowButton authorId={authorId} />
        )}
      </div>

      {/* Categories / Tags */}
      {blog.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {blog.tags.map((tag, idx) => (
            <Link
              key={idx}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="bg-accent text-accent-foreground px-3 py-1 rounded-full text-xs font-medium hover:bg-accent/80 transition-colors"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Social Share */}
      <div className="flex items-center gap-4 py-3 px-4 bg-card border border-border rounded-lg">
        <span className="text-sm font-medium">Share:</span>
        <div className="flex gap-3">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(
              typeof window !== 'undefined' ? window.location.href : ''
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-accent"
            aria-label="Share on Twitter"
          >
            <FaTwitter size={16} />
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
              typeof window !== 'undefined' ? window.location.href : ''
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-accent"
            aria-label="Share on Facebook"
          >
            <FaFacebookF size={16} />
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
              typeof window !== 'undefined' ? window.location.href : ''
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors p-2 rounded-full hover:bg-accent"
            aria-label="Share on LinkedIn"
          >
            <FaLinkedinIn size={16} />
          </a>
        </div>
        <div className="ml-auto">
<ClientReportButton targetType="post" targetId={blog.id || blog._id || blog.slug} />
        </div>
      </div>
    </header>
  );
}