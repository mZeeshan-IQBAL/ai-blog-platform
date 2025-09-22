// components/homepage/Hero.jsx
'use client';
import Link from "next/link";
import { useSession } from "next-auth/react";

// Reusable button component for consistency
const Button = ({ href, variant = 'primary', children, className = '', ...props }) => {
  const baseClasses = "px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:ring-2 focus:ring-offset-2 focus:outline-none";
  
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg",
    secondary: "border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500 hover:border-gray-400"
  };

  return (
    <Link 
      href={href} 
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Link>
  );
};

// Loading skeleton component
const HeroSkeleton = () => (
  <section className="text-center py-20">
    <div className="animate-pulse space-y-4">
      <div className="h-12 bg-gray-200 rounded w-3/4 mx-auto"></div>
      <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
      <div className="flex justify-center gap-4 mt-6">
        <div className="h-12 bg-gray-200 rounded w-32"></div>
        <div className="h-12 bg-gray-200 rounded w-32"></div>
      </div>
    </div>
  </section>
);

export default function Hero() {
  const { status } = useSession();

  // Handle loading state
  if (status === "loading") {
    return <HeroSkeleton />;
  }

  return (
    <section className="text-center py-12 sm:py-16 lg:py-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Main heading with better responsive typography */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
          Welcome to{" "}
          <span className="text-blue-600 bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
            AI Knowledge Hub
          </span>
        </h1>
        
        {/* Subtitle with improved responsive text */}
        <p className="mt-4 sm:mt-6 text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Share, discover, and innovate with AI-powered insights. Join our community of developers and AI enthusiasts.
        </p>
        
        {/* Action buttons with better spacing and responsiveness */}
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          {status === "authenticated" ? (
            <>
              <Button 
                href="/dashboard" 
                variant="primary"
                className="transform hover:scale-105"
              >
                Go to Dashboard
              </Button>
              <Button 
                href="/blog" 
                variant="secondary"
              >
                Browse Blogs →
              </Button>
            </>
          ) : (
            <>
              <Button 
                href="/auth/signin" 
                variant="primary"
                className="transform hover:scale-105"
              >
                Get Started
              </Button>
              <Button 
                href="/blog" 
                variant="secondary"
              >
                Browse Blogs →
              </Button>
            </>
          )}
        </div>
        
        {/* Optional: Add some social proof or features */}
        {status !== "authenticated" && (
          <div className="mt-8 sm:mt-12">
            <p className="text-sm text-gray-500 mb-4">
              Trusted by developers worldwide
            </p>
            <div className="flex justify-center items-center gap-6 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Free to join
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                AI-Powered
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
                Community Driven
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}