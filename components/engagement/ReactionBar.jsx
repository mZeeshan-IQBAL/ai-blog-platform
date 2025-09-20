"use client";
import { useEffect, useState } from "react";

const TYPES = [
  { key: "like", label: "👍" },
  { key: "love", label: "❤️" },
  { key: "fire", label: "🔥" },
];

export default function ReactionBar({ targetType, targetId }) {
  const [counts, setCounts] = useState({ like: 0, love: 0, fire: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`/api/reactions?targetType=${targetType}&targetId=${targetId}`)
      .then((r) => r.ok ? r.json() : { counts: { like: 0, love: 0, fire: 0 } })
      .then((data) => setCounts(data.counts || { like: 0, love: 0, fire: 0 }))
      .catch(() => {});
  }, [targetType, targetId]);

  const react = async (reaction) => {
    setLoading(true);
    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId, reaction }),
      });
      if (res.ok) {
        const data = await res.json();
        setCounts(data.counts || counts);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {TYPES.map((t) => (
        <button
          key={t.key}
          disabled={loading}
          onClick={() => react(t.key)}
          className="inline-flex items-center gap-1 text-sm px-2 py-1 rounded bg-gray-100 hover:bg-gray-200"
        >
          <span>{t.label}</span>
          <span>{counts[t.key] || 0}</span>
        </button>
      ))}
    </div>
  );
}