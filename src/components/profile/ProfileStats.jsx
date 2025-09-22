// components/profile/ProfileStats.jsx
"use client";

import { motion } from "framer-motion";

export default function ProfileStats({ stats }) {
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
    <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
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
  );
}