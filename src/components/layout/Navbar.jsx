// components/layout/Navbar.jsx
"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import useSearch from "@/app/hooks/useSearch";
import { getPusherClient } from "@/lib/pusherClient";

/* -------------------- User Dropdown -------------------- */
const UserDropdown = ({ user, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Profile", href: "/profile", icon: "👤" },
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "My Posts", href: "/my-posts", icon: "📝" },
    { name: "Settings", href: "/settings", icon: "⚙️" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
          {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
        </div>
        <span className="hidden sm:block text-gray-700 font-medium">
          {user?.name || "User"}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border py-2 z-20">
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            ))}
            <div className="border-t mt-2 pt-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSignOut();
                }}
                className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/* -------------------- Nav Links -------------------- */
const NavLinks = () => {
  const [pathname, setPathname] = useState('');
  
  useEffect(() => {
    // Safely get pathname on client side
    if (typeof window !== 'undefined') {
      try {
        const path = window.location.pathname;
        setPathname(path);
      } catch (error) {
        console.error('Error getting pathname:', error);
      }
    }
  }, []);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Blogs", href: "/blog" },
    { name: "Features", href: "/features" },
    { name: "Plans & Pricing", href: "/pricing" },
  ];
  return (
    <div className="hidden md:flex items-center gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`px-4 py-2 rounded-lg font-medium ${
              isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
};

/* -------------------- Quick Search -------------------- */
const QuickSearch = () => {
  const { query, setQuery, results, loading } = useSearch();
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="hidden lg:block relative">
      <input
        type="text"
        placeholder="Quick search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 200)}
        className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
      />
      <svg
        className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      {isOpen && query && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border py-2 z-20">
          {loading && <div className="px-3 py-2 text-sm text-gray-500">Searching...</div>}
          {!loading && results.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">No results</div>
          )}
          {!loading &&
            results.slice(0, 5).map((post) => (
              <Link
                key={post._id || post.id}
                href={`/blog/${post.slug || post._id}`}
                className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                {post.title}
              </Link>
            ))}
        </div>
      )}
    </div>
  );
};

/* -------------------- Navbar -------------------- */
export default function Navbar() {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  useEffect(() => {
    console.log("🔑 Session user:", session?.user);
    console.log("📊 Session status:", status);

    // ✅ Only proceed if we have a complete session with providerId AND status is authenticated
    if (!session?.user?.providerId || status !== "authenticated") {
      console.log("⚠️ Skipping Pusher setup - missing providerId or not authenticated");
      console.log("🔍 providerId:", session?.user?.providerId);
      console.log("🔍 status:", status);
      return;
    }

    const pusher = getPusherClient();
    if (!pusher) {
      console.error("🚨 Failed to get Pusher client");
      return;
    }

    const channelName = `private-user-${session.user.providerId}`;
    console.log("📡 Setting up Pusher connection...");
    console.log("📡 Subscribing to:", channelName);
    console.log("👤 User ID:", session.user.id);
    console.log("🔖 Provider ID:", session.user.providerId);

    // ✅ Create new channel
    const channel = pusher.subscribe(channelName);

    // Log subscription success
    channel.bind('pusher:subscription_succeeded', () => {
      console.log('✅ Successfully subscribed to', channelName);
    });

    channel.bind('pusher:subscription_error', (error) => {
      console.error('❌ Subscription failed for', channelName, error);
    });

    // Bind notification event
    channel.bind("notification", (data) => {
      console.log("📩 Notification received:", data);
      console.log("🕰️ Timestamp:", new Date().toLocaleString());
      
      // Add notification to state
      setNotifications((prev) => {
        const newNotifications = [data, ...prev];
        console.log("📎 Updated notifications count:", newNotifications.length);
        return newNotifications;
      });
      
      // Optional: Show browser notification
      if (Notification.permission === 'granted') {
        new Notification(`${data.fromUser?.name} ${data.type === 'follow' ? 'followed you' : data.type === 'like' ? 'liked your post' : data.type === 'comment' ? 'commented on your post' : 'bookmarked your post'}`);
      }
    });

    // Bind error event for better debugging
    channel.bind("error", (err) => {
      console.error("🚨 Channel error:", err);
    });

    // Log connection state
    pusher.connection.bind('state_change', (states) => {
      console.log('🔄 Pusher connection state changed:', states.previous, '->', states.current);
    });

    // Return cleanup function
    return () => {
      console.log("🧧 Cleaning up Pusher subscription:", channelName);
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [session?.user?.providerId, status]); // ✅ This dependency is correct

  return (
    <nav className="w-full bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg font-bold">
              AI
            </div>
            <span className="text-xl font-bold text-gray-900">AI Knowledge Hub</span>
          </Link>

          <NavLinks />

          <div className="flex items-center gap-4">
            <QuickSearch />

            {/* 🔔 Notifications */}
            {session && status === "authenticated" && (
              <div className="relative">
                <button
                  onClick={() => {
                    console.log('🔔 Notification button clicked, current state:', notifOpen);
                    console.log('📢 Current notifications:', notifications);
                    setNotifOpen(!notifOpen);
                  }}
                  className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title={`${notifications.length} notifications`}
                >
                  🔔
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {notifications.length > 9 ? '9+' : notifications.length}
                    </span>
                  )}
                </button>
                {notifOpen && (
                  <>
                    {/* Click outside overlay */}
                    <div 
                      className="fixed inset-0 z-20" 
                      onClick={() => {
                        console.log('🔒 Notification overlay clicked, closing...');
                        setNotifOpen(false);
                      }} 
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-lg border z-30">
                      <div className="flex items-center justify-between p-4 border-b">
                        <h3 className="text-sm font-semibold text-gray-700">
                          Notifications ({notifications.length})
                        </h3>
                        {notifications.length > 0 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log('🧧 Clearing all notifications');
                              setNotifications([]);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                          >
                            Clear all
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center">
                            <div className="text-4xl mb-2">🔔</div>
                            <div className="text-sm text-gray-500">
                              No notifications yet
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              When someone likes, comments, bookmarks, or follows you, you'll see it here!
                            </div>
                          </div>
                        ) : (
                          notifications.map((n, i) => (
                            <div key={i} className="p-3 border-b last:border-none hover:bg-gray-50 transition-colors">
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0">
                                  {n.type === "follow" && "👥"}
                                  {n.type === "like" && "👍"}
                                  {n.type === "comment" && "💬"}
                                  {n.type === "bookmark" && "🔖"}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-900">
                                    <span className="font-medium">{n.fromUser?.name || 'Someone'}</span>{" "}
                                    {n.type === "follow" && "started following you"}
                                    {n.type === "like" && "liked your post"}
                                    {n.type === "comment" && "commented on your post"}
                                    {n.type === "bookmark" && "bookmarked your post"}
                                  </p>
                                  {n.extra?.postTitle && (
                                    <p className="text-xs text-gray-500 truncate mt-1">
                                      "{n.extra.postTitle}"
                                    </p>
                                  )}
                                  <p className="text-xs text-gray-400 mt-1">
                                    {new Date(n.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Auth */}
            <div className="flex items-center gap-3">
              {status === "loading" ? (
                <span className="text-sm text-gray-500">Loading...</span>
              ) : session ? (
                <UserDropdown user={session.user} onSignOut={signOut} />
              ) : (
                <>
                  <button
                    onClick={() => signIn()}
                    className="text-gray-600 hover:text-blue-600 font-medium"
                  >
                    Sign In
                  </button>
                  <Link
                    href="/auth/signup"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 shadow-md"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
              aria-label="Toggle mobile menu"
            >
              {mobileOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
        
        {/* 📱 Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t">
              {/* Mobile Navigation Links */}
              {[
                { name: "Home", href: "/" },
                { name: "Blogs", href: "/blog" },
                { name: "Features", href: "/features" },
                { name: "Plans & Pricing", href: "/pricing" },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Auth Section */}
              {session ? (
                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center px-3 py-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                      {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "U"}
                    </div>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{session.user?.name}</div>
                      <div className="text-sm font-medium text-gray-500">{session.user?.email}</div>
                    </div>
                  </div>
                  
                  {/* Mobile User Menu Items */}
                  {[
                    { name: "Profile", href: "/profile", icon: "👤" },
                    { name: "Dashboard", href: "/dashboard", icon: "📊" },
                    { name: "My Posts", href: "/my-posts", icon: "📝" },
                    { name: "Settings", href: "/settings", icon: "⚙️" },
                  ].map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.name}
                    </Link>
                  ))}
                  
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      signOut();
                    }}
                    className="flex items-center w-full px-3 py-2 text-base font-medium text-red-600 hover:bg-red-50 rounded-md"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              ) : (
                <div className="border-t pt-4 mt-4 space-y-2">
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      signIn();
                    }}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md"
                  >
                    Sign In
                  </button>
                  <Link
                    href="/auth/signup"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md text-center"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}