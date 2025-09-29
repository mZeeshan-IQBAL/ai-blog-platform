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
        "Get intelligent suggestions for compelling titles, engaging content ideas, and style improvements while you write. Overcome writer's block with creative prompts and helpful guidance.",
      highlight: "Write better stories with AI help",
      color: "bg-blue-100",
    },
    {
      id: "daily-blogging",
      icon: "📝",
      title: "Effortless Publishing",
      description:
        "Beautiful, distraction-free editor perfect for any type of content - from personal essays and fiction to poetry and journalism. Focus on your creativity, not the technology.",
      highlight: "Write and publish seamlessly",
      color: "bg-green-100",
    },
    {
      id: "smart-suggestions",
      icon: "💡",
      title: "Story Ideas Generator",
      description:
        "Never run out of inspiration! Get personalized story prompts, trending topics, and creative challenges based on your interests and writing style.",
      highlight: "Endless creative inspiration",
      color: "bg-purple-100",
    },
    {
      id: "community-discovery",
      icon: "👥",
      title: "Discover Amazing Stories",
      description:
        "Explore captivating stories from talented writers worldwide, discover new genres and perspectives, and connect with fellow storytelling enthusiasts.",
      highlight: "50K+ stories to explore",
      color: "bg-pink-100",
    },
    {
      id: "writing-streak",
      icon: "🔥",
      title: "Build Writing Habits",
      description:
        "Develop a consistent writing practice with streak tracking, daily prompts, goal setting, and progress analytics to keep you motivated.",
      highlight: "Develop lasting writing habits",
      color: "bg-orange-100",
    },
    {
      id: "instant-publish",
      icon: "⚡",
      title: "Share Instantly",
      description:
        "Publish your stories immediately and reach readers worldwide. Simple, fast publishing with no technical barriers between you and your audience.",
      highlight: "Share your voice instantly",
      color: "bg-yellow-100",
    },
    {
      id: "feedback-community",
      icon: "💬",
      title: "Engage with Readers",
      description:
        "Build meaningful connections with your audience through comments, reactions, and direct feedback. Foster a loyal readership and improve your craft.",
      highlight: "Thriving reader community",
      color: "bg-indigo-100",
    },
    {
      id: "content-improvement",
      icon: "🎯",
      title: "Craft Better Stories",
      description:
        "Enhance your storytelling with AI-powered suggestions for grammar, tone, pacing, and style. Learn and improve with every story you write.",
      highlight: "Become a better storyteller",
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
              Every story deserves to be told
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Whether it&apos;s fiction, non-fiction, poetry, or personal essays - share your unique voice with the world. Our platform helps you craft compelling content and connect with readers who love your stories.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/blog/create"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Start Writing Today
              </Link>
              <Link
                href="/blog"
                className="border border-gray-300 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              >
                Discover Amazing Stories
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FeatureSection
          title="Everything storytellers need to thrive"
          subtitle="From AI-powered writing assistance to building your readership — we provide the complete toolkit for amazing storytelling."
          features={features}
        />

        {/* How It Works Section */}
        <div className="py-16 border-t border-gray-200">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">How it works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Simple, intuitive storytelling with AI assistance to help you create your best work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✍️</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Start Writing</h3>
              <p className="text-gray-600">
                Open our beautiful editor and start crafting your story - whether it&apos;s fiction, personal essays, poetry, or any creative writing that speaks to you.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Get AI Guidance</h3>
              <p className="text-gray-600">
                Our AI provides helpful suggestions for better phrasing, story structure, creative prompts, and helps you overcome writer&apos;s block when inspiration runs low.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌍</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. Share & Connect</h3>
              <p className="text-gray-600">
                Publish instantly and connect with readers who love great storytelling. Build your audience and engage with fellow writers in our vibrant community.
              </p>
            </div>
          </div>
        </div>

        {/* Writer Types Section */}
        <div className="py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Perfect for every storyteller
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Storytellers</h3>
              <p className="text-gray-600 mb-4">
                Share your life experiences, memories, and personal insights through compelling stories that connect with readers on a human level.
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Privacy controls for personal stories</li>
                <li>• Memory prompts and reflection tools</li>
                <li>• Timeline and journey tracking</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Fiction Writers</h3>
              <p className="text-gray-600 mb-4">
                Craft compelling fiction, from short stories to serialized novels. Share your imaginative worlds and characters with readers who love great storytelling.
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Character and plot development tools</li>
                <li>• Genre-specific writing prompts</li>
                <li>• Serial publication features</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Educational Writers</h3>
              <p className="text-gray-600 mb-4">
                Share knowledge, tutorials, and insights in an engaging, story-driven format that makes learning enjoyable and memorable for your readers.
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Tutorial and guide templates</li>
                <li>• Educational content optimization</li>
                <li>• Student engagement analytics</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-8 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Opinion Writers</h3>
              <p className="text-gray-600 mb-4">
                Share your unique perspective on current events, culture, and topics you care about through compelling opinion pieces and commentary.
              </p>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Trending topic alerts</li>
                <li>• Audience building strategies</li>
                <li>• Engagement and reach analytics</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Simple Stats */}
        <div className="py-16 bg-gray-50 rounded-xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">25K+</div>
              <div className="text-gray-600">Active Writers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">120K+</div>
              <div className="text-gray-600">Stories Published</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">500K+</div>
              <div className="text-gray-600">Monthly Readers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-gray-900 mb-2">95%</div>
              <div className="text-gray-600">Love Our Platform</div>
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="py-16">
          <div className="bg-white border border-gray-200 rounded-xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
              Your stories matter. Start sharing them today.
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of storytellers who share their compelling narratives, experiences, and creative works with readers who appreciate great storytelling.
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
