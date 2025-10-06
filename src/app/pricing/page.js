import Image from "next/image";
import PricingCard from "@/components/pricing/PricingCard";
import ComparisonTable from "@/components/pricing/ComparisonTable";
import FAQ from "@/components/pricing/FAQ";
import PricingGrid from "@/components/pricing/PricingGrid";

export default function PricingPage() {
  // PKR amounts (approx: $1 = ₨280)
  const plans = [
    {
      name: "Free",
      slug: "free",
      price: "₨0",
      period: "forever",
      description: "Perfect for new writers getting started.",
      features: [
        "5 GB storage",
        "Up to 5 stories per month",
        "Basic writing assistant",
        "Reader community access",
        "Standard support",
      ],
      cta: "Start Free",
      popular: false,
      highlighted: false,
    },
    {
      name: "Starter",
      slug: "starter",
      price: "₨1,120",
      period: "for 30 days",
      description: "Ideal for serious writers and storytellers.",
      features: [
        "20 GB storage",
        "Unlimited stories",
        "Advanced writing assistant",
        "Custom writer profile",
        "Priority support",
        "Reader engagement analytics",
      ],
      cta: "Get Starter",
      popular: true,
      highlighted: true,
    },
    {
      name: "Pro",
      slug: "pro",
      price: "₨2,240",
      period: "for 30 days",
      description: "For professional writers and content creators.",
      features: [
        "50 GB storage",
        "Unlimited everything",
        "Premium AI writing tools",
        "Custom domain for portfolio",
        "24/7 priority support",
        "Advanced reader analytics",
        "Collaboration features",
      ],
      cta: "Get Pro",
      popular: false,
      highlighted: false,
    },
    {
      name: "Business",
      slug: "business",
      price: "₨4,200",
      period: "for 30 days",
      description: "For publishing houses and media companies.",
      features: [
        "100 GB storage",
        "Unlimited content & authors",
        "All AI tools + API access",
        "Multiple custom domains",
        "Dedicated support manager",
        "Publisher-grade analytics",
        "White-label branding",
        "SLA guarantee",
      ],
      cta: "Get Business",
      popular: false,
      highlighted: false,
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
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4 border border-white/30">
              💎 One‑time purchase — no auto‑renewal
            </div>
            <h1 className="heading-hero mb-4 text-white">
              Simple, transparent pricing
            </h1>
            <p className="subheading-hero text-white/85 mb-8">
              Pay once for 30 days of premium features. No hidden fees.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing grid */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
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
