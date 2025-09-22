// components/dashboard/BookMarksClient.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import BlogCard from "@/components/blog/BlogCard";

// Time period selector component (similar to analytics)
const BookmarksPeriodSelector = ({ selectedPeriod, onPeriodChange }) => {
  const periods = [
    { value: 'all', label: 'All time' },
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '3m', label: 'Last 3 months' }
  ];

  return (
    <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
      {periods.map((period) => (
        <button
          key={period.value}
          onClick={() => onPeriodChange(period.value)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
            selectedPeriod === period.value
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};

// Enhanced stat card (similar to analytics)
function StatCard({ title, value, icon, color, subtitle }) {
  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', icon: 'text-blue-500' },
    green: { bg: 'bg-green-50', text: 'text-green-600', icon: 'text-green-500' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', icon: 'text-purple-500' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600', icon: 'text-orange-500' }
  };

  const colors = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold ${colors.text}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 ${colors.bg} rounded-lg flex items-center justify-center`}>
          <span className={`text-xl ${colors.icon}`}>{icon}</span>
        </div>
      </div>
    </div>
  );
}

// Loading skeleton component
const BookmarksSkeleton = () => (
  <div className="animate-pulse space-y-8">
    <div className="h-8 bg-gray-200 rounded w-64"></div>
    
    {/* Stats skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-white p-6 rounded-xl border border-gray-100">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      ))}
    </div>

    {/* Filters skeleton */}
    <div className="bg-white p-6 rounded-xl border border-gray-100">
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        <div className="h-10 bg-gray-200 rounded-lg w-full max-w-md"></div>
        <div className="flex gap-3">
          <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
          <div className="h-10 bg-gray-200 rounded-lg w-32"></div>
        </div>
      </div>
    </div>

    {/* Grid skeleton */}
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl p-6 border border-gray-100">
          <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  </div>
);

// Error component
const BookmarksError = ({ error, onRetry }) => (
  <div className="text-center py-12">
    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
    </div>
    <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load bookmarks</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">{error}</p>
    <button
      onClick={onRetry}
      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
    >
      Try Again
    </button>
  </div>
);

// Empty state component
const BookmarksEmptyState = () => (
  <div className="text-center py-16">
    <div className="max-w-md mx-auto">
      <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
        <span className="text-4xl">🔖</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Start Your Knowledge Collection</h2>
      <p className="text-gray-600 mb-8 leading-relaxed">
        Discover and save articles that inspire you. Build your personal library of insights and ideas you can return to anytime.
      </p>
      <div className="space-y-4">
        <a
          href="/blog"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm"
        >
          ✨ Explore Articles
        </a>
        <div className="text-sm text-gray-500">
          <p>💡 Tip: Click the bookmark icon on any article to save it here</p>
        </div>
      </div>
      <div className="mt-12 grid sm:grid-cols-3 gap-6 text-center">
        <div className="p-4">
          <div className="text-2xl mb-2">🔖</div>
          <h3 className="font-semibold text-gray-900 mb-1">Easy Saving</h3>
          <p className="text-sm text-gray-600">One-click bookmarking on any article</p>
        </div>
        <div className="p-4">
          <div className="text-2xl mb-2">🏷️</div>
          <h3 className="font-semibold text-gray-900 mb-1">Smart Organization</h3>
          <p className="text-sm text-gray-600">Filter and sort by categories</p>
        </div>
        <div className="p-4">
          <div className="text-2xl mb-2">📱</div>
          <h3 className="font-semibold text-gray-900 mb-1">Access Anywhere</h3>
          <p className="text-sm text-gray-600">Your collection syncs across devices</p>
        </div>
      </div>
    </div>
  </div>
);

export default function BookmarksClient() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [sortBy, setSortBy] = useState("newest");
  const [filterBy, setFilterBy] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 9;

  const fetchBookmarks = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/bookmarks`, { 
        cache: "no-store",
        headers: { "Content-Type": "application/json" }
      });
      if (!res.ok) throw new Error("Failed to fetch bookmarks");
      const data = await res.json();
      setBookmarks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  // Filter bookmarks by time period
  const filteredByPeriod = useMemo(() => {
    if (selectedPeriod === 'all') return bookmarks;
    
    const now = new Date();
    const periodMap = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '3m': 90 * 24 * 60 * 60 * 1000
    };
    
    const cutoff = new Date(now.getTime() - periodMap[selectedPeriod]);
    return bookmarks.filter(bookmark => 
      new Date(bookmark.bookmarkedAt || bookmark.createdAt) >= cutoff
    );
  }, [bookmarks, selectedPeriod]);

  // Process and filter bookmarks
  const processedBookmarks = useMemo(() => {
    let filtered = [...filteredByPeriod];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(bookmark =>
        bookmark.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bookmark.excerpt?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (filterBy !== "all") {
      filtered = filtered.filter(bookmark => 
        bookmark.category?.toLowerCase() === filterBy.toLowerCase()
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.bookmarkedAt || b.createdAt) - new Date(a.bookmarkedAt || a.createdAt);
        case "oldest":
          return new Date(a.bookmarkedAt || a.createdAt) - new Date(b.bookmarkedAt || b.createdAt);
        case "title":
          return a.title?.localeCompare(b.title) || 0;
        default:
          return 0;
      }
    });

    return filtered;
  }, [filteredByPeriod, sortBy, filterBy, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(processedBookmarks.length / ITEMS_PER_PAGE);
  const paginatedBookmarks = processedBookmarks.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Get unique categories
  const categories = useMemo(() => {
    const cats = bookmarks.map(b => b.category).filter(Boolean);
    return [...new Set(cats)];
  }, [bookmarks]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = filteredByPeriod.length;
    const categoriesCount = new Set(filteredByPeriod.map(b => b.category).filter(Boolean)).size;
    const thisWeek = bookmarks.filter(b => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return new Date(b.bookmarkedAt || b.createdAt) >= weekAgo;
    }).length;
    const avgPerWeek = Math.round(bookmarks.length / Math.max(1, Math.ceil((Date.now() - new Date(bookmarks[bookmarks.length - 1]?.createdAt || Date.now()).getTime()) / (7 * 24 * 60 * 60 * 1000))));

    return { total, categoriesCount, thisWeek, avgPerWeek };
  }, [filteredByPeriod, bookmarks]);

  const handleExport = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      bookmarks: bookmarks.map(b => ({
        title: b.title,
        url: b.url || `${window.location.origin}/blog/${b.slug}`,
        bookmarkedAt: b.bookmarkedAt || b.createdAt,
        category: b.category
      }))
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bookmarks-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleRetry = () => {
    fetchBookmarks();
  };

  if (loading) return <BookmarksSkeleton />;
  if (error) return <BookmarksError error={error} onRetry={handleRetry} />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Dashboard", href: "/dashboard" },
              { label: "Bookmarks" },
            ]}
          />
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Your Bookmarks</h1>
          <p className="text-gray-600 mt-1">Your personal collection of saved articles and resources</p>
        </div>
        <BookmarksPeriodSelector 
          selectedPeriod={selectedPeriod} 
          onPeriodChange={setSelectedPeriod} 
        />
      </div>

      {bookmarks.length === 0 ? (
        <BookmarksEmptyState />
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Bookmarks" 
              value={stats.total}
              icon="🔖" 
              color="blue"
              subtitle="In selected period"
            />
            <StatCard 
              title="Categories" 
              value={stats.categoriesCount}
              icon="🏷️" 
              color="green"
              subtitle="Unique topics"
            />
            <StatCard 
              title="This Week" 
              value={stats.thisWeek}
              icon="📅" 
              color="purple"
              subtitle="Recently saved"
            />
            <StatCard 
              title="Weekly Avg" 
              value={stats.avgPerWeek}
              icon="📊" 
              color="orange"
              subtitle="Bookmarks per week"
            />
          </div>

          {/* Filters and Search */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 hover:shadow-lg transition-shadow">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                  </svg>
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="title">Title A-Z</option>
                </select>
              </div>
            </div>

            {/* Results count */}
            <div className="mt-4 text-sm text-gray-600">
              Showing {processedBookmarks.length} of {bookmarks.length} bookmarks
            </div>
          </div>

          {/* Results */}
          {processedBookmarks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No bookmarks match your current filters.</p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilterBy("all");
                  setSortBy("newest");
                  setSelectedPeriod("all");
                }}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              {/* Grid */}
              <motion.div 
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <AnimatePresence mode="wait">
                  {paginatedBookmarks.map((bookmark, index) => (
                    <motion.div
                      key={bookmark._id || bookmark.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: index * 0.1,
                        ease: "easeOut"
                      }}
                      whileHover={{ y: -4 }}
                      className="group"
                    >
                      <BlogCard 
                        blog={{
                          id: bookmark._id || bookmark.id,
                          slug: bookmark.slug,
                          title: bookmark.title,
                          coverImage: bookmark.coverImage,
                          createdAt: bookmark.createdAt,
                          excerpt: bookmark.excerpt || "",
                          category: bookmark.category,
                          readingTime: bookmark.readingTime,
                          bookmarkedAt: bookmark.bookmarkedAt
                        }}
                        className="h-full transform transition-all duration-300 group-hover:shadow-xl border border-gray-100 hover:shadow-lg"
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Previous
                  </button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* Export Options */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4">Export Bookmarks</h3>
            <div className="flex flex-wrap gap-3">
              <button 
                onClick={handleExport}
                className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                📊 Export as JSON
              </button>
              <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                📄 Generate Reading List
              </button>
              <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                📧 Email Collection
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}