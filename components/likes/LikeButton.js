// components/likes/LikeButton.js
"use client";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Pusher from "pusher-js";
import { motion } from "framer-motion";
import { Heart } from "lucide-react";

export default function LikeButton({ postId, initialLikes = 0, initiallyLiked = false }) {
  const { data: session, status } = useSession();
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initiallyLiked);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Wait for component to mount (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch current like status when component mounts
  useEffect(() => {
    if (!mounted || !postId) return;

    async function fetchLikeStatus() {
      try {
        const res = await fetch(`/api/reactions?targetType=post&targetId=${postId}`);
        if (res.ok) {
          const data = await res.json();
          console.log("📊 Reaction data:", data);
          
          // Your API returns counts object
          const likeCount = data.counts?.like || 0;
          setLikes(likeCount);
          
          // To determine if current user liked it, we need to check if they have a like reaction
          // Since your API doesn't return user reaction status, we'll get it separately
          if (session?.user?.id) {
            // We can't determine user's like status from the current API
            // For now, we'll assume false and let the optimistic update handle it
            setLiked(false);
          }
        }
      } catch (error) {
        console.error("Error fetching like status:", error);
      }
    }

    fetchLikeStatus();
  }, [mounted, postId, session?.user?.id]);

  // Setup realtime updates via Pusher
  useEffect(() => {
    if (!mounted || !postId || !process.env.NEXT_PUBLIC_PUSHER_KEY) return;
    
    let pusher;
    let channel;
    
    try {
      pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
        forceTLS: true,
      });

      channel = pusher.subscribe(`post-${postId}`);
      channel.bind("like-update", (data) => {
        if (data.counts) {
          setLikes(data.counts.like || 0);
        }
      });
    } catch (error) {
      console.warn("Pusher connection failed:", error);
    }

    return () => {
      if (channel) {
        channel.unbind_all();
        channel.unsubscribe();
      }
      if (pusher) {
        pusher.disconnect();
      }
    };
  }, [mounted, postId]);

  const handleLike = async () => {
    if (!session) {
      alert("Please sign in to like posts.");
      return;
    }

    if (loading) return;
    setLoading(true);

    // Optimistic update
    const newLiked = !liked;
    const newLikes = likes + (newLiked ? 1 : -1);
    setLiked(newLiked);
    setLikes(Math.max(0, newLikes)); // Ensure likes don't go below 0

    try {
      console.log("💝 Sending like request for post:", postId);
      
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "post",
          targetId: postId,
          reaction: "like"
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("✅ Like response:", data);
        
        // Update with server response
        if (data.counts && data.counts.like !== undefined) {
          setLikes(data.counts.like);
          // Note: Your API removes the user's reaction when they click again,
          // so we need to check if the count changed to determine like status
          const currentUserHasLike = data.counts.like > likes || (data.counts.like === likes && newLiked);
          setLiked(currentUserHasLike);
        }
      } else {
        const errorData = await res.json();
        console.error("❌ Like failed:", errorData);
        // Rollback optimistic update
        setLiked(liked);
        setLikes(likes);
      }
    } catch (error) {
      console.error("❌ Like error:", error);
      // Rollback optimistic update
      setLiked(liked);
      setLikes(likes);
    } finally {
      setLoading(false);
    }
  };

  // Don't render anything during SSR
  if (!mounted) return null;

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