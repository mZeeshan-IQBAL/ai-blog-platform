"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import Image from "next/image";

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    notificationPreferences: {
      likes: true,
      comments: true,
      bookmarks: true,
      follows: true
    }
  });

  useEffect(() => {
    if (status === "authenticated") {
      fetchSettings();
    }
  }, [status]);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    setSaving(true);
    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        toast.success("Settings saved successfully!");
        setSettings(newSettings);
      } else {
        toast.error("Failed to save settings");
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleEmailNotificationsToggle = (enabled) => {
    const newSettings = {
      ...settings,
      emailNotifications: enabled
    };
    setSettings(newSettings);
    updateSettings(newSettings);
  };

  const handleNotificationPreferenceToggle = (type) => {
    const newSettings = {
      ...settings,
      notificationPreferences: {
        ...settings.notificationPreferences,
        [type]: !settings.notificationPreferences[type]
      }
    };
    setSettings(newSettings);
    updateSettings(newSettings);
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You need to be signed in to access settings.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <p className="eyebrow">Account</p>
        <h1 className="section-title">Settings</h1>
        <p className="section-subtitle mt-1">Manage your preferences and notifications.</p>
      </div>

      {/* Profile Info */}
      <div className="card card-padding card-hover mb-6">
        <h2 className="text-base sm:text-lg font-semibold mb-4 text-foreground">Profile Information</h2>
        <div className="flex items-center space-x-4">
          {session?.user?.image && (
            <Image 
              src={session.user.image} 
              alt={session.user.name} 
              width={64}
              height={64}
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <h3 className="text-base sm:text-lg font-medium text-foreground">{session?.user?.name}</h3>
            <p className="text-muted-foreground">{session?.user?.email}</p>
          </div>
        </div>
      </div>

      {/* Email Notifications */}
      <div className="card card-padding card-hover mb-6">
        <h2 className="text-base sm:text-lg font-semibold mb-4 text-foreground">Email Notifications</h2>
        
        {/* Master Toggle */}
        <div className="flex items-center justify-between mb-6 p-4 bg-secondary rounded-lg">
          <div>
            <h3 className="font-medium text-foreground">Enable Email Notifications</h3>
            <p className="text-sm text-muted-foreground">
              Receive email notifications for activities on your posts
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleEmailNotificationsToggle(e.target.checked)}
              className="sr-only peer"
              disabled={saving}
            />
            <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Specific Notification Types */}
        {settings.emailNotifications && (
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 mb-3">Notification Types</h3>
            
            {/* Likes */}
            <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👍</span>
                <div>
                  <h4 className="font-medium">Likes</h4>
                  <p className="text-sm text-muted-foreground">When someone likes your post</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationPreferences.likes}
                  onChange={() => handleNotificationPreferenceToggle('likes')}
                  className="sr-only peer"
                  disabled={saving}
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Comments */}
            <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">💬</span>
                <div>
                  <h4 className="font-medium">Comments</h4>
                  <p className="text-sm text-muted-foreground">When someone comments on your post</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationPreferences.comments}
                  onChange={() => handleNotificationPreferenceToggle('comments')}
                  className="sr-only peer"
                  disabled={saving}
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Bookmarks */}
            <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔖</span>
                <div>
                  <h4 className="font-medium">Bookmarks</h4>
                  <p className="text-sm text-muted-foreground">When someone bookmarks your post</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationPreferences.bookmarks}
                  onChange={() => handleNotificationPreferenceToggle('bookmarks')}
                  className="sr-only peer"
                  disabled={saving}
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Follows */}
            <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👥</span>
                <div>
                  <h4 className="font-medium">Follows</h4>
                  <p className="text-sm text-muted-foreground">When someone follows you</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationPreferences.follows}
                  onChange={() => handleNotificationPreferenceToggle('follows')}
                  className="sr-only peer"
                  disabled={saving}
                />
                <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-ring rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        )}

        {saving && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">Saving changes...</p>
          </div>
        )}
      </div>

      {/* Additional Settings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">About</h2>
        <p className="text-gray-600">
          Manage your notification preferences to control when and how you receive 
          email notifications about activities on your posts and profile.
        </p>
      </div>
    </div>
  );
}