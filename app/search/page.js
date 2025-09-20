// app/search/page.js
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (query.trim()) {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(res => res.json())
        .then(setResults);
    }
  }, [query]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-4">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
      </div>
      <h1 className="text-3xl font-bold mb-6">Search Posts</h1>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by title, content, or tags..."
        className="w-full p-3 border rounded mb-6"
      />
      <div className="space-y-4">
        {results.map(post => (
          <div key={post._id} className="border p-4 rounded">
            <h2 className="text-xl font-semibold">{post.title}</h2>
            <p className="text-gray-600">{post.summary}</p>
            <Link href={`/blog/${post._id}`} className="text-blue-500 hover:underline">
              Read more →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}