// app/blog/page.js
import Link from "next/link";
import { getAllBlogs, getAllTags } from "@/lib/api";
import BlogCard from "@/components/blog/BlogCard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export const metadata = {
  title: "All Blogs | AI Knowledge Hub",
  description: "Explore community contributed blogs on AI and innovation.",
};

export default async function BlogPage() {
  let blogs = [];
  let error = null;
  let tags = [];

  try {
    [blogs, tags] = await Promise.all([getAllBlogs(), getAllTags()]);
  } catch (err) {
    error = "Failed to fetch blogs. Please try again later.";
  }

  return (
    <div className="max-w-7xl mx-auto py-16 px-6">
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-8xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
          Explore Our <span className="bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">Blogs</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Knowledge shared by the community.
        </p>

        {/* Search Section - Prominently Placed */}
        <div className="max-w-2xl mx-auto mb-8">
          <Link
            href="/search"
            className="group relative inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
          >
            {/* Animated background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            
            {/* Search icon with animation */}
            <svg 
              className="relative w-5 h-5 group-hover:rotate-12 transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2.5" 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            
            <span className="relative">Search Any Article</span>
            
            {/* Arrow icon */}
            <svg 
              className="relative w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2.5" 
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
          
          {/* Decorative text */}
          <p className="mt-3 text-sm text-gray-500">
            Quick search through all articles and resources
          </p>
        </div>
      </div>

      {/* Tags Section with Enhanced Styling */}
      {tags.length > 0 && (
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-sm font-medium text-gray-500">Popular Topics:</span>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            {tags.slice(0, 20).map((t) => (
              <Link
                key={t}
                href={`/tags/${encodeURIComponent(t)}`}
                className="group relative px-4 py-2 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 text-sm font-medium text-gray-700 hover:text-gray-900 transition-all duration-200"
              >
                <span className="relative flex items-center gap-1">
                  <span className="text-gray-400 group-hover:text-blue-500 transition-colors">#</span>
                  {t}
                </span>
              </Link>
            ))}

            {tags.length > 20 && (
              <Link 
                href="/tags" 
                className="px-4 py-2 rounded-full text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 flex items-center gap-1"
              >
                View all tags
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-8 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Blogs Grid */}
      {blogs.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-gray-500 mb-4">No blogs found yet.</p>
          <p className="text-gray-600 mb-6">
            Be the first to share your knowledge with the community!
          </p>
          <Link 
            href="/blog/create" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Create First Blog
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <BlogCard key={blog.id} blog={blog} />
          ))}
        </div>
      )}
    </div>
  );
}