"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function BookmarkButton({ postId }) {
  const { status } = useSession();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/bookmarks");
        if (!res.ok) return;
        const list = await res.json();
        const has = (list || []).some((p) => String(p._id || p.id) === String(postId));
        setBookmarked(has);
      } catch {}
    }
    if (status === "authenticated") init();
  }, [status, postId]);

  const toggle = async () => {
    if (status !== "authenticated") return alert("Please sign in to bookmark.");
    setLoading(true);
    try {
      if (bookmarked) {
        await fetch("/api/bookmarks", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId }) });
        setBookmarked(false);
      } else {
        await fetch("/api/bookmarks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ postId }) });
        setBookmarked(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={toggle} disabled={loading} className={`px-3 py-1 rounded text-sm ${bookmarked ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 hover:bg-gray-200"}`}>
      {bookmarked ? "★ Bookmarked" : "☆ Bookmark"}
    </button>
  );
}