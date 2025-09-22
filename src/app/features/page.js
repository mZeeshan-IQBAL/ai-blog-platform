// src/app/features/page.js
import Image from "next/image";
import Link from "next/link";
import FeatureSection from "@/components/features/FeatureSection";

export default function FeaturesPage() {
  const features = [
  {
    icon: "📝",
    title: "Crystal-Clear Blogs",
    description: "No jargon, no fluff — just simple, structured content that makes learning quick and enjoyable.",
    highlight: "Learn faster, save time!",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: "🔍",
    title: "Smart Search & Filters",
    description: "Find the exact topic you’re looking for in seconds with powerful search and category organization.",
    highlight: "No more endless scrolling!",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: "❤️",
    title: "Tailored Just for You",
    description: "Save your favorite posts and get personalized recommendations based on what you enjoy reading most.",
    highlight: "Your blog, your way.",
    color: "from-rose-500 to-pink-600"
  },
  {
    icon: "🤖",
    title: "AI That Works for You",
    description: "Summarize articles, ask questions, or translate instantly — all powered by cutting-edge AI tools.",
    highlight: "Smarter reading in one click.",
    color: "from-indigo-500 to-blue-600"
  },
  {
    icon: "📩",
    title: "Never Miss a Beat",
    description: "Get exclusive insights, trending posts, and updates delivered straight to your inbox every week.",
    highlight: "Stay ahead effortlessly.",
    color: "from-emerald-500 to-teal-500"
  },
  {
    icon: "💬",
    title: "A Community That Cares",
    description: "Share your thoughts, learn from others, and connect with like-minded readers and creators.",
    highlight: "Grow together with us.",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: "💰",
    title: "Free Forever, Upgrade Anytime",
    description: "Enjoy unlimited free access, or go premium to unlock advanced AI tools and exclusive articles.",
    highlight: "Flexibility that fits you.",
    color: "from-yellow-500 to-amber-500"
  }
];


  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 text-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Why Our Blog Stands Out
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-3xl mx-auto">
            More than just articles — an experience built for developers and AI enthusiasts.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link href="/blog" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-md">
              Start Reading Now
            </Link>
            <Link href="/auth/signup" className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
              Join Today
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-6xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <FeatureSection
          title="What Makes Us Different"
          features={features}
        />

        {/* Visual Element */}
        <div className="mt-20 flex justify-center">
          <Image
            src="/images/features.svg"
            alt="Features Overview"
            width={600}
            height={300}
            className="rounded-2xl shadow-xl"
          />
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-2xl p-12 text-center">
          <h2  className="text-3xl font-bold mb-4">Ready to Explore?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are shaping the future of AI through collaboration, learning, and innovation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/blog" className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-md">
              Start Reading Now
            </Link>
            <Link href="/pricing" className="border border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
              Upgrade for Smarter Experience
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <span className="text-lg font-semibold">AI Knowledge Hub</span>
            </div>
            <div className="text-sm text-gray-400">
              © 2025 AI Knowledge Hub. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}