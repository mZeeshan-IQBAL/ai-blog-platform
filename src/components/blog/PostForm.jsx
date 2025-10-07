// PostForm.jsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import TipTapEditor from "@/components/editor/TipTapEditor";
import { CATEGORIES } from "@/lib/categories";
import { useSubscription } from "@/hooks/useSubscription";

export default function PostForm() {
  const router = useRouter();
  const editorRef = useRef(null);
  const { subscription, usage, limits, canPerformAction, getUsagePercentage, isPremium } = useSubscription();

  // Form state
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [content, setContent] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  
  // Subscription limits
  const maxTags = subscription?.plan === 'free' ? 3 : subscription?.plan === 'starter' ? 5 : 10;
  const maxFileSize = limits?.maxFileSize || 5; // MB
  const postsUsed = usage?.posts || 0;
  const postsLimit = limits?.posts || 5;
  const canCreatePost = canPerformAction?.('create_post') !== false;

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // AI
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState("");
  const [aiMode, setAiMode] = useState("");

  // Helpers
  const wordCount = content?.split(/\s+/).filter(Boolean).length || 0;
  const readingTime = Math.ceil(wordCount / 200);

  // Submit blog
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      setLoading(false);
      return;
    }
    
    // Check subscription limits before submitting
    if (!canCreatePost) {
      setError(`You've reached your post limit (${postsLimit} posts per month). Upgrade to create more posts!`);
      setLoading(false);
      return;
    }
    
    if (tags.length > maxTags) {
      setError(`Your ${subscription?.plan || 'free'} plan allows maximum ${maxTags} tags per post.`);
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

      const res = await fetch("/api/posts", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to create blog");

      // Reset
      setTitle("");
      setCategory("General");
      setTags([]);
      setTagInput("");
      setImageFile(null);
      setPreviewUrl("");
      setContent("");
      router.push("/blog");
    } catch (err) {
      console.error("❌ Blog creation failed:", err);
      
      // Handle subscription-specific errors
      if (err.message.includes('limit exceeded') || err.message.includes('upgrade')) {
        setError(err.message + ' Click here to upgrade your plan.');
      } else {
        setError(err.message || "Network error. Try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setImageFile(null);
      setPreviewUrl("");
      return;
    }
    if (file.size > maxFileSize * 1024 * 1024) {
      setError(`Image must be smaller than ${maxFileSize}MB. Your ${subscription?.plan || 'free'} plan limit is ${maxFileSize}MB.`);
      return;
    }
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  // Tags
  const handleTagAdd = (e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      
      if (tags.length >= maxTags) {
        setError(`Maximum ${maxTags} tags allowed for ${subscription?.plan || 'free'} plan. Remove a tag first or upgrade your plan.`);
        return;
      }
      
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
        setError(""); // Clear any tag limit errors
      }
      setTagInput("");
    }
  };
  const handleTagRemove = (tag) => setTags(tags.filter((t) => t !== tag));

  // AI Suggestion
  const handleAISuggestion = async (mode = "rewrite") => {
    if (!content.trim()) {
      setError("Write some content first.");
      return;
    }
    setAiLoading(true);
    setAiMode(mode);
    setAiSuggestion("");

    try {
      const res = await fetch("/api/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, mode }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setAiSuggestion(data.suggestion || "AI returned no text.");
    } catch (err) {
      console.error("❌ AI failed:", err);
      setAiSuggestion("AI could not generate text. Try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // Insert AI Suggestion
  const handleInsertAISuggestion = () => {
    if (!aiSuggestion) return;

    if (aiMode === "continue") {
      editorRef.current?.insertHTML(`<p>${aiSuggestion}</p>`); // append
      setContent((prev) => prev + " " + aiSuggestion);
    } else {
      editorRef.current?.setContent(`<p>${aiSuggestion}</p>`); // replace
      setContent(aiSuggestion);
    }

    setAiSuggestion("");
    setAiMode("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Subscription Status Widget */}
      {subscription && (
        <div className={`p-4 rounded-lg border ${
          isPremium ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-sm">
              {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
              {isPremium && <span className="ml-2 text-green-600">✓ Active</span>}
            </h3>
            {!isPremium && (
              <a href="/billing" className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                Upgrade
              </a>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-gray-600">Posts:</span>
              <div className={`font-medium ${
                postsLimit === -1 ? 'text-green-600' : 
                postsUsed >= postsLimit ? 'text-red-600' : 
                postsUsed / postsLimit > 0.8 ? 'text-yellow-600' : 'text-gray-800'
              }`}>
                {postsUsed}/{postsLimit === -1 ? '∞' : postsLimit}
              </div>
              {postsLimit !== -1 && (
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div 
                    className={`h-1 rounded-full ${
                      postsUsed >= postsLimit ? 'bg-red-500' : 
                      postsUsed / postsLimit > 0.8 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min((postsUsed / postsLimit) * 100, 100)}%` }}
                  />
                </div>
              )}
            </div>
            
            <div>
              <span className="text-gray-600">Tags:</span>
              <div className={`font-medium ${
                tags.length >= maxTags ? 'text-red-600' : 
                tags.length / maxTags > 0.8 ? 'text-yellow-600' : 'text-gray-800'
              }`}>
                {tags.length}/{maxTags}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                <div 
                  className={`h-1 rounded-full ${
                    tags.length >= maxTags ? 'bg-red-500' : 
                    tags.length / maxTags > 0.8 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min((tags.length / maxTags) * 100, 100)}%` }}
                />
              </div>
            </div>
            
            <div>
              <span className="text-gray-600">File Size:</span>
              <div className="font-medium text-gray-800">
                Max {maxFileSize}MB
              </div>
            </div>
            
            <div>
              <span className="text-gray-600">Features:</span>
              <div className="font-medium text-gray-800">
                {isPremium ? (
                  <span className="text-green-600">All ✓</span>
                ) : (
                  <span className="text-yellow-600">Basic</span>
                )}
              </div>
            </div>
          </div>
          
          {!canCreatePost && (
            <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-red-700 text-sm">
              ⚠️ You've reached your post limit. <a href="/billing" className="underline">Upgrade now</a> to create more posts!
            </div>
          )}
        </div>
      )}
      
      {error && (
        <div className={`p-3 rounded border ${
          error.includes('upgrade') || error.includes('limit') 
            ? 'bg-red-50 border-red-200 text-red-700' 
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {error}
          {(error.includes('upgrade') || error.includes('limit')) && (
            <div className="mt-2">
              <a href="/billing" className="inline-block bg-blue-600 text-white px-3 py-1 rounded text-sm">
                Upgrade Plan →
              </a>
            </div>
          )}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter blog title"
          required
          className="w-full p-2 border rounded"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Tags (press Enter)
        </label>
        <input
          type="text"
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagAdd}
          placeholder="Add a tag"
          className="w-full p-2 border rounded"
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-200 rounded text-sm flex items-center gap-1"
            >
              {tag}
              <button
                type="button"
                onClick={() => handleTagRemove(tag)}
                className="text-xs text-red-500"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Cover Image (optional)
        </label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {previewUrl && (
          <img src={previewUrl} alt="Preview" className="h-32 mt-2 rounded" />
        )}
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium mb-1">Content</label>
        <TipTapEditor
          ref={editorRef}
          onChange={setContent}
          initialContent={content}
        />
        <p className="text-xs text-gray-500 mt-1">
          {wordCount} words • ~{readingTime} min read
        </p>
      </div>

      {/* AI Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          disabled={aiLoading}
          onClick={() => handleAISuggestion("rewrite")}
          className="px-3 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
        >
          {aiLoading && aiMode === "rewrite" ? "Thinking..." : "Rewrite"}
        </button>
        <button
          type="button"
          disabled={aiLoading}
          onClick={() => handleAISuggestion("summarize")}
          className="px-3 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          {aiLoading && aiMode === "summarize" ? "Thinking..." : "Summarize"}
        </button>
        <button
          type="button"
          disabled={aiLoading}
          onClick={() => handleAISuggestion("continue")}
          className="px-3 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50"
        >
          {aiLoading && aiMode === "continue" ? "Thinking..." : "Continue"}
        </button>
      </div>

      {/* AI Suggestion Output */}
      {aiSuggestion && (
        <div className="mt-4 p-3 border rounded bg-gray-50">
          <h3 className="font-semibold mb-2">
            AI Suggestion ({aiMode})
          </h3>
          <p className="text-gray-700 whitespace-pre-line mb-3">{aiSuggestion}</p>
          <button
            type="button"
            onClick={handleInsertAISuggestion}
            className="px-3 py-1 bg-primary text-primary-foreground rounded"
          >
            Insert
          </button>
        </div>
      )}

      {/* Scheduling */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Schedule publish (optional)</label>
          <input type="datetime-local" className="w-full p-2 border rounded" onChange={(e) => (window.__scheduledAt = e.target.value)} />
          <p className="text-xs text-gray-500 mt-1">If set in the future, the post will publish automatically at that time.</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            setError("");
            setLoading(true);
            try {
              const formData = new FormData();
              formData.append("title", title);
              formData.append("content", content);
              formData.append("category", category);
              formData.append("tags", JSON.stringify(tags));
              if (imageFile) formData.append("image", imageFile);
              formData.append("status", "draft");
              const res = await fetch("/api/blogs", { method: "POST", body: formData });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Failed to save draft");
              setTitle(""); setCategory("General"); setTags([]); setTagInput(""); setImageFile(null); setPreviewUrl(""); setContent("");
              router.push(`/blog/${data.slug}`);
            } catch (err) {
              setError(err.message || "Failed to save draft");
            } finally {
              setLoading(false);
            }
          }}
          className="px-4 py-2 bg-gray-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Draft"}
        </button>

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-primary text-primary-foreground rounded disabled:opacity-50"
        >
          {loading ? "Publishing..." : "Publish"}
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={async () => {
            setError("");
            setLoading(true);
            try {
              const formData = new FormData();
              formData.append("title", title);
              formData.append("content", content);
              formData.append("category", category);
              formData.append("tags", JSON.stringify(tags));
              if (imageFile) formData.append("image", imageFile);
              if (window.__scheduledAt) formData.append("scheduledAt", window.__scheduledAt);
              formData.append("status", "published");
              const res = await fetch("/api/blogs", { method: "POST", body: formData });
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Failed to schedule post");
              setTitle(""); setCategory("General"); setTags([]); setTagInput(""); setImageFile(null); setPreviewUrl(""); setContent("");
              router.push(`/blog/${data.slug}`);
            } catch (err) {
              setError(err.message || "Failed to schedule post");
            } finally {
              setLoading(false);
            }
          }}
          className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Scheduling..." : "Schedule"}
        </button>

        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          {showPreview ? "Hide Preview" : "Live Preview"}
        </button>
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="mt-6 border-t pt-4">
          <h2 className="text-lg font-bold mb-2">
            {title || "Untitled Post"}
          </h2>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Preview"
              className="h-48 w-full object-cover rounded mb-4"
            />
          )}
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      )}
    </form>
  );
}
