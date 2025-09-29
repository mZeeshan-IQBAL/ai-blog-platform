// components/homepage/Hero.jsx
'use client';
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";

// Loading skeleton
const HeroSkeleton = () => (
  <section className="text-center py-20">
    <div className="animate-pulse space-y-4">
      <div className="h-12 bg-muted rounded w-3/4 mx-auto"></div>
      <div className="h-6 bg-muted rounded w-1/2 mx-auto"></div>
      <div className="flex justify-center gap-4 mt-6">
        <div className="h-12 bg-muted rounded w-32"></div>
        <div className="h-12 bg-muted rounded w-32"></div>
      </div>
    </div>
  </section>
);

export default function Hero() {
  const { status } = useSession();

  if (status === "loading") {
    return <HeroSkeleton />;
  }

  return (
    <section className="text-center py-12 sm:py-16 lg:py-20 xl:py-24 animate-fade-in">
      <div className="max-w-4xl mx-auto container-mobile">
        {/* Main heading - clean and simple */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-4 sm:mb-6 animate-slide-up">
          Welcome to{" "}
          <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            BlogSphere
          </span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8 animate-slide-up" style={{ animationDelay: '150ms' }}>
          Share your content with AI help and connect with readers all over the world. Discover great content, meet other writers, and be part of a friendly community.
        </p>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 sm:mb-12 animate-slide-up" style={{ animationDelay: '300ms' }}>
          {status === "authenticated" ? (
            <>
              <Button as="link" href="/dashboard" variant="default" size="lg" className="min-w-[160px]">
                <span className="mr-2">📊</span>
                Go to Dashboard
              </Button>
              <Button as="link" href="/blog" variant="secondary" size="lg" className="min-w-[160px]">
                <span className="mr-2">📚</span>
                Discover Blogs
              </Button>
            </>
          ) : (
            <>
              <Button as="link" href="/auth/signin" variant="default" size="lg" className="min-w-[160px]">
                <span className="mr-2">✍️</span>
                Start Writing
              </Button>
              <Button as="link" href="/blog" variant="outline" size="lg" className="min-w-[160px]">
                <span className="mr-2">🔍</span>
                Discover Stories
              </Button>
            </>
          )}
        </div>
        
        {/* Enhanced trust indicators */}
        {status !== "authenticated" && (
          <div className="text-center animate-slide-up" style={{ animationDelay: '450ms' }}>
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 font-medium">
              Trusted by writers and readers worldwide
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm">
              <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-2 rounded-full border border-green-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Free to join</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-full border border-blue-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">AI-Enhanced</span>
              </div>
              <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-3 py-2 rounded-full border border-purple-200">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
                <span className="font-medium">10K+ Community</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
