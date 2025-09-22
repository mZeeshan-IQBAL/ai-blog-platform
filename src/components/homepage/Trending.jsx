// components/homepage/Trending.jsx
import { Suspense } from "react";
import BlogCard from "@/components/blog/BlogCard";
import { getTrending } from "@/lib/trending";

// Loading skeleton for trending section
const TrendingSkeleton = () => (
  <section className="relative py-16 lg:py-20 overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="text-center mb-12 lg:mb-16">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded-full w-24 mx-auto mb-4"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-64 mx-auto mb-4"></div>
          <div className="h-6 bg-gray-200 rounded-lg w-96 mx-auto"></div>
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Empty state component
const EmptyTrending = () => (
  <section className="relative py-16 lg:py-20 overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50/30"></div>
    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 lg:p-12 border border-gray-200">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          No Trending Content Yet
        </h3>
        <p className="text-gray-600 mb-8 max-w-lg mx-auto">
          We're still gathering data on what's trending. Check back soon to discover 
          the most popular content in our community!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200">
            Browse All Posts
          </button>
          <button className="bg-white text-gray-700 px-6 py-3 rounded-lg font-semibold border border-gray-200 hover:border-gray-300 transition-all duration-200">
            Create Content
          </button>
        </div>
      </div>
    </div>
  </section>
);

// Enhanced blog card wrapper with animations
const AnimatedBlogCard = ({ blog, index }) => {
  return (
    <div 
      className="group transform transition-all duration-500 hover:scale-105"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-blue-200">
        {/* Trending badge */}
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            🔥 Trending
          </span>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/10 group-hover:to-purple-600/10 transition-all duration-500 z-10 pointer-events-none"></div>
        
        <BlogCard blog={blog} />
      </div>
    </div>
  );
};

// Trending filter tabs
const TrendingTabs = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'all', label: 'All Categories', icon: '🌟' },
    { id: 'ai', label: 'AI & ML', icon: '🤖' },
    { id: 'web', label: 'Web Dev', icon: '💻' },
    { id: 'data', label: 'Data Science', icon: '📊' },
  ];

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-8">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all duration-200 ${
            activeTab === tab.id
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600'
          }`}
        >
          <span>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// Main trending content component
const TrendingContent = async ({ limit = 6, showTabs = false }) => {
  try {
    const trending = await getTrending(limit);
    
    if (!trending || trending.length === 0) {
      return <EmptyTrending />;
    }

    const blogs = trending.map((p) => ({
      id: p._id?.toString?.() || p.id,
      slug: p.slug,
      title: p.title,
      coverImage: p.coverImage,
      createdAt: p.createdAt,
      excerpt: p.summary || p.excerpt || "",
      category: p.category,
      author: p.author,
      readTime: p.readTime,
      views: p.views,
      likes: p.likes,
    }));

    return (
      <section className="relative py-16 lg:py-20 overflow-hidden">
        {/* Background elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '3s' }}></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-12 lg:mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 px-6 py-3 rounded-full text-sm font-semibold mb-6">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Trending Now
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              What's
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-red-500 to-pink-500">
                Hot Right Now
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover the most popular and engaging content from our community of 
              developers, researchers, and AI enthusiasts.
            </p>
          </div>

          {/* Optional trending tabs */}
          {showTabs && (
            <TrendingTabs 
              activeTab="all" 
              onTabChange={() => {}} // Would be implemented with state management
            />
          )}

          {/* Trending posts grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {blogs.map((blog, index) => (
              <AnimatedBlogCard 
                key={blog.id} 
                blog={blog} 
                index={index}
              />
            ))}
          </div>

          {/* View more section */}
          <div className="text-center mt-12 lg:mt-16">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 lg:p-8 rounded-2xl border border-orange-100 inline-block">
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Want to See More Trending Content?
              </h3>
              <p className="text-gray-600 mb-6 max-w-md">
                Explore our full collection of trending posts and discover what the community is talking about.
              </p>
              <button className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                View All Trending →
              </button>
            </div>
          </div>

          {/* Trending stats */}
          <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-gray-200">
              <div className="text-2xl font-bold text-orange-500 mb-1">24H</div>
              <div className="text-sm text-gray-600">Update Frequency</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-gray-200">
              <div className="text-2xl font-bold text-red-500 mb-1">{blogs.length}+</div>
              <div className="text-sm text-gray-600">Trending Posts</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-gray-200">
              <div className="text-2xl font-bold text-pink-500 mb-1">Live</div>
              <div className="text-sm text-gray-600">Real-time Data</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-gray-200">
              <div className="text-2xl font-bold text-purple-500 mb-1">AI</div>
              <div className="text-sm text-gray-600">Powered Algorithm</div>
            </div>
          </div>
        </div>
      </section>
    );
  } catch (error) {
    console.error('Error loading trending content:', error);
    return <EmptyTrending />;
  }
};

// Main export with suspense wrapper
export default function Trending({ limit = 6, showTabs = false }) {
  return (
    <Suspense fallback={<TrendingSkeleton />}>
      <TrendingContent limit={limit} showTabs={showTabs} />
    </Suspense>
  );
}