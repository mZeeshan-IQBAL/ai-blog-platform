// components/comments/CommentSection.js
"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Pusher from "pusher-js";
import Image from "next/image";

export default function CommentSection({ postId }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/comments?postId=${postId}`);
      if (!res.ok) throw new Error("Failed to load comments");
      setComments(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });
    const channel = pusher.subscribe(`post-${postId}`);

    channel.bind("new-comment", ({ comment }) =>
      setComments((prev) =>
        prev.find((c) => c._id === comment._id) ? prev : [comment, ...prev]
      )
    );

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`post-${postId}`);
    };
  }, [postId, fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);

    // Optimistic UI update
    const optimisticComment = {
      _id: `temp-${Date.now()}`,
      content: newComment,
      createdAt: new Date().toISOString(),
      author: {
        name: session?.user?.name || "You",
        image: session?.user?.image || null,
      },
      optimistic: true,
    };
    setComments((prev) => [optimisticComment, ...prev]);
    setNewComment("");

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: optimisticComment.content, postId }),
      });
      if (!res.ok) throw new Error("Failed to post comment");
      // No need to set state — Pusher will handle real version
    } catch (err) {
      console.error(err);
      setComments((prev) => prev.filter((c) => c._id !== optimisticComment._id));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Comments</h3>

      {session ? (
        <form onSubmit={handleSubmit} className="mb-6 space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-3 border rounded-lg focus:ring focus:ring-blue-300"
            placeholder="Write a comment..."
            rows={3}
          />
          <button
            disabled={!newComment.trim() || submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 
                       transition disabled:opacity-50"
          >
            {submitting ? "Posting..." : "Post"}
          </button>
        </form>
      ) : (
        <p className="mb-4 text-gray-600">Sign in to comment.</p>
      )}

      <div className="space-y-4">
        {loading ? (
          <p>Loading comments...</p>
        ) : comments.length === 0 ? (
          <p className="text-gray-500">No comments yet. Be the first!</p>
        ) : (
          comments.map((c) => (
            <div
              key={c._id}
              className="flex gap-3 border rounded-lg p-3 bg-gray-50"
            >
              {c.author?.image ? (
                <Image
                  src={c.author.image}
                  alt={c.author.name || "User"}
                  width={40}
                  height={40}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-sm">
                  {c.author?.name?.charAt(0) || "?"}
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {c.author?.name || "Anonymous"}
                  {c.optimistic && (
                    <span className="text-xs text-gray-400 ml-2">(sending…)</span>
                  )}
                </p>
                <p className="text-gray-800 text-sm">{c.content}</p>
                <div className="mt-1 text-xs text-gray-400">
                  {new Date(c.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
