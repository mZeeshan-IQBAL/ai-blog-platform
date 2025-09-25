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

  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");

  const wordCount = content?.split(/\s+/).filter(Boolean).length || 0;
  const readingTime = Math.ceil(wordCount / 200);

  // ✅ Submit blog
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

      const res = await fetch("/api/blogs", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create blog");

      // Reset form
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

  // ✅ Image handler
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

  // ✅ Tags
  const handleTagAdd = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };
  const handleTagRemove = (tag) => setTags(tags.filter((t) => t !== tag));

  // ✅ AI suggestion
  const handleAISuggestion = async () => {
    console.log("🔑 HF Key loaded?", process.env.NEXT_PUBLIC_HF_API_KEY ? "Yes" : "No");
    if (!content.trim()) {
      setError("Please write some content first so AI has context.");
      return;
    }

    setAiLoading(true);
    setAiSuggestion("");
    try {
      const res = await fetch("https://api-inference.huggingface.co/models/google/flan-t5-base", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + process.env.NEXT_PUBLIC_HF_API_KEY, // add key in .env.local
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: `Improve and expand this blog draft: ${content}`,
          parameters: { max_new_tokens: 120, temperature: 0.7 },
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setAiSuggestion(data[0]?.generated_text || "No suggestions found.");
    } catch (err) {
      console.error("❌ AI suggestion failed:", err);
      setAiSuggestion("AI couldn’t generate suggestions this time 🌱. Try again!");
    }
    setAiLoading(false);
  };

  // ✅ Insert suggestion into editor
  const handleInsertAISuggestion = () => {
    if (aiSuggestion) {
      setContent((prev) => prev + "<p>" + aiSuggestion + "</p>");
      setAiSuggestion(""); // Clear after insertion
    }
  };

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
        <TipTapEditor onChange={setContent} initialContent={content} />
        <p className="text-xs text-gray-500 mt-1">{wordCount} words • ~{readingTime} min read</p>
      </div>

      {/* AI Suggestions */}
      <div>
        <button
          type="button"
          disabled={aiLoading}
          onClick={handleAISuggestion}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
        >
          {aiLoading ? "Thinking 🤖..." : "Get AI Suggestion"}
        </button>

        {aiSuggestion && (
          <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">AI Suggestion:</h3>
            <p className="text-gray-700 whitespace-pre-line mb-3">{aiSuggestion}</p>
            <button
              type="button"
              onClick={handleInsertAISuggestion}
              className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 transition"
            >
              Insert into Editor
            </button>
          </div>
        )}
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