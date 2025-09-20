// components/TagList.jsx
import Link from "next/link";

export default function TagList({ tags }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`} className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs hover:bg-blue-200">
          #{tag}
        </Link>
      ))}
    </div>
  );
}
