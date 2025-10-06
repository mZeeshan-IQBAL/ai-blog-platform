// components/TagList.jsx
import Link from "next/link";

export default function TagList({ tags = [], limit }) {
  if (!tags.length) {
    return (
      <p className="text-gray-500 italic text-sm">
        No tags assigned
      </p>
    );
  }

  const visibleTags = limit ? tags.slice(0, limit) : tags;
  const hiddenCount = limit && tags.length > limit ? tags.length - limit : 0;

  return (
    <div className="flex flex-wrap gap-2">
      {visibleTags.map((tag) => (
        <Link
          key={tag}
          href={`/tags/${encodeURIComponent(tag)}`}
          aria-label={`View posts tagged with ${tag}`}
          className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium 
                     border border-primary/20 shadow-sm
                     hover:bg-primary/20 hover:text-primary 
                     transition-colors duration-200"
        >
          #{tag}
        </Link>
      ))}

      {hiddenCount > 0 && (
        <span className="text-gray-500 text-xs px-2 py-1">
          +{hiddenCount} more
        </span>
      )}
    </div>
  );
}
