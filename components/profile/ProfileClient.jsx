// components/profile/ProfileClient.jsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import ProfileStats from "./ProfileStats";
import ProfileTabs from "./ProfileTabs";
import EditProfileModal from "./EditProfileModal";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function ProfileClient() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    followers: 0,
    following: 0,
    posts: 0,
    totalLikes: 0,
    totalViews: 0
  });
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
      fetchStats();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/profile/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    setShowEditModal(false);
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs 
            items={[
              { label: "Home", href: "/" },
              { label: "Profile" }
            ]} 
          />
        </div>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-8 mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <Image
                  src={session?.user?.image || "/images/placeholder.jpg"}
                  alt={session?.user?.name || "User"}
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-white shadow-lg"
                />
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profile?.name || session?.user?.name}
                </h1>
                <p className="text-gray-600 mb-1">{profile?.email || session?.user?.email}</p>
                {profile?.bio && (
                  <p className="text-gray-700 max-w-md">{profile.bio}</p>
                )}
                {profile?.website && (
                  <a 
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    🌐 {profile.website}
                  </a>
                )}
                {profile?.location && (
                  <p className="text-gray-500 text-sm mt-1">
                    📍 {profile.location}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="lg:ml-auto flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowEditModal(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Edit Profile
              </button>
              <Link
                href="/dashboard"
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-center"
              >
                Dashboard
              </Link>
            </div>
          </div>

          {/* Join Date */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              📅 Joined {new Date(profile?.createdAt || session?.user?.createdAt || Date.now()).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long'
              })}
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <ProfileStats stats={stats} />

        {/* Content Tabs */}
        <ProfileTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userId={session?.user?.id}
          stats={stats}
        />

        {/* Edit Profile Modal */}
        {showEditModal && (
          <EditProfileModal
            profile={profile}
            onClose={() => setShowEditModal(false)}
            onUpdate={handleProfileUpdate}
          />
        )}
      </div>
    </div>
  );
}

// Loading Skeleton
const ProfileSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50 p-8 mb-8 animate-pulse">
        <div className="flex flex-col lg:flex-row lg:items-center gap-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-30 h-30 bg-gray-200 rounded-full"></div>
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded w-48"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl border animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);