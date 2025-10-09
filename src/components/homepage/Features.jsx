// components/homepage/Features.jsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import { CheckCircle, PenTool, Users, LineChart, Sparkles } from 'lucide-react';

// Solutions-style data blocks
const solutions = [
  {
    id: 'writing',
    title: 'Writing Suite',
    subtitle: 'Create polished content faster',
    icon: PenTool,
    color: 'from-teal-500 to-emerald-600',
    bullets: [
      'AI assistant for outlines and edits',
      'Grammar and tone suggestions',
      'Markdown/TipTap rich editor',
      'Version history and drafts',
    ],
    cta: { label: 'Start writing', href: '/blog/create' },
  },
  {
    id: 'growth',
    title: 'Growth & Analytics',
    subtitle: 'Understand and grow your audience',
    icon: LineChart,
    color: 'from-emerald-500 to-teal-600',
    bullets: [
      'Views, reads, and retention',
      'Top content and tags',
      'Referrers and geography',
      'Export insights',
    ],
    cta: { label: 'View analytics', href: '/dashboard/analytics' },
  },
  {
    id: 'community',
    title: 'Community & Engagement',
    subtitle: 'Build real relationships with readers',
    icon: Users,
    color: 'from-fuchsia-500 to-pink-600',
    bullets: [
      'Comments and reactions',
      'Follow writers you love',
      'Realtime updates via Pusher',
      'Smart moderation tools',
    ],
    cta: { label: 'Explore community', href: '/blog' },
  },
  {
    id: 'discovery',
    title: 'Discovery & Personalization',
    subtitle: 'Help great stories find the right readers',
    icon: Sparkles,
    color: 'from-amber-500 to-orange-600',
    bullets: [
      'Trending and For You feeds',
      'Powerful search and tags',
      'Topic and author recommendations',
      'SEO-friendly pages',
    ],
    cta: { label: 'Discover stories', href: '/search' },
  },
];

function SolutionCard({ s }) {
  const Icon = s.icon;
  return (
    <Reveal className="feature-card">
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${s.color} text-white inline-flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-semibold mb-2">{s.title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{s.subtitle}</p>
        </div>
      </div>
      
      <ul className="space-y-2 mb-4">
        {s.bullets.map((b, i) => (
          <li key={i} className="flex items-start gap-2 text-xs">
            <CheckCircle className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
            <span className="text-muted-foreground leading-relaxed">{b}</span>
          </li>
        ))}
      </ul>
      
      <Link 
        href={s.cta.href} 
        className="inline-flex items-center text-xs font-medium text-primary hover:text-primary/80 transition-colors"
      >
        {s.cta.label}
        <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </Reveal>
  );
}

export default function Features() {
  return (
    <>
      {/* Hero continuation - AI-powered blogging */}
      <section className="content-section bg-background">
        <div className="content-container">
          <div className="text-center mb-16">
            <Reveal>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4">
                AI-Powered Content Creation
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Harness the power of artificial intelligence to enhance every aspect of your blogging journey. From idea generation to audience engagement, we've got you covered.
              </p>
            </Reveal>
          </div>

          {/* Two column feature layout */}
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* Left column - AI Writing Assistant */}
            <Reveal className="space-y-8">
              <div className="eyebrow-badge">
                <span className="text-xs font-medium">AI WRITING ASSISTANT</span>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-3">
                  Never face writer's block again
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Get instant topic suggestions, outline generation, and content enhancement. Our AI helps you create compelling stories that resonate with your audience.
                </p>
              </div>
            </Reveal>

            {/* Right column - Smart Analytics */}
            <Reveal className="space-y-8">
              <div className="eyebrow-badge">
                <span className="text-xs font-medium">SMART ANALYTICS</span>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-3">
                  Understand your audience better
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Get actionable insights about your readers' behavior, preferences, and engagement patterns. Grow your audience with data-driven decisions.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Feature cards section */}
      <section className="content-section bg-muted/30">
        <div className="content-container">
          <Reveal className="text-center mb-12">
            <h2 className="text-lg sm:text-xl font-bold mb-3">Everything you need to succeed as a blogger</h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              From AI-powered writing assistance to audience engagement—all the essential tools to turn your ideas into viral stories.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {solutions.map((s) => (
              <SolutionCard key={s.id} s={s} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
