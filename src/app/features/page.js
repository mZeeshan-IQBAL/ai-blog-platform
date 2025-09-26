// src/app/features/page.js
import Image from "next/image";
import Link from "next/link";
import FeatureSection from "@/components/features/FeatureSection";

export default function FeaturesPage() {
  const features = [
    {
      id: "ai-writing-assistant",
      icon: "✨",
      title: "AI Writing Assistant",
      description:
        "Get smart suggestions for titles, content ideas, and improvements while you write your daily blogs. Never face writer&apos;s block again.",
      highlight: "Write 3x faster with AI help",
      color: "bg-blue-100",
    },
    {
      id: "daily-blogging",
      icon: "📝",
      title: "Daily Blogging Made Easy",
      description:
        "Simple, distraction-free editor to write about anything - your thoughts, experiences, learnings, or creative ideas.",
      highlight: "Write about anything you want",
      color: "bg-green-100",
    },
    {
      id: "smart-suggestions",
      icon: "💡",
      title: "Content Ideas Generator",
      description:
        "Stuck on what to write? Our AI suggests topic ideas based on trending themes, your interests, and popular content.",
      highlight: "Never run out of ideas",
      color: "bg-purple-100",
    },
    {
      id: "community-discovery",
      icon: "👥",
      title: "Discover Great Content",
      description:
        "Explore blogs from other writers, discover new perspectives, and connect with people who share your interests.",
      highlight: "50K+ daily blog posts",
      color: "bg-pink-100",
    },
    {
      id: "writing-streak",
      icon: "🔥",
      title: "Writing Streaks & Habits",
      description:
        "Build a consistent writing habit with streak tracking, daily reminders, and progress analytics.",
      highlight: "Build your writing routine",
      color: "bg-orange-100",
    },
    {
      id: "instant-publish",
      icon: "⚡",
      title: "Instant Publishing",
      description:
        "Write and publish immediately. Share your thoughts with the world in seconds, no complex setup required.",
      highlight: "Publish in one click",
      color: "bg-yellow-100",
    },
    {
      id: "feedback-community",
      icon: "💬",
      title: "Reader Feedback",
      description:
        "Get comments, reactions, and feedback from readers. Engage with your audience and build meaningful connections.",
      highlight: "Active reader community",
      color: "bg-indigo-100",
    },
    {
      id: "content-improvement",
      icon: "🎯",
      title: "Writing Enhancement",
      description:
        "AI-powered suggestions for grammar, tone, readability, and style to help you become a better writer.",
      highlight: "Improve with every post",
      color: "bg-gray-100",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="border-b border-gray-200">
        <div className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Your daily thoughts, amplified by AI
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Write about anything that&apos;s on your mind. Our AI assistant helps you craft better
              content, discover ideas, and connect with readers who care about your thoughts.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/create"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Start Writing Today
              </Link>
              <Link
                href="/blog"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Read Others&apos; Blogs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FeatureSection
          title="Everything you need to write and share"
          subtitle="From AI-powered writing assistance to building your audience — we&apos;ve got you covered."
          features={features}
        />

        {/* How It Works Section */}
        <div className="py-16 border-t border-gray-200">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Simple, straightforward blogging with AI assistance every step of the way.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✍️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Start Writing</h3>
              <p className="text-gray-600">
                Open our editor and start writing about anything - your day, thoughts, learnings, or
                creative ideas.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Get AI Suggestions</h3>
              <p className="text-gray-600">
                Our AI suggests improvements, topic ideas, better phrasing, and helps you overcome
                writer&apos;s block.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Share & Connect</h3>
              <p className="text-gray-600">
                Publish instantly and connect with readers who appreciate your unique perspective
                and experiences.
              </p>
            </div>
          </div>
        </div>

        {/* Writer Types Section */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Perfect for every type of writer
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Daily Journalers</h3>
              <p className="text-gray-600 mb-4">
                Share your daily experiences, reflections, and personal growth journey with a
                supportive community.
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Private or public posting options</li>
                <li>• Mood tracking and reflection prompts</li>
                <li>• Writing streak encouragement</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Creative Writers</h3>
              <p className="text-gray-600 mb-4">
                Express your creativity through stories, poems, essays, or any form of creative
                expression you love.
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Creative writing prompts from AI</li>
                <li>• Style and tone suggestions</li>
                <li>• Reader engagement tools</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Learning Enthusiasts</h3>
              <p className="text-gray-600 mb-4">
                Document your learning journey, share insights from books, courses, or experiences
                you&apos;ve had.
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Knowledge organization tools</li>
                <li>• Learning progress tracking</li>
                <li>• Connect with fellow learners</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Thought Leaders</h3>
              <p className="text-gray-600 mb-4">
                Share your opinions, insights, and perspectives on topics you&apos;re passionate about.
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Trending topic suggestions</li>
                <li>• Audience building tools</li>
                <li>• Engagement analytics</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Simple Stats */}
        <div className="py-16 bg-gray-50 rounded-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">25K+</div>
              <div className="text-gray-600">Daily Writers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">120K+</div>
              <div className="text-gray-600">Blog Posts</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">500K+</div>
              <div className="text-gray-600">Monthly Readers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">95%</div>
              <div className="text-gray-600">Love Our AI Assistant</div>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="py-16">
          <div className="bg-white border border-gray-200 rounded-xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Your thoughts matter. Start sharing them today.
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of writers who publish their daily thoughts, experiences, and ideas
              with the help of our AI writing assistant.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/create"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Start Writing Today
              </Link>
              <Link
                href="/pricing"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
