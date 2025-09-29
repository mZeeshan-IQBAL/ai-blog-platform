// components/homepage/Trending.jsx
import { Suspense } from "react";
import Link from "next/link";
import BlogCard from "@/components/blog/BlogCard";
import { getTrending } from "@/lib/trending";

// Loading skeleton for trending section
const TrendingSkeleton = () => (
  <section className="py-16 bg-background">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header skeleton */}
      <div className="text-center mb-12">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded-full w-24 mx-auto mb-4"></div>
          <div className="h-8 bg-muted rounded-lg w-64 mx-auto mb-4"></div>
          <div className="h-5 bg-muted rounded-lg w-96 mx-auto"></div>
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-card rounded-lg p-6 border border-border">
              <div className="h-40 bg-muted rounded-lg mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-16 bg-muted rounded"></div>
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
  <section className="py-16 bg-background">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <div className="bg-card rounded-xl p-8 lg:p-12 border border-border">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h3 className="text-xl font-semibold mb-4">
          No trending stories yet
        </h3>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
          We're still gathering data on the most popular stories. Check back soon to discover 
          what readers are loving right now.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/blog"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
          >
            Browse All Stories
          </Link>
          <Link
            href="/blog/create"
            className="border border-input text-foreground px-6 py-3 rounded-lg font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
          >
            Share Your Story
          </Link>
        </div>
      </div>
    </div>
  </section>
);

// Simple blog card wrapper
const TrendingBlogCard = ({ blog, index }) => {
  return (
    <div className="relative">
      {/* Trending badge */}
      <div className="absolute top-4 left-4 z-10">
        <span className="bg-orange-500 text-white text-xs font-medium px-3 py-1 rounded-full">
          🔥 Trending
        </span>
      </div>
      
      <div className="bg-card rounded-lg border border-border hover:shadow-md transition-shadow">
        <BlogCard blog={blog} />
      </div>
    </div>
  );
};

// Main trending content component
const TrendingContent = async ({ limit = 6 }) => {
  try {
    const trending = await getTrending(limit);
    
    if (!trending || trending.length === 0) {
      return <EmptyTrending />;
    }

    const blogs = trending.map((p) => ({
      id: p._id?.toString?.() || p.id,
      slug: p.slug,
      title: p.title,
      coverImage: p.coverImage || "/images/placeholder.jpg",
      createdAt: p.createdAt,
      excerpt: p.summary || p.excerpt || "",
      category: p.category,
      author: {
        id: p.authorId,
        name: p.authorName || "Anonymous",
        image: p.authorImage || "/images/placeholder.jpg",
      },
      readTime: p.readTime,
      views: p.views || 0,
      likes: Array.isArray(p.likes) ? p.likes.length : p.likes || 0,
    }));

    return (
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Trending Now
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">
              Stories readers love
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Discover the most captivating and engaging stories from our vibrant community of writers.
            </p>
          </div>

          {/* Trending posts grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {blogs.map((blog, index) => (
              <TrendingBlogCard 
                key={blog.id} 
                blog={blog} 
                index={index}
              />
            ))}
          </div>
          {/* Simple stats */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="text-2xl font-bold mb-1">24H</div>
              <div className="text-sm text-muted-foreground">Update Frequency</div>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="text-2xl font-bold mb-1">{blogs.length}+</div>
              <div className="text-sm text-muted-foreground">Trending Stories</div>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="text-2xl font-bold mb-1">Live</div>
              <div className="text-sm text-muted-foreground">Real-time Data</div>
            </div>
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="text-2xl font-bold mb-1">AI</div>
              <div className="text-sm text-muted-foreground">Powered</div>
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
export default function Trending({ limit = 6 }) {
  return (
    <Suspense fallback={<TrendingSkeleton />}>
      <TrendingContent limit={limit} />
    </Suspense>
  );
}