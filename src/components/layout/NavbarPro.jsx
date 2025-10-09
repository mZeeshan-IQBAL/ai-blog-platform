"use client";
// components/layout/NavbarPro.jsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { getPusherClient } from "@/lib/pusherClient";
import { Button } from "@/components/ui/Button";
import Avatar, { AvatarSizes } from "@/components/ui/Avatar";

const NAV = [
  { name: "Home", href: "/" },
  { name: "View Blogs", href: "/blog" },
  { name: "Features", href: "/features" },
  { name: "Pricing", href: "/pricing" },
  { name: "Dashboard", href: "/dashboard" },
];

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3" aria-label="BlogSphere Home">
      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center text-white">
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      </div>
      <div className="leading-tight">
        <span className="block text-xl sm:text-2xl font-extrabold tracking-tight">
          <span className="text-primary">BlogSphere</span>
        </span>
        <span className="hidden sm:block text-xs text-muted-foreground">Write • Read • Connect</span>
      </div>
    </Link>
  );
}

function UserMenu({ user, onSignOut }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-md px-2 py-1 hover:bg-accent"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <Avatar src={user?.image} alt={user?.name || user?.email || "User"} size={AvatarSizes.sm} fallbackText={user?.name?.[0] || user?.email?.[0] || "U"} />
        <span className="hidden md:block text-sm font-medium max-w-[12ch] truncate">{user?.name || "User"}</span>
        <svg className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-popover text-popover-foreground shadow-xl z-20 overflow-hidden">
            <div className="px-4 py-3 border-b border-border">
              <p className="text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <div className="py-2">
              <Link href="/profile" className="block px-4 py-2 text-sm hover:bg-accent">Profile</Link>
              <Link href="/dashboard" className="block px-4 py-2 text-sm hover:bg-accent">Dashboard</Link>
              <Link href="/settings" className="block px-4 py-2 text-sm hover:bg-accent">Settings</Link>
              <Link href="/admin" className="block px-4 py-2 text-sm hover:bg-accent">Admin</Link>
            </div>
            <div className="border-t border-border">
              <button onClick={onSignOut} className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent">Sign out</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function NavbarPro() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Pusher notifications (kept lightweight)
  useEffect(() => {
    const uid = session?.user?.providerId || session?.user?.id;
    if (!uid) return;
    const pusher = getPusherClient();
    if (!pusher) return;
    const channel = pusher.subscribe(`private-user-${uid}`);
    channel.bind("notification", (data) => setNotifications((prev) => [data, ...prev].slice(0, 20)));
    return () => {
      try { channel.unbind_all(); channel.unsubscribe(); } catch (_) {}
    };
  }, [session?.user?.providerId, session?.user?.id]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifOpen && !e.target.closest(".notification-dropdown")) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notifOpen]);

  return (
    <header className="sticky top-0 z-50">
      <div className="backdrop-blur-md bg-background/80 border-b border-border supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto container-mobile">
          <div className="h-16 flex items-center justify-between gap-3">
            {/* Left: brand + mobile menu button */}
            <div className="flex items-center gap-2">
              <button
                className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-border hover:bg-accent"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <Brand />
            </div>

            {/* Center: nav links (desktop) */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      active ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right: actions */}
            <div className="flex items-center gap-2">
              <Link href="/search" className="hidden sm:inline-flex w-10 h-10 items-center justify-center rounded-md border border-border hover:bg-accent" aria-label="Search">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 10-14 0 7 7 0 0014 0z" /></svg>
              </Link>

              {status === "authenticated" && (
                <div className="relative notification-dropdown">
                  <button
                    onClick={() => setNotifOpen((v) => !v)}
                    className="relative inline-flex w-10 h-10 items-center justify-center rounded-md border border-border hover:bg-accent"
                    aria-label="Notifications"
                    aria-expanded={notifOpen}
                  >
                    🔔
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 rounded-full bg-destructive text-white text-xs font-bold">
                        {notifications.length > 9 ? "9+" : notifications.length}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-popover text-popover-foreground shadow-xl rounded-lg border border-border z-30">
                      <div className="flex items-center justify-between p-4 border-b border-border">
                        <h3 className="text-sm font-semibold">Notifications ({notifications.length})</h3>
                        {notifications.length > 0 && (
                          <button onClick={() => setNotifications([])} className="text-xs text-primary hover:underline font-medium">
                            Clear all
                          </button>
                        )}
                      </div>
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-6 text-center text-muted-foreground text-sm">No notifications yet</div>
                        ) : (
                          notifications.map((n, i) => (
                            <div key={i} className="p-3 border-b border-border last:border-none hover:bg-accent">
                              {n.fromUser?.name} {n.type}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}


              {status === "loading" ? (
                <span className="text-sm text-muted-foreground">Loading…</span>
              ) : session ? (
                <UserMenu user={session.user} onSignOut={signOut} />
              ) : (
                <>
                  <Button onClick={() => signIn()} variant="ghost" size="sm" className="hidden sm:inline-flex">Sign In</Button>
                  <Button as="link" href="/auth/signup" variant="gradient" size="sm" className="hidden md:inline-flex">Get Started</Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 left-0 h-full w-80 max-w-[85%] bg-background border-r border-border shadow-xl p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Brand />
              <button className="w-10 h-10 rounded-md border border-border hover:bg-accent" onClick={() => setMobileOpen(false)} aria-label="Close menu">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="pt-2 grid gap-1">
              {NAV.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${active ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </div>

            <div className="mt-auto grid gap-2">
              <Link href="/search" className="inline-flex items-center justify-center rounded-md border border-border px-3 py-2 text-sm hover:bg-accent">Search</Link>
              {status === "authenticated" ? (
                <Button onClick={() => { setMobileOpen(false); signOut(); }} variant="ghost">Sign out</Button>
              ) : (
                <>
                  <Button onClick={() => { setMobileOpen(false); signIn(); }} variant="ghost">Sign In</Button>
                  <Button as="link" href="/auth/signup" variant="gradient">Get Started</Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
