// components/profile/ProfileTabs.jsx
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import BlogCard from "@/components/blog/BlogCard";
import UserCard from "./UserCard";

export default function ProfileTabs({ activeTab, setActiveTab, userId, stats }) {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(false);

  const tabs = [
    { id: "posts", label: "My Posts", count: stats.posts },
    { id: "followers", label: "Followers", count: stats.followers },
    { id: "following", label: "Following", count: stats.following },
    { id: "bookmarks", label: "Bookmarks", count: stats.bookmarks || 0 },
    { id: "liked", label: "Liked Posts", count: stats.totalLikes }
  ];

  useEffect(() => {
    fetchContent(activeTab);
  }, [activeTab, userId]);

  const fetchContent = async (tab) => {
    setLoading(true);
    try {
      let url = "";
      switch (tab) {
        case "posts":
          url = "/api/profile/posts";
          break;
        case "followers":
          url = "/api/profile/followers";
          break;
        case "following":
          url = "/api/profile/following";
          break;
        case "bookmarks":
          url = "/api/bookmarks";
          break;
        case "liked":
          url = "/api/profile/liked-posts";
          break;
        default:
          url = "/api/profile/posts";
      }
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setContent(data);
      }
    } catch (error) {
      console.error(`Error fetching ${tab}:`, error);
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {loading ? (
          <ContentSkeleton />
        ) : content.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <ContentGrid content={content} tab={activeTab} />
        )}
      </div>
    </div>
  );
}

const ContentGrid = ({ content, tab }) => {
  if (tab === "followers" || tab === "following") {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {content.map((user) => (
          <UserCard key={user.id || user._id} user={user} />
        ))}
      </div>
    );
  }

  // For posts, bookmarks, liked posts
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {content.map((post) => (
        <motion.div
          key={post.id || post._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4 }}
          className="transform transition-all duration-300"
        >
          <BlogCard blog={post} />
        </motion.div>
      ))}
    </div>
  );
};

const EmptyState = ({ tab }) => {
  const messages = {
    posts: "You haven't published any posts yet.",
    followers: "No followers yet.",
    following: "You're not following anyone yet.",
    bookmarks: "No bookmarks saved yet.",
    liked: "You haven't liked any posts yet."
  };

  const actions = {
    posts: { text: "Create Your First Post", href: "/blog/create" },
    followers: { text: "Share Your Profile", href: "/profile" },
    following: { text: "Discover Users", href: "/blog" },
    bookmarks: { text: "Explore Articles", href: "/blog" },
    liked: { text: "Discover Content", href: "/blog" }
  };

  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4">
        {tab === "posts" ? "📝" : tab === "followers" ? "👥" : tab === "following" ? "👤" : tab === "bookmarks" ? "🔖" : "❤️"}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {messages[tab]}
      </h3>
      <p className="text-gray-600 mb-6">
        Start building your presence on the platform!
      </p>
      <a
        href={actions[tab].href}
        className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
      >
        {actions[tab].text}
      </a>
    </div>
  );
};

const ContentSkeleton = () => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-white rounded-xl p-6 border animate-pulse">
        <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    ))}
  </div>
);