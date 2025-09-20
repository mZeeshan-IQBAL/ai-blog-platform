// components/likes/LikeButton.js
"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Pusher from "pusher-js";

export default function LikeButton({ postId, initialLikes }) {
  const { data: session } = useSession();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);

  // Setup realtime updates via Pusher
  useEffect(() => {
    // Create a Pusher client using public key
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    // Subscribe to post-specific channel
    const channel = pusher.subscribe(`post-${postId}`);

    // Listen for like updates
    channel.bind("like-update", (data) => {
      setLikes(data.likes);
      setLiked(data.liked); // reflects current state if this user liked via another session
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [postId]);

  const handleLike = async () => {
    if (!session) {
      alert("Please sign in to like posts.");
      return;
    }

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
        setLiked(data.liked);
      }
    } catch (error) {
      console.error("Like failed:", error);
    }
  };

  return (
    <button
      onClick={handleLike}
      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition ${
        liked
          ? "bg-red-100 text-red-600"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      }`}
    >
      👍 {likes}
    </button>
  );
}