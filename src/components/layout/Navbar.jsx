// components/layout/Navbar.jsx
"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import useSearch from "@/app/hooks/useSearch";
import { usePathname } from "next/navigation";
import { getPusherClient } from "@/lib/pusherClient";

/* -------------------- User Dropdown -------------------- */
const UserDropdown = ({ user, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "Profile", href: "/profile", icon: "👤" },
    { name: "Dashboard", href: "/dashboard", icon: "📊" },
    { name: "My Posts", href: "/my-posts", icon: "📝" },
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
  const pathname = usePathname();
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

    // ✅ Only proceed if we have a complete session with providerId AND status is authenticated
    if (!session?.user?.providerId || status !== "authenticated") {
      return;
    }

    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = `private-user-${session.user.providerId}`;
    console.log("📡 Subscribing to:", channelName);

    // ✅ Create new channel
    const channel = pusher.subscribe(channelName);

    // Bind notification event
    channel.bind("notification", (data) => {
      console.log("📩 Notification received:", data);
      setNotifications((prev) => [data, ...prev]);
    });

    // Bind error event for better debugging
    channel.bind("error", (err) => {
      console.error("🚨 Channel error:", err);
    });

    // Return cleanup function
    return () => {
      console.log("🧹 Unsubscribing from:", channelName);
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
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 text-gray-400 hover:text-gray-600"
                >
                  🔔
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-lg border z-30">
                    <div className="p-2 border-b text-sm font-semibold text-gray-700">
                      Notifications
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-3 text-sm text-gray-500">No notifications yet</div>
                      ) : (
                        notifications.map((n, i) => (
                          <div key={i} className="p-3 border-b last:border-none text-sm text-gray-700">
                            <span className="font-medium">{n.fromUser?.name}</span>{" "}
                            {n.type === "follow" && "followed you"}
                            {n.type === "like" && "liked your post"}
                            {n.type === "comment" && "commented on your post"}
                            {n.type === "bookmark" && "bookmarked your post"}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
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
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              ☰
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}