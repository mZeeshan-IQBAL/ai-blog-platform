import Image from "next/image";
import PricingCard from "@/components/pricing/PricingCard";

export default function PricingPage() {
  // PKR amounts (approx: $1 = ₨280)
  const plans = [
    {
      name: "Free",
      slug: "free",
      price: "₨0",
      period: "forever",
      description: "Get started with basic features.",
      features: [
        "5 GB storage",
        "Up to 5 posts",
        "Basic AI tools",
        "Community access",
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
      description: "Perfect for individual creators and small teams.",
      features: [
        "20 GB storage",
        "Unlimited posts",
        "Advanced AI tools",
        "Custom domain",
        "Priority support",
        "Analytics dashboard",
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
      description: "For power users who need more control and features.",
      features: [
        "50 GB storage",
        "Unlimited posts & users",
        "All AI tools",
        "Custom domain",
        "24/7 priority support",
        "Advanced analytics",
        "Team collaboration",
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
      description: "For growing teams and organizations.",
      features: [
        "100 GB storage",
        "Unlimited everything",
        "All AI tools + API access",
        "Custom domains",
        "Dedicated support",
        "Enterprise analytics",
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
      description: "Tailored solutions for large organizations.",
      features: [
        "Unlimited storage",
        "Custom AI models",
        "API access & integrations",
        "Dedicated account manager",
        "On-premise deployment",
        "Custom workflows",
        "Security compliance",
        "Scalable infrastructure",
      ],
      cta: "Contact Sales",
      popular: false,
      highlighted: false,
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="border-b border-gray-200">
        <div className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              One-time payment. No hidden fees. No automatic renewal.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing grid */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <PricingCard
              key={plan.slug}
              plan={plan}
              isPopular={plan.popular}
              isHighlighted={plan.highlighted}
            />
          ))}
        </div>

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

        {/* CTA */}
        <div className="mt-20 bg-gray-50 rounded-lg p-12 text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Questions about pricing?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            We&apos;re here to help. Contact our sales team for custom plans or volume discounts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/auth/signup" 
              className="bg-blue-600 text-white px-6 py-2.5 rounded-md font-medium hover:bg-blue-700 transition"
            >
              Start Free Plan
            </a>
            <a 
              href="/contact" 
              className="text-gray-700 px-6 py-2.5 rounded-md font-medium hover:text-gray-900 transition"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
