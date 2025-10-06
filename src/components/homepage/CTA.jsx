// components/homepage/CTA.jsx
'use client';

import Link from 'next/link';
import Avatar, { AvatarSizes } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

const sampleMembers = [
  {
    name: 'Ava',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=faces'
  },
  {
    name: 'Liam',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=faces'
  },
  {
    name: 'Noah',
    image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=120&h=120&fit=crop&crop=faces'
  },
  {
    name: 'Maya',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=faces'
  }
];

export default function CTA() {
  return (
    <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
      <div className="absolute inset-0 bg-radial-fade" />
      <div className="relative max-w-6xl mx-auto container-mobile">
        <div className="rounded-3xl brand-gradient p-[1px] shadow-glow">
          <div className="rounded-3xl bg-white/90 dark:bg-white/5 backdrop-blur-sm px-6 sm:px-10 py-10 sm:py-14">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold mb-4 border border-primary/20">
                  🚀 Start creating today
                </div>
                <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
                  Turn your ideas into stories people love
                </h3>
                <p className="text-muted-foreground text-lg mb-6 max-w-xl">
                  Join a vibrant community of writers and readers. Create, publish, and grow your audience with powerful tools and AI assistance.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button as="link" href="/auth/signup" variant="gradient" size="lg" className="min-w-[180px]">
                    Get Started Free
                  </Button>
                  <Button as="link" href="/features" variant="outline" size="lg">
                    Explore Features
                  </Button>
                </div>
                <div className="flex items-center gap-3 mt-6">
                  <div className="flex -space-x-3">
                    {sampleMembers.map((m, idx) => (
                      <img
                        key={idx}
                        src={m.image}
                        alt={m.name}
                        className="w-9 h-9 rounded-full border-2 border-background object-cover"
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Join 10,000+ creators already publishing on BlogSphere
                  </span>
                </div>
              </div>

              <div className="relative">
                <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-fuchsia-300/30 blur-3xl" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
                    <div className="text-2xl">✍️</div>
                    <div className="mt-3 font-semibold">AI Assist</div>
                    <div className="text-sm text-muted-foreground">Beat writer's block with smart suggestions</div>
                  </div>
                  <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
                    <div className="text-2xl">📈</div>
                    <div className="mt-3 font-semibold">Growth</div>
                    <div className="text-sm text-muted-foreground">Analytics that help you grow faster</div>
                  </div>
                  <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
                    <div className="text-2xl">🤝</div>
                    <div className="mt-3 font-semibold">Community</div>
                    <div className="text-sm text-muted-foreground">Connect with readers and writers</div>
                  </div>
                  <div className="p-5 rounded-2xl border border-border bg-card shadow-sm">
                    <div className="text-2xl">🛡️</div>
                    <div className="mt-3 font-semibold">Secure</div>
                    <div className="text-sm text-muted-foreground">Privacy-first and reliable infrastructure</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
