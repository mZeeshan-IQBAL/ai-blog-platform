"use client";
import { useEffect, useState } from "react";

const TYPES = [
  { key: "like", label: "👍" },
  { key: "love", label: "❤️" },
  { key: "fire", label: "🔥" },
];

export default function ReactionBar({ targetType, targetId }) {
  const [counts, setCounts] = useState({ like: 0, love: 0, fire: 0 });
  const [userReaction, setUserReaction] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load reaction counts (and optionally user reaction if API returns it)
  useEffect(() => {
    fetch(`/api/reactions?targetType=${targetType}&targetId=${targetId}`)
      .then((r) => (r.ok ? r.json() : { counts: { like: 0, love: 0, fire: 0 } }))
      .then((data) => {
        setCounts(data.counts || { like: 0, love: 0, fire: 0 });
        if (data.userReaction) setUserReaction(data.userReaction);
      })
      .catch((err) => {
        console.error("Failed to fetch reactions:", err);
        setCounts({ like: 0, love: 0, fire: 0 });
      });
  }, [targetType, targetId]);

  const react = async (reaction) => {
    setLoading(true);

    // Optimistic UI
    const prevCounts = { ...counts };
    setCounts({ ...counts, [reaction]: counts[reaction] + 1 });
    setUserReaction(reaction);

    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, reaction }),
      });
      if (res.ok) {
        const data = await res.json();
        setCounts(data.counts || counts);
        if (data.userReaction) setUserReaction(data.userReaction);
      } else {
        setCounts(prevCounts); // rollback
      }
    } catch (err) {
      console.error("Reaction failed:", err);
      setCounts(prevCounts);
      setUserReaction(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {TYPES.map((t) => (
        <button
          key={t.key}
          aria-pressed={userReaction === t.key}
          aria-label={`${t.label} ${counts[t.key] || 0}`}
          disabled={loading}
          onClick={() => react(t.key)}
          className={`inline-flex items-center gap-1 text-sm px-2 py-1 rounded transition ${
            userReaction === t.key
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          <span>{t.label}</span>
          <span>{counts[t.key] || 0}</span>
        </button>
      ))}
    </div>
  );
}