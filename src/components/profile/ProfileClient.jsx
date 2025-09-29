// components/profile/ProfileClient.jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import Link from "next/link";
import Avatar, { AvatarSizes } from "@/components/ui/Avatar";
import { getPusherClient } from "@/lib/pusherClient";
import ProfileStats from "./ProfileStats";
import ProfileTabs from "./ProfileTabs";
import EditProfileModal from "./EditProfileModal";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function ProfileClient() {
  console.log('ProfileClient rendering...');
  const { data: session } = useSession();
  console.log('Session in ProfileClient:', session);
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
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const fetchStats = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      
      const res = await fetch("/api/profile/stats", {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (res.ok) {
        const data = await res.json();
        setStats(prevStats => {
          // Only update if stats have actually changed
          const hasChanged = JSON.stringify(prevStats) !== JSON.stringify(data);
          if (hasChanged) {
            console.log('Stats updated:', { old: prevStats, new: data });
          }
          return data;
        });
      } else {
        console.error('Failed to fetch stats:', res.status, res.statusText);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
      } else {
        console.error('Failed to fetch profile:', res.status, res.statusText);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  }, []);

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile();
      fetchStats(true); // Show loading on initial fetch
    }
  }, [session, fetchProfile, fetchStats]);

  // Auto-refresh stats every 30 seconds when page is visible
  useEffect(() => {
    if (!session?.user?.id) return;

    const refreshStats = () => {
      if (document.visibilityState === 'visible') {
        fetchStats();
        setLastUpdated(Date.now());
      }
    };

    // Set up periodic refresh
    const interval = setInterval(refreshStats, 30000); // 30 seconds

    // Refresh when page becomes visible
    document.addEventListener('visibilitychange', refreshStats);

    // Refresh when user focuses on the window
    window.addEventListener('focus', refreshStats);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', refreshStats);
      window.removeEventListener('focus', refreshStats);
    };
  }, [session?.user?.id, fetchStats]);

  // Real-time updates via Pusher
  useEffect(() => {
    if (!session?.user?.id) return;

    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = `private-user-${session.user.id}`;
    const channel = pusher.subscribe(channelName);
    
    // Listen for profile stats updates
    channel.bind('profile-stats-update', (data) => {
      console.log('Real-time profile stats update received:', data);
      fetchStats(); // Refresh stats when update received
    });

    // Listen for likes on user's posts
    channel.bind('post-liked', () => {
      fetchStats();
    });

    // Listen for new followers
    channel.bind('new-follower', () => {
      fetchStats();
    });

    // Listen for new posts
    channel.bind('new-post', () => {
      fetchStats();
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [session?.user?.id, fetchStats]);

  // Function to manually refresh stats (for use by child components)
  const refreshStats = useCallback(() => {
    fetchStats();
    setLastUpdated(Date.now());
  }, [fetchStats]);

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    setShowEditModal(false);
  };

  console.log('ProfileClient state:', { loading, profile, stats, session });

  if (loading) {
    console.log('Showing loading skeleton...');
    return <ProfileSkeleton />;
  }

  if (!session) {
    console.log('No session found in ProfileClient');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-muted-foreground">Please sign in to view your profile.</p>
        </div>
      </div>
    );
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
              <Avatar
                src={session?.user?.image}
                alt={session?.user?.name || "User"}
                size={AvatarSizes.profile}
                className="border-4 border-white shadow-lg"
                showOnlineIndicator={true}
              />
              
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
        <ProfileStats 
          stats={stats} 
          lastUpdated={lastUpdated}
          onRefresh={refreshStats}
        />

        {/* Content Tabs */}
        <ProfileTabs 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          userId={session?.user?.id}
          stats={stats}
          onStatsUpdate={refreshStats}
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