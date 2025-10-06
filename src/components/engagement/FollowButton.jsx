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

  useEffect(() => {
    setMounted(true);
  }, []);

  const shouldShow =
    mounted && authorId && session?.user?.id !== authorId && status === "authenticated";
  const isLoading = status === "loading" || !mounted;

  useEffect(() => {
    if (!shouldShow) return;

    let cancelled = false;

    async function checkFollowStatus() {
      try {
        // ✅ Add timeout to prevent hanging requests
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(`/api/follow?targetUserId=${authorId}`, { 
          method: "GET", 
          signal: controller.signal 
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        if (!cancelled) {
          setFollowing(data.isFollowing || false);
        }
      } catch (err) {
        if (!cancelled) {
          // ✅ Show more specific error message
          const errorMessage = err.name === "AbortError" 
            ? "Request timed out" 
            : err.message;
          setError(errorMessage);
        }
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

    const prev = following;
    setFollowing(!prev);

    try {
      const res = await fetch("/api/follow", {
        method: prev ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: authorId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${prev ? "unfollow" : "follow"}`);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setFollowing(prev);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="px-3 py-1 rounded text-sm bg-gray-100 animate-pulse">
        <div className="w-12 h-4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!shouldShow) return null;

  if (error) {
    return <div className="text-xs text-red-600">{error}</div>;
  }

  return (
    <button
      aria-pressed={following}
      onClick={toggle}
      disabled={loading}
      className={`px-3 py-1 rounded text-sm transition-all duration-200 font-medium ${
        following
          ? "bg-green-100 text-green-700 hover:bg-green-200"
          : "bg-primary/10 text-primary hover:bg-primary/20"
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