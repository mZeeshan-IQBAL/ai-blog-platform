
// components/engagement/BookmarkButton.jsx
"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function BookmarkButton({ postId }) {
  const { data: session, status } = useSession();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const shouldShow = mounted && postId && status === "authenticated";
  const isLoading = status === "loading" || !mounted;

  useEffect(() => {
    if (!shouldShow) return;

    let cancelled = false;

    async function checkBookmarkStatus() {
      try {
        const res = await fetch("/api/bookmarks", { method: "GET" });
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();
        if (!cancelled) {
          setBookmarked(data.some(id => id.toString() === postId.toString()));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Something went wrong. Please try again.");
        }
      }
    }

    checkBookmarkStatus();
    return () => {
      cancelled = true;
    };
  }, [shouldShow, postId]);

  const toggle = async () => {
    if (status !== "authenticated") {
      alert("Please sign in to bookmark posts.");
      return;
    }

    setLoading(true);
    setError("");

    const prev = bookmarked;
    setBookmarked(!prev);

    try {
      const res = await fetch("/api/bookmarks", {
        method: prev ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `Failed to ${prev ? "unbookmark" : "bookmark"}`);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
      setBookmarked(prev);
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
      aria-pressed={bookmarked}
      onClick={toggle}
      disabled={loading}
      className={`px-3 py-1 rounded text-sm transition-all duration-200 font-medium ${
        bookmarked
          ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"></div>
          Saving...
        </div>
      ) : bookmarked ? (
        "Bookmarked"
      ) : (
        "Bookmark"
      )}
    </button>
  );
}