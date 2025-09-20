// components/comments/CommentSection.js
'use client';
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Pusher from "pusher-js";

export default function CommentSection({ postId }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  const fetchComments = useCallback(async () => {
    const res = await fetch(`/api/comments?postId=${postId}`);
    setComments(await res.json());
  }, [postId]);

  useEffect(() => {
    fetchComments();
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, { cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER });
    const channel = pusher.subscribe(`post-${postId}`);
    channel.bind("new-comment", ({ comment }) => setComments(prev=>[comment, ...prev]));
    return () => { pusher.unsubscribe(`post-${postId}`) };
  }, [postId, fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    await fetch("/api/comments", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ content:newComment, postId }) });
    setNewComment("");
  };

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">Comments</h3>
      {session ? (
        <form onSubmit={handleSubmit} className="mb-6 space-y-2">
          <textarea value={newComment} onChange={e=>setNewComment(e.target.value)} className="w-full p-3 border rounded" placeholder="Write a comment..." />
          <button className="bg-blue-600 text-white px-4 py-2 rounded">Post</button>
        </form>
      ) : <p className="mb-4">Sign in to comment.</p>}
      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c._id} className="border rounded p-3">
            <p className="font-semibold">{c.author?.name}</p>
            <p>{c.content}</p>
            <div className="mt-2">
              <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
