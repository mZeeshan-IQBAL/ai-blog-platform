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
      {/* Hero continuation - Built for the intelligence age */}
      <section className="content-section bg-background">
        <div className="content-container">
          <div className="text-center mb-16">
            <Reveal>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4">
                Built for the intelligence age
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Integrate AI into every part of your docs lifecycle. Woven into how your knowledge is
                written, maintained, and understood by both users and LLMs.
              </p>
            </Reveal>
          </div>

          {/* Two column feature layout */}
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
            {/* Left column - LLMs.txt & MCP */}
            <Reveal className="space-y-8">
              <div className="eyebrow-badge">
                <span className="text-xs font-medium">LLMS.TXT & MCP</span>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-3">
                  Built for both people and AI
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Ensure your content shows up in the AI workflows users already rely on. We support llms.txt, MCP, and whatever comes next.
                </p>
              </div>
            </Reveal>

            {/* Right column - Agent */}
            <Reveal className="space-y-8">
              <div className="eyebrow-badge">
                <span className="text-xs font-medium">AGENT</span>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-3">
                  Self-updating knowledge management
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  Draft, edit, and maintain content with a context-aware agent. Move faster and more consistently without the documentation debt.
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
            <h2 className="text-lg sm:text-xl font-bold mb-3">Everything you need to create</h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              From AI-powered writing assistance to community engagement—all the tools creators need.
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
