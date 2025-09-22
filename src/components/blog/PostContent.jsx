// components/blog/PostContent.jsx
"use client";

export default function PostContent({ content }) {
  if (!content) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No content available for this post.</p>
      </div>
    );
  }

  // Since TipTap saves HTML, render it directly
  return (
    <article className="prose prose-lg max-w-none mx-auto">
      <div 
        className="prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-ul:list-disc prose-ol:list-decimal prose-li:my-1"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </article>
  );
}