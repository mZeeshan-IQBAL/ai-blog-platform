// components/layout/Navbar.jsx
'use client';
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// User dropdown menu component
const UserDropdown = ({ user, onSignOut }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: 'Profile', href: '/profile', icon: '👤' },
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Settings', href: '/settings', icon: '⚙️' },
    { name: 'My Posts', href: '/my-posts', icon: '📝' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
          {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
        </div>
        <span className="hidden sm:block text-gray-700 font-medium">
          {user?.name || 'User'}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)}></div>
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            ))}
            
            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onSignOut();
                }}
                className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 w-full text-left"
              >
                <span>🚪</span>
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Mobile menu component
const MobileMenu = ({ isOpen, onClose, session, onSignIn, onSignOut }) => {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Blog', href: '/blog', icon: '📖' },
    { name: 'Search', href: '/search', icon: '🔍' },
    { name: 'Dashboard', href: '/dashboard', icon: '📊', requiresAuth: true },
    { name: 'Features', href: '/features', icon: '⭐' },
    { name: 'About', href: '/about', icon: 'ℹ️' },
  ];

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden" onClick={onClose}></div>
      <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 md:hidden transform transition-transform duration-300">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" onClick={onClose} className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-lg font-bold text-gray-900">AI Hub</span>
            </Link>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User info */}
          {session && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold">
                  {session.user?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{session.user?.name}</p>
                  <p className="text-sm text-gray-500">{session.user?.email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              if (item.requiresAuth && !session) return null;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-150 ${
                    isActive 
                      ? 'bg-blue-50 text-blue-600 font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.name}
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Auth buttons */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            {session ? (
              <button
                onClick={() => {
                  onClose();
                  onSignOut();
                }}
                className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 py-3 rounded-lg font-medium hover:bg-red-100 transition-colors duration-150"
              >
                🚪 Sign Out
              </button>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onClose();
                    onSignIn();
                  }}
                  className="w-full bg-white border border-gray-200 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-150"
                >
                  Sign In
                </button>
                <Link
                  href="/auth/signup"
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-150 text-center block"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

// Navigation links component
const NavLinks = () => {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Blog', href: '/blog' },
    { name: 'Search', href: '/search' },
    { name: 'Features', href: '/features' },
    { name: 'About', href: '/about' },
  ];

  return (
    <div className="hidden md:flex items-center gap-1">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
};

// Search component (optional)
const QuickSearch = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');

  return (
    <div className="hidden lg:block relative">
      <div className="relative">
        <input
          type="text"
          placeholder="Quick search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          className="w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
        />
        <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {isOpen && query && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-20">
          <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
            Quick Results
          </div>
          <div className="px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
            Search for "{query}" in blogs...
          </div>
        </div>
      )}
    </div>
  );
};

export default function Navbar() {
  const { data: session, status } = useSession();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, []);

  return (
    <>
      <nav className={`fixed top-0 w-full z-40 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-100' 
          : 'bg-white shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform duration-200">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">AI Knowledge Hub</span>
                <div className="text-xs text-gray-500 -mt-1">Powered by Community</div>
              </div>
            </Link>

            {/* Center Navigation */}
            <NavLinks />

            {/* Right section */}
            <div className="flex items-center gap-4">
              {/* Quick Search */}
              <QuickSearch />

              {/* Notifications (when logged in) */}
              {session && (
                <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5-5 5-5m-6 12H5a2 2 0 01-2-2V7a2 2 0 012-2h9m4 0v10" />
                  </svg>
                  <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                </button>
              )}

              {/* Auth Section */}
              <div className="flex items-center gap-3">
                {status === "loading" ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm">Loading...</span>
                  </div>
                ) : session ? (
                  <UserDropdown user={session.user} onSignOut={signOut} />
                ) : (
                  <div className="hidden md:flex items-center gap-3">
                    <button 
                      onClick={() => signIn()}
                      className="text-gray-600 hover:text-blue-600 font-medium transition-colors duration-200"
                    >
                      Sign In
                    </button>
                    <Link 
                      href="/auth/signup"
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        session={session}
        onSignIn={signIn}
        onSignOut={signOut}
      />

      {/* Spacer for fixed navbar */}
      <div className="h-16"></div>
    </>
  );
}