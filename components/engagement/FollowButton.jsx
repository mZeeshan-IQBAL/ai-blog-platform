// components/engagement/FollowButton.jsx
"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function FollowButton({ authorId }) {
  const { status } = useSession();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  // On mount: check if current user is following the author
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const res = await fetch("/api/follow");
        if (!res.ok) return;
        const ids = await res.json();

        if (!cancelled) {
          setFollowing(
            (ids || []).some((id) => String(id) === String(authorId))
          );
        }
      } catch (err) {
        console.error("Failed to fetch following list:", err);
      }
    }

    if (status === "authenticated") init();

    return () => {
      cancelled = true;
    };
  }, [status, authorId]);

  const toggle = async () => {
    if (status !== "authenticated") {
      alert("Please sign in to follow.");
      return;
    }

    setLoading(true);

    // Optimistic update
    const prev = following;
    setFollowing(!prev);

    try {
      const res = await fetch("/api/follow", {
        method: prev ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: authorId }),
      });
      if (!res.ok) throw new Error(`Failed to ${prev ? "unfollow" : "follow"}`);
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong. Please try again.");
      // Roll back on error
      setFollowing(prev);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      aria-pressed={following}
      onClick={toggle}
      disabled={loading}
      className={`px-3 py-1 rounded text-sm transition ${
        following
          ? "bg-green-100 text-green-700"
          : "bg-gray-100 hover:bg-gray-200"
      }`}
    >
      {loading
        ? "Saving..."
        : following
        ? "Following"
        : "Follow"}
    </button>
  );
}