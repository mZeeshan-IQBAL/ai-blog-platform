// components/PostForm.jsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import TipTapEditor from "@/components/editor/TipTapEditor";

export default function PostForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const wordCount = content?.split(/\s+/).filter(Boolean).length || 0;
  const readingTime = Math.ceil(wordCount / 200);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content cannot be empty.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("content", content);
      formData.append("category", category);
      formData.append("tags", JSON.stringify(tags));
      if (imageFile) formData.append("image", imageFile);

      // Standard fetch to Node API (not Edge runtime)
      const res = await fetch("/api/blogs", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create blog");

      // Reset form and redirect
      setTitle("");
      setContent("");
      setImageFile(null);
      setPreviewUrl("");
      setTags([]);
      router.push("/blog");
    } catch (err) {
      console.error("❌ Blog creation failed:", err);
      setError(err.message || "Network error. Please try again.");
    }

    setLoading(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImageFile(null);
      setPreviewUrl("");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB.");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleTagAdd = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const handleTagRemove = (tag) => setTags(tags.filter((t) => t !== tag));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && <p className="text-red-600">{error}</p>}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter blog title"
          required
          className="w-full p-3 border rounded focus:ring focus:ring-blue-200"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-3 border rounded"
        >
          <option>General</option>
          <option>Technology</option>
          <option>Design</option>
          <option>Programming</option>
          <option>Lifestyle</option>
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags (press Enter to add)
        </label>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagAdd}
          placeholder="Add a tag and press Enter"
          className="w-full p-3 border rounded"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleTagRemove(tag)}
                className="text-xs text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image (Optional)</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {previewUrl && <img src={previewUrl} alt="Preview" className="h-32 object-cover rounded mt-2" />}
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
        <TipTapEditor onChange={setContent} />
        <p className="text-xs text-gray-500 mt-1">{wordCount} words • ~{readingTime} min read</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? "Publishing..." : "Publish"}
        </button>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition"
        >
          {showPreview ? "Hide Preview" : "Live Preview"}
        </button>
      </div>

      {/* Live Preview */}
      {showPreview && (
        <div className="mt-6 border-t pt-6">
          <h2 className="text-xl font-bold mb-2">{title || "Untitled Post"}</h2>
          {previewUrl && <img src={previewUrl} alt="Preview" className="h-48 w-full object-cover rounded mb-4" />}
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      )}
    </form>
  );
}
