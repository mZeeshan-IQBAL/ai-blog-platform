// components/PostForm.jsx
'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import TipTapEditor from "@/components/editor/TipTapEditor";

export default function PostForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [image, setImage] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/blogs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, image }),
    });
    if (res.ok) router.push("/blog");
    else setError((await res.json()).error);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-600">{error}</p>}
      <input type="text" value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="w-full p-3 border rounded"/>
      <input type="url" value={image} onChange={e=>setImage(e.target.value)} placeholder="Cover image URL" className="w-full p-3 border rounded"/>
      <TipTapEditor onChange={setContent} />
      <button disabled={loading} className="bg-blue-600 text-white px-6 py-3 rounded-lg">{loading ? "Publishing..." : "Publish"}</button>
    </form>
  );
}