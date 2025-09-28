"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getPusherClient } from "@/lib/pusherClient";
import { Button } from "@/components/ui/Button";

// Lazy-load the portal on client only
const ChatbotPortal = dynamic(() => import("@/components/chat/ChatbotPortal"), {
  ssr: false,
});

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
        className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-md flex items-center justify-center text-white text-sm font-semibold">
          {user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
        </div>
        <span className="hidden sm:block text-foreground font-medium">{user?.name || "User"}</span>
        <svg
          className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
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
          <div className="absolute right-0 top-full mt-2 w-48 bg-popover text-popover-foreground rounded-lg shadow-xl border border-border py-2 z-20">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            ))}
            <div className="border-t border-border mt-2 pt-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSignOut();
                }}
                className="flex items-center gap-3 px-4 py-2 text-sm text-destructive hover:bg-accent w-full text-left"
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
    { name: "Dashboard", href: "/dashboard" },
    { name: "View Blogs", href: "/blog" },
    { name: "Features", href: "/features" },
    { name: "Pricing", href: "/pricing" },
  ];

  return (
    <div className="hidden md:flex items-center gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`px-4 py-2 rounded-md font-medium ${
              isActive
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
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

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifOpen && !event.target.closest(".notification-dropdown")) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

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
    <nav className="w-full sticky top-0 z-40 backdrop-blur bg-background/80 supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-md flex items-center justify-center text-white text-lg font-bold">
              BS
            </div>
            <span className="text-xl font-bold">BlogSphere With AI</span>
          </Link>

          {/* Nav Links */}
          <NavLinks />

          <div className="flex items-center gap-3">
            {/* Notifications */}
            {session && status === "authenticated" && (
              <div className="relative notification-dropdown">
                <button
                  onClick={() => setNotifOpen(!notifOpen)}
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  aria-label="Open notifications"
                >
                  🔔
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center font-bold">
                      {notifications.length > 9 ? "9+" : notifications.length}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-popover text-popover-foreground shadow-xl rounded-lg border border-border z-30">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                      <h3 className="text-sm font-semibold">
                        Notifications ({notifications.length})
                      </h3>
                      {notifications.length > 0 && (
                        <button
                          onClick={() => setNotifications([])}
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-muted-foreground text-sm">
                          No notifications yet
                        </div>
                      ) : (
                        notifications.map((n, i) => (
                          <div
                            key={i}
                            className="p-3 border-b border-border last:border-none hover:bg-accent"
                          >
                            {n.fromUser?.name} {n.type}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Chat toggle */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                onClick={() => setChatOpen(!chatOpen)}
                size="sm"
                variant={chatOpen ? "default" : "secondary"}
                className={chatOpen ? "bg-primary text-primary-foreground" : ""}
                aria-expanded={chatOpen}
                aria-controls="ai-assistant"
              >
                💬 Talk to AI {chatOpen ? "(Open)" : ""}
              </Button>
            </div>

            {/* Auth */}
            {status === "loading" ? (
              <span className="text-sm text-muted-foreground">Loading...</span>
            ) : session ? (
              <UserDropdown user={session.user} onSignOut={signOut} />
            ) : (
              <>
                <Button onClick={() => signIn()} variant="ghost" size="sm">
                  Sign In
                </Button>
                <Button as="link" href="/auth/signup" className="hidden lg:inline-flex">
                  Get Started
                </Button>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? "✖" : "☰"}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border">
          <div className="px-4 py-3 space-y-2 bg-background">
            <div className="flex flex-col gap-2">
              <Link
                href="/"
                className="w-full text-left px-4 py-2 rounded-md border border-border hover:bg-accent"
                onClick={() => setMobileOpen(false)}
              >
                Home
              </Link>
              <Link
                href="/blog"
                className="w-full text-left px-4 py-2 rounded-md border border-border hover:bg-accent"
                onClick={() => setMobileOpen(false)}
              >
                Stories
              </Link>
              <Link
                href="/features"
                className="w-full text-left px-4 py-2 rounded-md border border-border hover:bg-accent"
                onClick={() => setMobileOpen(false)}
              >
                Features
              </Link>
              <Link
                href="/pricing"
                className="w-full text-left px-4 py-2 rounded-md border border-border hover:bg-accent"
                onClick={() => setMobileOpen(false)}
              >
                Pricing
              </Link>
            </div>
            <div className="flex items-center justify-end pt-2">
              <Button
                size="sm"
                variant={chatOpen ? "default" : "secondary"}
                onClick={() => setChatOpen(!chatOpen)}
                className={chatOpen ? "bg-primary text-primary-foreground" : ""}
                aria-expanded={chatOpen}
                aria-controls="ai-assistant"
              >
                💬 AI Assistant {chatOpen ? "(Open)" : ""}
              </Button>
            </div>
            <div className="pt-2">
              {status === "authenticated" ? (
                <Button className="w-full" variant="destructive" onClick={() => signOut()}>
                  Sign Out
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button className="flex-1" variant="outline" onClick={() => signIn()}>
                    Sign In
                  </Button>
                  <Button as="link" href="/auth/signup" className="flex-1">
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Chatbot via Portal (outside Navbar DOM) */}
      <ChatbotPortal open={chatOpen} onClose={() => setChatOpen(false)} />
    </nav>
  );
}
