// app/search/page.js
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get('q') || "");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Debounced search function
  const searchPosts = useCallback(async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) throw new Error('Search failed');
      
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError("Failed to search. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchPosts(query);
      
      // Update URL without causing navigation
      if (query.trim()) {
        const newUrl = `/search?q=${encodeURIComponent(query)}`;
        window.history.replaceState(null, '', newUrl);
      } else {
        window.history.replaceState(null, '', '/search');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, searchPosts]);

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    router.replace('/search');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
        </div>

        {/* Search Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Articles</h1>
          <p className="text-gray-600">Find articles by title, content, tags, or category</p>
        </div>

        {/* Search Input */}
        <div className="relative mb-8">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, content, tags, or category..."
              className="w-full pl-10 pr-12 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              autoFocus
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Search Stats */}
          {query.trim() && (
            <div className="mt-3 text-sm text-gray-600">
              {loading ? (
                <span>Searching...</span>
              ) : (
                <span>{results.length} result{results.length !== 1 ? 's' : ''} for &quot;{query}&quot;</span>
              )}
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* No Results */}
        {!loading && query.trim() && results.length === 0 && !error && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600 mb-6">
              Try different keywords or browse our <Link href="/blog" className="text-blue-600 hover:underline">latest articles</Link>
            </p>
            <button
              onClick={clearSearch}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Search
            </button>
          </div>
        )}

        {/* Search Results */}
        {!loading && results.length > 0 && (
          <div className="space-y-6">
            {results.map((post) => (
              <article
                key={post._id || post.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Cover Image */}
                    {post.coverImage && (
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                        <Link 
                          href={`/blog/${post.slug || post._id}`}
                          className="hover:text-blue-600 transition-colors"
                        >
                          {post.title}
                        </Link>
                      </h2>

                      {/* Excerpt */}
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {post.excerpt || post.summary || "No description available"}
                      </p>

                      {/* Meta Info */}
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {post.authorName && (
                          <div className="flex items-center gap-2">
                            {post.authorImage && (
                              <Image
                                src={post.authorImage}
                                alt={post.authorName}
                                width={20}
                                height={20}
                                className="rounded-full"
                              />
                            )}
                            <span>{post.authorName}</span>
                          </div>
                        )}
                        
                        {post.createdAt && (
                          <time>
                            {new Date(post.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </time>
                        )}
                        
                        {post.views && (
                          <span>{post.views} views</span>
                        )}
                      </div>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {post.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!query.trim() && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Start your search</h3>
            <p className="text-gray-600">
              Enter keywords to find articles, tutorials, and insights
            </p>
          </div>
        )}
      </div>
    </div>
  );
}