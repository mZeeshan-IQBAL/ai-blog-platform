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
    <section className="text-center py-16 sm:py-20 lg:py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Main heading - clean and simple */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-6">
          Welcome to <span className="text-primary">BlogSphere</span>
        </h1>
        
        {/* Subtitle */}
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8">
          Share your content with AI help and connect with readers all over the world. Discover great content, meet other writers, and be part of a friendly community.
        </p>
        
        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          {status === "authenticated" ? (
            <>
              <Button as="link" href="/dashboard" variant="default">
                Go to Dashboard
              </Button>
              <Button as="link" href="/blog" variant="secondary">
                Discover Blogs
              </Button>
            </>
          ) : (
            <>
              <Button as="link" href="/auth/signin" variant="default">
                Start Writing
              </Button>
              <Button as="link" href="/blog" variant="secondary">
                Discover Stories
              </Button>
            </>
          )}
        </div>
        
        {/* Simple trust indicators */}
        {status !== "authenticated" && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">Trusted by writers and readers worldwide</p>
            <div className="flex justify-center items-center gap-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Free to join
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                AI-Enhanced Writing
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                </svg>
                Vibrant Community
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
