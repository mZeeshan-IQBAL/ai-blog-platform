'use client';
// components/homepage/Hero.jsx
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
    <section className="relative overflow-hidden text-center py-16 sm:py-20 lg:py-24 xl:py-32 animate-fade-in">
      {/* Mintlify-inspired gradient background */}
      <div className="absolute inset-0 bg-mint-sky" />
      {/* Subtle decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="cloud-blob" style={{ bottom: '-100px', left: '-40px', width: '400px', height: '280px', transform: 'rotate(-5deg)', opacity: 0.8 }} />
        <div className="cloud-blob" style={{ bottom: '-60px', right: '-20px', width: '350px', height: '220px', transform: 'rotate(3deg)', opacity: 0.9 }} />
        <div className="cloud-blob" style={{ top: '60%', left: '20%', width: '200px', height: '140px', opacity: 0.6 }} />
        <div className="streak" style={{ top: '25%', right: '-25%', transform: 'rotate(15deg)' }} />
        <div className="streak" style={{ top: '40%', left: '-15%', transform: 'rotate(8deg)' }} />
      </div>
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mintlify-style eyebrow */}
        <div className="mb-4 sm:mb-6 animate-slide-up">
          <span className="inline-flex items-center px-3 py-1 text-xs font-medium bg-white/10 text-white/90 rounded-full border border-white/20 backdrop-blur-sm">
            ✨ The Intelligent Documentation Platform
          </span>
        </div>
        
        {/* Main heading - Mintlify style */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-4 sm:mb-6 animate-slide-up text-white" style={{ animationDelay: '100ms' }}>
          The Intelligent<br />
          <span className="text-yellow-200">Blog Platform</span>
        </h1>
        
        {/* Subtitle - clean and focused */}
        <p className="text-sm sm:text-base lg:text-lg text-white/85 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed animate-slide-up" style={{ animationDelay: '200ms' }}>
          Meet the next generation of blogging. AI-native, beautiful out-of-the-box, and built for collaboration.
        </p>
        
        {/* Mintlify-style email signup */}
        <div className="max-w-sm mx-auto mb-6 sm:mb-8 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Email address"
              className="flex-1 px-3 py-2 text-sm rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent"
            />
            <button className="px-4 py-2 bg-white text-gray-900 font-medium text-sm rounded-lg hover:bg-white/90 transition-colors duration-200 shadow-lg">
              Start now
            </button>
          </div>
        </div>
        
        {/* Action buttons - secondary */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mb-8 animate-slide-up" style={{ animationDelay: '400ms' }}>
          {status === "authenticated" ? (
            <>
              <Button as="link" href="/dashboard" variant="outline" size="md" className="text-white border-white/30 hover:bg-white/10">
                Go to Dashboard
              </Button>
              <Button as="link" href="/blog" variant="ghost" size="md" className="text-white hover:bg-white/10">
                Discover Blogs
              </Button>
            </>
          ) : (
            <>
              <Button as="link" href="/auth/signin" variant="outline" size="md" className="text-white border-white/30 hover:bg-white/10">
                Start Writing
              </Button>
              <Button as="link" href="/blog" variant="ghost" size="md" className="text-white hover:bg-white/10">
                Discover Stories
              </Button>
            </>
          )}
        </div>
        
      </div>
      
      {/* Mintlify-style bottom section with navigation */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="bg-white rounded-t-3xl shadow-2xl p-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              {/* Logo and brand */}
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-teal-500 to-emerald-600 rounded flex items-center justify-center text-white">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                  </svg>
                </div>
                <span className="font-medium text-primary text-sm">BlogSphere</span>
              </div>
              
              {/* Navigation tabs - removed */}
              {/* Search and AI - removed */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
