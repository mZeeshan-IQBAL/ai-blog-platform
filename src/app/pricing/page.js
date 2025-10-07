"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import PricingCard from "@/components/pricing/PricingCard";
import ComparisonTable from "@/components/pricing/ComparisonTable";
import FAQ from "@/components/pricing/FAQ";
import PricingGrid from "@/components/pricing/PricingGrid";
import SubscriptionStatus from "@/components/subscription/SubscriptionStatus";
import { getAllPlans, formatPrice } from "@/config/payments";

export default function PricingPage() {
  const { data: session } = useSession();
  
  // Get plans from centralized configuration with USD pricing
  const configPlans = getAllPlans();
  
  // Transform config plans to match existing UI structure
  const plans = [
    {
      name: configPlans[0].name,
      slug: configPlans[0].id,
      price: formatPrice(configPlans[0].price),
      period: "forever",
      description: configPlans[0].description,
      features: configPlans[0].features,
      cta: "Start Free",
      popular: configPlans[0].popular,
      highlighted: configPlans[0].popular,
    },
    {
      name: configPlans[1].name,
      slug: configPlans[1].id,
      price: formatPrice(configPlans[1].price),
      period: "per month",
      description: configPlans[1].description,
      features: configPlans[1].features,
      cta: "Get Starter",
      popular: configPlans[1].popular,
      highlighted: configPlans[1].popular,
    },
    {
      name: configPlans[2].name,
      slug: configPlans[2].id,
      price: formatPrice(configPlans[2].price),
      period: "per month",
      description: configPlans[2].description,
      features: configPlans[2].features,
      cta: "Get Pro",
      popular: configPlans[2].popular,
      highlighted: configPlans[2].popular,
    },
    {
      name: configPlans[3].name,
      slug: configPlans[3].id,
      price: formatPrice(configPlans[3].price),
      period: "per month",
      description: configPlans[3].description,
      features: configPlans[3].features,
      cta: "Get Business",
      popular: configPlans[3].popular,
      highlighted: configPlans[3].popular,
    },
    {
      name: "Enterprise",
      slug: "enterprise",
      price: "Custom",
      period: "tailored",
      description: "Custom solutions for large publishing organizations.",
      features: [
        "Unlimited storage & bandwidth",
        "Custom AI writing models",
        "Full API access & integrations",
        "Dedicated success manager",
        "On-premise deployment options",
        "Custom publishing workflows",
        "Enterprise security & compliance",
        "Scalable global infrastructure",
      ],
      cta: "Contact Sales",
      popular: false,
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-mint-sky" />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="cloud-blob" style={{ bottom: '-120px', left: '-60px', width: '520px', height: '360px', transform: 'rotate(-8deg)' }} />
          <div className="cloud-blob" style={{ bottom: '-80px', right: '-40px', width: '480px', height: '300px', transform: 'rotate(6deg)' }} />
          <div className="streak" style={{ top: '22%', right: '-30%', transform: 'rotate(18deg)' }} />
          <div className="streak" style={{ top: '38%', left: '-20%', transform: 'rotate(10deg)' }} />
        </div>
        <div className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-white/30">
              💎 One‑time purchase — no auto‑renewal
            </div>
            <h1 className="heading-hero mb-4 text-white">
              Plans & Pricing
            </h1>
            <p className="subheading-hero text-white/85 mb-8">
              Choose the plan that fits your writing. Pay once for 30 days—no hidden fees.
            </p>
          </div>
        </div>
      </div>

      {/* Current Subscription Status */}
      {session && (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Current Plan</h2>
            <p className="text-gray-600">Manage your subscription and see what you can unlock</p>
          </div>
          <SubscriptionStatus showUsage={true} showFeatures={false} />
        </div>
      )}

      {/* Pricing grid */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {session && (
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Upgrade Your Plan</h2>
            <p className="text-gray-600">Choose a plan that fits your growing needs</p>
          </div>
        )}
        <PricingGrid plans={plans} />

        {/* Visual */}
        <div className="mt-20 text-center">
          <Image
            src="/images/pricing.svg"
            alt="Pricing comparison"
            width={600}
            height={300}
            className="inline-block rounded-lg"
            priority
          />
        </div>

        {/* Comparison table */}
        <ComparisonTable />

        {/* FAQ */}
        <FAQ />

        {/* CTA */}
        <div className="mt-20 rounded-2xl p-[1px] brand-gradient">
          <div className="rounded-2xl bg-card text-card-foreground p-10 text-center">
            <h2 className="text-2xl font-bold mb-3">Ready to start your writing journey?</h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of writers already sharing their stories. Start free today or contact our team for custom publishing solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/auth/signup" 
                className="inline-flex items-center justify-center rounded-md px-6 py-3 font-medium brand-gradient text-white shadow-glow hover:brightness-110 active:brightness-95"
              >
                Start Free Plan
              </a>
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center rounded-md px-6 py-3 font-medium border border-input hover:bg-accent"
              >
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
