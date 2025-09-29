// components/profile/ProfileStats.jsx
"use client";

import { motion } from "framer-motion";

export default function ProfileStats({ stats = {}, lastUpdated = Date.now(), onRefresh = () => {} }) {
  const statItems = [
    {
      label: "Posts",
      value: stats.posts || 0,
      icon: "📝",
      color: "from-blue-500 to-blue-600"
    },
    {
      label: "Followers",
      value: stats.followers || 0,
      icon: "👥",
      color: "from-green-500 to-green-600"
    },
    {
      label: "Following",
      value: stats.following || 0,
      icon: "👤",
      color: "from-purple-500 to-purple-600"
    },
    {
      label: "Total Likes",
      value: stats.totalLikes || 0,
      icon: "❤️",
      color: "from-red-500 to-red-600"
    },
    {
      label: "Total Views",
      value: stats.totalViews || 0,
      icon: "👁️",
      color: "from-orange-500 to-orange-600"
    }
  ];

  return (
    <div className="mb-8">
      {/* Stats Header with Refresh */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Profile Statistics</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh stats"
            >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {statItems.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 p-6 text-center hover:shadow-lg transition-all duration-300"
        >
          <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center mx-auto mb-3 shadow-lg`}>
            <span className="text-white text-xl">{stat.icon}</span>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">
            {stat.value.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">{stat.label}</div>
        </motion.div>
        ))}
      </div>
    </div>
  );
}