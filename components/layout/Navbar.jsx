'use client';
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 w-full z-50 bg-white transition-all shadow ${scrolled ? "border-b border-gray-200" : ""}`}>
      <div className="max-w-7xl mx-auto px-4 flex h-16 justify-between items-center">
        <Link href="/" className="flex items-center font-bold text-xl text-blue-600">
          AI Knowledge Hub
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/blog" className="hover:text-blue-600">Blogs</Link>
          <Link href="/search" className="hover:text-blue-600">Search</Link>
          <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          {status === "loading" ? (
            <span className="text-gray-500">Loading...</span>
          ) : session ? (
            <>
              <span className="hidden sm:block">{session.user?.name}</span>
              <button onClick={() => signOut()} className="bg-red-500 text-white px-3 py-1 rounded-lg">Logout</button>
            </>
          ) : (
            <>
              <button onClick={() => signIn()} className="text-blue-600">Login</button>
              <Link href="/auth/signup" className="bg-blue-600 text-white px-3 py-1 rounded-lg">Sign Up</Link>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>☰</button>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-gray-50 border-t p-4 space-y-2">
          <Link href="/blog">Blogs</Link>
          <Link href="/search">Search</Link>
          <Link href="/dashboard">Dashboard</Link>
        </div>
      )}
    </nav>
  );
}