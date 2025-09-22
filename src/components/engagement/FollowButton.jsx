// components/engagement/FollowButton.jsx
// components/engagement/FollowButton.jsx
"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function FollowButton({ authorId }) {
  const { data: session, status } = useSession();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  // Debug logging
  console.log("🔍 FollowButton Debug:", {
    authorId,
    sessionStatus: status,
    sessionUserId: session?.user?.id,
    mounted,
    shouldShow: mounted && authorId && session?.user?.id !== authorId && status === "authenticated"
  });

  // Wait for component to mount (client-side only)
  useEffect(() => {
    console.log("🔄 FollowButton mounted");
    setMounted(true);
  }, []);

  // Check conditions AFTER hooks are called
  const shouldShow = mounted && authorId && session?.user?.id !== authorId && status === "authenticated";
  const isLoading = status === "loading" || !mounted;

  // Check following status (removed problematic sync call)
  useEffect(() => {
    if (!shouldShow) {
      console.log("❌ Not showing follow button:", { shouldShow, mounted, authorId, status });
      return;
    }

    let cancelled = false;

    async function checkFollowStatus() {
      try {
        console.log("🔄 Checking follow status for:", authorId);
        
        // ✅ REMOVED: The problematic sync call that was causing empty POST requests
        // const syncRes = await fetch("/api/users/sync", { method: "POST" });
        
        // Check following status
        const res = await fetch("/api/follow");
        if (!res.ok) {
          console.error("Failed to fetch follows:", await res.text());
          return;
        }
        
        const ids = await res.json();
        console.log("📋 Current follows:", ids);

        if (!cancelled) {
          const isFollowing = (ids || []).some((id) => String(id) === String(authorId));
          console.log("👤 Following status for", authorId, ":", isFollowing);
          setFollowing(isFollowing);
        }
      } catch (err) {
        console.error("Failed to check follow status:", err);
        setError("Failed to load follow status");
      }
    }

    checkFollowStatus();

    return () => {
      cancelled = true;
    };
  }, [shouldShow, authorId]);

  const toggle = async () => {
    if (status !== "authenticated") {
      alert("Please sign in to follow.");
      return;
    }

    setLoading(true);
    setError("");

    // Optimistic update
    const prev = following;
    setFollowing(!prev);

    try {
      console.log(`🔄 ${prev ? 'Unfollowing' : 'Following'} user:`, authorId);
      
      const res = await fetch("/api/follow", {
        method: prev ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: authorId }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${prev ? "unfollow" : "follow"}`);
      }

      const result = await res.json();
      console.log("✅ Follow action successful:", result);
    } catch (err) {
      console.error("❌ Follow action failed:", err);
      setError(err.message || "Something went wrong. Please try again.");
      // Roll back on error
      setFollowing(prev);
    } finally {
      setLoading(false);
    }
  };

  console.log("🎯 FollowButton render decision:", {
    isLoading,
    shouldShow,
    error,
    willRender: !isLoading && shouldShow
  });

  // Show skeleton while loading
  if (isLoading) {
    console.log("⏳ Showing loading skeleton");
    return (
      <div className="px-3 py-1 rounded text-sm bg-gray-100 animate-pulse">
        <div className="w-12 h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Don't show button if not authenticated or same user
  if (!shouldShow) {
    console.log("🚫 Not showing follow button");
    return null;
  }

  if (error) {
    console.log("❌ Showing error state:", error);
    return (
      <div className="text-xs text-red-600">
        {error}
      </div>
    );
  }

  console.log("✅ Rendering follow button");
  return (
    <button
      aria-pressed={following}
      onClick={toggle}
      disabled={loading}
      className={`px-3 py-1 rounded text-sm transition-all duration-200 font-medium ${
        following
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-blue-100 text-blue-700 hover:bg-blue-200"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
          Saving...
        </div>
      ) : following ? (
        "Following"
      ) : (
        "Follow"
      )}
    </button>
  );
}