"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getPusherClient } from "@/lib/pusherClient";
import { Button } from "@/components/ui/Button";
import Avatar, { AvatarSizes } from "@/components/ui/Avatar";
import ThemeToggle from "@/components/layout/ThemeToggle";

// Lazy-load the portal on client only
const ChatbotPortal = dynamic(() => import("@/components/chat/ChatBotPortal"), {
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
    ...(user?.role === "ADMIN" ? [{ name: "Admin", href: "/admin", icon: "🛠️" }] : []),
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-md hover:bg-accent transition-colors"
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <Avatar
          src={user?.image}
          alt={user?.name || user?.email || "User"}
          size={AvatarSizes.sm}
          fallbackText={user?.name?.charAt(0) || user?.email?.charAt(0) || "U"}
          className="ring-1 ring-border"
        />
        <span className="hidden sm:block text-foreground font-medium max-w-[12ch] truncate">
          {user?.name || "User"}
        </span>
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

/* -------------------- Nav Links - Mintlify style -------------------- */
const NavLinks = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Resources", href: "/resources" },
    { name: "Documentation", href: "/docs" },
    { name: "Blog", href: "/blog" },
    { name: "Pricing", href: "/pricing" },
  ];

  return (
    <div className="hidden md:flex items-center gap-8">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`text-xs font-medium transition-colors hover:text-gray-900 ${
              isActive
                ? "text-gray-900 pb-1 border-b border-primary"
                : "text-gray-600"
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
    <nav className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo - Mintlify style */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span className="font-medium text-primary text-sm">BlogSphere</span>
          </Link>

          {/* Nav Links - Removed */}

          {/* Right side - Mintlify style */}
          <div className="flex items-center gap-3">
            {/* Search bar */}
            <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input 
                type="text" 
                placeholder="Search or ask" 
                className="bg-transparent border-none outline-none text-xs text-gray-600 placeholder-gray-500 w-28"
              />
              <kbd className="px-2 py-0.5 text-xs bg-gray-200 rounded text-gray-600">⌘K</kbd>
            </div>
            
            {/* AI Chat Button */}
            <button 
              onClick={() => setChatOpen(!chatOpen)}
              className="hidden md:flex items-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Ask AI
            </button>

            {/* Contact Sales / Auth */}
            {status === "loading" ? (
              <span className="text-xs text-gray-500">Loading...</span>
            ) : session ? (
              <UserDropdown user={session.user} onSignOut={signOut} />
            ) : (
              <>
                <button 
                  onClick={() => signIn()}
                  className="hidden sm:inline-flex text-xs font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Contact sales
                </button>
                <button 
                  onClick={() => signIn()}
                  className="bg-white text-gray-900 border border-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-gray-50 transition-colors"
                >
                  Start for free
                </button>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => {
                console.log('Mobile menu clicked, current state:', mobileOpen);
                setMobileOpen(!mobileOpen);
              }}
              className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-lg text-foreground hover:text-primary hover:bg-accent transition-all duration-200 relative border-2 border-primary/20 bg-background shadow-lg"
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
            >
              <div className="relative w-6 h-6">
                <span 
                  className={`absolute block h-0.5 w-6 bg-current rounded-sm transition-all duration-300 ease-in-out transform ${
                    mobileOpen ? 'rotate-45 translate-y-2' : 'translate-y-0'
                  }`}
                />
                <span 
                  className={`absolute block h-0.5 w-6 bg-current rounded-sm transition-all duration-300 ease-in-out transform translate-y-2 ${
                    mobileOpen ? 'opacity-0' : 'opacity-100'
                  }`}
                />
                <span 
                  className={`absolute block h-0.5 w-6 bg-current rounded-sm transition-all duration-300 ease-in-out transform translate-y-4 ${
                    mobileOpen ? '-rotate-45 -translate-y-2' : 'translate-y-0'
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out border-t border-border ${
        mobileOpen ? 'block' : 'hidden'
      }`}>
        <div className="bg-background shadow-lg">
          <div className="container-mobile py-6 space-y-4">
            {/* Navigation Links */}
            <div className="space-y-1">
              {[
                { name: "Home", href: "/", icon: "🏠" },
                { name: "Dashboard", href: "/dashboard", icon: "📊" },
                { name: "Stories", href: "/blog", icon: "📚" },
                { name: "Features", href: "/features", icon: "⭐" },
                { name: "Pricing", href: "/pricing", icon: "💰" }
              ].map((item, index) => {
                const isActive = typeof window !== 'undefined' && window.location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-lg transition-colors animate-fade-in ${
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                    onClick={() => setMobileOpen(false)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
            
            {/* AI Assistant Toggle */}
            <div className="border-t border-border/50 pt-4">
              <Button
                size="md"
                variant={chatOpen ? "default" : "outline"}
                onClick={() => {
                  setChatOpen(!chatOpen);
                  setMobileOpen(false);
                }}
                className="w-full justify-start gap-2 animate-fade-in"
                style={{ animationDelay: '250ms' }}
                aria-expanded={chatOpen}
                aria-controls="ai-assistant"
              >
                <span className="text-lg">💬</span>
                AI Assistant {chatOpen ? "(Open)" : ""}
              </Button>
            </div>
            
            {/* Auth Actions */}
            <div className="border-t border-border/50 pt-4">
              {status === "authenticated" ? (
                <Button 
                  className="w-full justify-start gap-2 animate-fade-in" 
                  variant="ghost" 
                  onClick={() => {
                    signOut();
                    setMobileOpen(false);
                  }}
                  style={{ animationDelay: '300ms' }}
                >
                  <span className="text-lg">🚪</span>
                  Sign Out
                </Button>
              ) : (
                <div className="space-y-2">
                  <Button 
                    className="w-full justify-start gap-2 animate-fade-in" 
                    variant="outline" 
                    onClick={() => {
                      signIn();
                      setMobileOpen(false);
                    }}
                    style={{ animationDelay: '300ms' }}
                  >
                    <span className="text-lg">👋</span>
                    Sign In
                  </Button>
                  <Button 
                    as="link" 
                    href="/auth/signup" 
                    className="w-full justify-start gap-2 animate-fade-in"
                    onClick={() => setMobileOpen(false)}
                    style={{ animationDelay: '350ms' }}
                  >
                    <span className="text-lg">🚀</span>
                    Get Started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Chatbot via Portal (outside Navbar DOM) */}
      <ChatbotPortal open={chatOpen} onClose={() => setChatOpen(false)} />
    </nav>
  );
}
