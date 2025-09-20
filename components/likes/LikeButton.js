// components/likes/LikeButton.js
"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect, useRef } from "react";
import Pusher from "pusher-js";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export default function LikeButton({ postId, initialLikes = 0, initiallyLiked = false }) {
  const { data: session } = useSession();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initiallyLiked);
  const [loading, setLoading] = useState(false);
  const hasMounted = useRef(false);

  // Setup realtime updates via Pusher
  useEffect(() => {
    if (!postId) return;
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe(`post-${postId}`);
    channel.bind("like-update", (data) => {
      setLikes(data.likes);
      setLiked(data.liked);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [postId]);

  // Prevent initial flicker between SSR and client
  useEffect(() => {
    hasMounted.current = true;
  }, []);

  const handleLike = async () => {
    if (!session) {
      alert("Please sign in to like posts.");
      return;
    }

    if (loading) return; // prevent spam clicks
    setLoading(true);

    // Optimistic update
    setLiked(!liked);
    setLikes((prev) => prev + (liked ? -1 : 1));

    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          authorId: session.user.id,      // required by backend
          authorName: session.user.name,  // required by backend
          type: "like",                   // mark as like
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLikes(data.likes);
        setLiked(data.liked);
      } else {
        console.error("Failed to like:", await res.text());
      }
    } catch (error) {
      console.error("Like failed:", error);
      // rollback on error
      setLiked(liked);
      setLikes(initialLikes);
    } finally {
      setLoading(false);
    }
  };

  if (!hasMounted.current) return null;

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      aria-pressed={liked}
      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition focus:outline-none ${
        liked
          ? "bg-red-100 text-red-600"
          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
      } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <motion.div
        animate={liked ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : "text-gray-500"}`}
        />
      </motion.div>
      <span>{likes}</span>
    </button>
  );
}
