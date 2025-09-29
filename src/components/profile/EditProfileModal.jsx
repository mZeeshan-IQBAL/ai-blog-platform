// components/profile/EditProfileModal.jsx
"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import AvatarCropper from "@/components/profile/AvatarCropper";
import Avatar, { AvatarSizes } from "@/components/ui/Avatar";

export default function EditProfileModal({ profile, onClose, onUpdate }) {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({
    name: profile?.name || session?.user?.name || "",
    bio: profile?.bio || "",
    website: profile?.website || "",
    location: profile?.location || ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(profile?.image || session?.user?.image || "");
  const [showCropper, setShowCropper] = useState(false);
  const fileInputRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1) Upload avatar if selected
      if (imageFile) {
        const form = new FormData();
        form.append("image", imageFile);
        const avatarRes = await fetch("/api/profile/avatar", { method: "POST", body: form });
        if (!avatarRes.ok) {
          const er = await avatarRes.json().catch(() => ({}));
          throw new Error(er.error || "Avatar upload failed");
        }
      }

      // 2) Update basic profile fields
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const updatedProfile = await res.json();
        onUpdate(updatedProfile);
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Failed to update profile");
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Avatar uploader */}
          <div className="flex items-center gap-4">
            <Avatar
              src={imagePreview}
              alt="Avatar preview"
              size={AvatarSizes.xl}
              fallbackText={profile?.name?.charAt(0) || session?.user?.name?.charAt(0) || "U"}
              className="border"
            />
            <div className="space-x-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
              >
                {imagePreview ? "Change Photo" : "Add Photo"}
              </button>
              {imageFile && (
                <button
                  type="button"
                  onClick={() => setShowCropper(true)}
                  className="px-3 py-2 border rounded-lg text-sm hover:bg-gray-50"
                >
                  Crop
                </button>
              )}
              {imagePreview && (
                <button
                  type="button"
                  onClick={() => { setImageFile(null); setImagePreview(""); }}
                  className="px-3 py-2 border rounded-lg text-sm text-red-600 hover:bg-red-50"
                >
                  Remove
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); setShowCropper(true); }
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Website
            </label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://yourwebsite.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="City, Country"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>

      {showCropper && imageFile && (
        <AvatarCropper
          file={imageFile}
          initialUrl={imagePreview}
          onCancel={() => setShowCropper(false)}
          onCropped={(cropped, dataUrl) => {
            setImageFile(cropped);
            setImagePreview(dataUrl);
            setShowCropper(false);
          }}
        />
      )}
    </div>
  );
}
