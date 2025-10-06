// components/profile/PublicProfileClient.jsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Avatar, { AvatarSizes } from "@/components/ui/Avatar";
import FollowButton from "@/components/engagement/FollowButton";
import BlogCard from "@/components/blog/BlogCard";
import Breadcrumbs from "@/components/ui/Breadcrumbs";

export default function PublicProfileClient({ user, stats, initialPosts }) {
  const { data: session } = useSession();
  const params = useParams(); // { id: '1182485...' }

  // Ensure we always have a profileId
  const profileId = useMemo(() => user?.id || params?.id || "", [user?.id, params?.id]);
  const isOwnProfile = session?.user?.id === profileId;

  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState(initialPosts || []);
  const [loading, setLoading] = useState(false);

  // Optional: If you plan to fetch more via API for this public page
  useEffect(() => {
    if (!profileId) return; // guard against undefined

    if (activeTab === "posts" && posts.length === 0) {
      // Already got initialPosts; you can skip or refetch if you want
      return;
    }
    // No auto-fetch for undefined IDs
  }, [activeTab, profileId, posts.length]);

  // UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs 
            items={[
              { label: "Home", href: "/" },
              { label: "Blog", href: "/blog" },
              { label: user?.name || "Profile" }
            ]} 
          />
        </div>

        {/* Header */}
        <div className="card card-padding card-hover mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">
            <div className="flex items-center gap-6">
              <Avatar
                src={user?.image}
                alt={user?.name || "User"}
                size={AvatarSizes.profile}
                className="border-4 border-white shadow-lg"
              />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  {user?.name || "Unknown User"}
                </h1>
                {user?.bio && <p className="text-muted-foreground mt-2">{user.bio}</p>}
                <div className="mt-2 text-sm text-muted-foreground flex flex-wrap gap-4">
                  {user?.location && <span>📍 {user.location}</span>}
                  {user?.website && (
                    <a href={user.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      🌐 Website
                    </a>
                  )}
                  {user?.createdAt && (
                    <span>
                      📅 Joined {new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="lg:ml-auto flex gap-3">
              {isOwnProfile ? (
                <Link href="/profile" className="px-6 py-2 rounded-lg text-white brand-gradient hover:brightness-110">
                  Edit Profile
                </Link>
              ) : (
                profileId && <FollowButton authorId={profileId} />
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: "Posts", value: stats?.posts || 0, icon: "📝" },
            { label: "Followers", value: stats?.followers || 0, icon: "👥" },
            { label: "Following", value: stats?.following || 0, icon: "👤" },
            { label: "Total Likes", value: stats?.totalLikes || 0, icon: "❤️" },
          ].map((s) => (
            <div key={s.label} className="card card-padding text-center">
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold text-foreground">{s.value.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Posts */}
        <div className="card card-padding">
          <h2 className="text-lg font-semibold mb-4">Posts</h2>
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : posts?.length ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <BlogCard key={post.id || post._id} blog={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No posts yet</h3>
              <p className="text-muted-foreground">This user hasn’t published any posts yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}