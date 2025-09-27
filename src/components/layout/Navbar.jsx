// components/layout/Navbar.jsx
"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { getPusherClient } from "@/lib/pusherClient";
import Chatbot from "@/components/chat/Chatbot";

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
  const [pathname, setPathname] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        setPathname(window.location.pathname);
      } catch (error) {
        console.error("Error getting pathname:", error);
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
              isActive
                ? "bg-blue-50 text-blue-600"
                : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
};

/* -------------------- Navbar -------------------- */
export default function Navbar() {
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    if (!session?.user?.providerId || status !== "authenticated") return;

    const pusher = getPusherClient();
    if (!pusher) return;

    const channelName = `private-user-${session.user.providerId}`;
    const channel = pusher.subscribe(channelName);

    channel.bind("notification", (data) => {
      setNotifications((prev) => [data, ...prev]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, [session?.user?.providerId, status]);

  return (
    <nav className="w-full bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white text-lg font-bold">
              AI
            </div>
            <span className="text-xl font-bold text-gray-900">AI Knowledge Hub</span>
          </Link>

          {/* Nav Links */}
          <NavLinks />

          <div className="flex items-center gap-4">
            {/* Notifications */}
            {session && status === "authenticated" && (
              <div className="relative">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  🔔
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {notifications.length > 9 ? "9+" : notifications.length}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-lg border z-30">
                    <div className="flex items-center justify-between p-4 border-b">
                      <h3 className="text-sm font-semibold text-gray-700">
                        Notifications ({notifications.length})
                      </h3>
                      {notifications.length > 0 && (
                        <button
                          onClick={() => setNotifications([])}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 text-sm">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n, i) => (
                          <div key={i} className="p-3 border-b last:border-none hover:bg-gray-50">
                            {n.fromUser?.name} {n.type}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 💬 Chatbot Button */}
            <button
              onClick={() => setChatOpen(true)}
            className="px-3 py-2 rounded-lg bg-neutral-700 text-white hover:bg-neutral-600 text-sm"

            >
             💬 AI Assistant
            </button>

            {/* Auth */}
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

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {mobileOpen ? "✖" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Chatbot */}
      {chatOpen && <Chatbot onClose={() => setChatOpen(false)} />}
    </nav>
  );
}
