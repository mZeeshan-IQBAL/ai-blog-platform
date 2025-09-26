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
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <div className="mb-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Blog" }]} />
      </div>

      {/* Header - Clean and professional */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Latest Articles
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Discover insights, tutorials, and stories from our community of developers and AI enthusiasts.
        </p>

        {/* Search Section - Simple and clean */}
        <div className="max-w-md mx-auto mb-8">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search Articles
          </Link>
          <p className="mt-2 text-sm text-gray-500">
            Find specific topics or browse by category
          </p>
        </div>
      </div>

      {/* Tags Section - Clean and organized */}
      {tags.length > 0 && (
        <div className="mb-12">
          <h2 className="text-sm font-medium text-gray-500 mb-4 text-center">
            Popular Topics
          </h2>
          
          <div className="flex flex-wrap gap-2 justify-center">
            {tags.slice(0, 15).map((tag) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 hover:text-gray-900 transition-colors"
              >
                #{tag}
              </Link>
            ))}

            {tags.length > 15 && (
              <Link 
                href="/tags" 
                className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                View all →
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-8 rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Content */}
      {blogs.length === 0 ? (
        <div className="text-center py-16">
          <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No articles yet</h3>
          <p className="text-gray-600 mb-6">
            Be the first to share your knowledge with the community.
          </p>
          <Link 
            href="/blog/create" 
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Write First Article
          </Link>
        </div>
      ) : (
        <>
          {/* Stats/Count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-600">
              {blogs.length} article{blogs.length !== 1 ? 's' : ''} found
            </p>
            <Link 
              href="/blog/create"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              Write an article →
            </Link>
          </div>

          {/* Blogs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}