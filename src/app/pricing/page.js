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
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Ready to start your writing journey?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of writers already sharing their stories. Start free today or contact our team for custom publishing solutions.
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
