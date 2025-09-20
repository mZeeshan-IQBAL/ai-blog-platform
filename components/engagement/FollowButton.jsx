"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function FollowButton({ authorId }) {
  const { status } = useSession();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/follow");
        if (!res.ok) return;
        const ids = await res.json();
        setFollowing((ids || []).some((id) => String(id) === String(authorId)));
      } catch {}
    }
    if (status === "authenticated") init();
  }, [status, authorId]);

  const toggle = async () => {
    if (status !== "authenticated") return alert("Please sign in to follow.");
    setLoading(true);
    try {
      if (following) {
        await fetch("/api/follow", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: authorId }) });
        setFollowing(false);
      } else {
        await fetch("/api/follow", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId: authorId }) });
        setFollowing(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={toggle} disabled={loading} className={`px-3 py-1 rounded text-sm ${following ? "bg-green-100 text-green-700" : "bg-gray-100 hover:bg-gray-200"}`}>
      {following ? "Following" : "Follow"}
    </button>
  );
}