// components/engagement/BookmarkButton.jsx
"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function BookmarkButton({ postId }) {
  const { status } = useSession();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch user's bookmarks on mount/login
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const res = await fetch("/api/bookmarks");
        if (!res.ok) return;
        const list = await res.json();
        if (!cancelled) {
          const has = (list || []).some(
            (p) => String(p._id || p.id) === String(postId)
          );
          setBookmarked(has);
        }
      } catch (err) {
        console.error("Failed to load bookmarks:", err);
      }
    }

    if (status === "authenticated") init();
    return () => {
      cancelled = true;
    };
  }, [status, postId]);

  const toggle = async () => {
    if (status !== "authenticated") {
      alert("Please sign in to bookmark.");
      return;
    }

    setLoading(true);

    // Optimistic update
    const prev = bookmarked;
    setBookmarked(!prev);

    try {
      const res = await fetch("/api/bookmarks", {
        method: prev ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });
      if (!res.ok) throw new Error("Bookmark request failed");
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong. Please try again.");
      // Roll back on failure
      setBookmarked(prev);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      aria-pressed={bookmarked}
      onClick={toggle}
      disabled={loading}
      className={`px-3 py-1 rounded text-sm transition ${
        bookmarked
          ? "bg-yellow-100 text-yellow-700"
          : "bg-gray-100 hover:bg-gray-200"
      }`}
    >
      {loading
        ? "Saving..."
        : bookmarked
        ? "★ Bookmarked"
        : "☆ Bookmark"}
    </button>
  );
}