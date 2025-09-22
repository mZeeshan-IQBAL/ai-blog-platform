// src/app/pricing/page.js
import Image from "next/image";
import PricingCard from "@/components/pricing/PricingCard";

export default function PricingPage() {
  const plans = [
    {
      name: "Free",
      slug: "free",
      price: "$0",
      period: "per month",
      description: "Get started with basic features.",
      features: [
        "5 GB storage",
        "Up to 5 posts",
        "Basic AI tools",
        "Community access",
        "Standard support"
      ],
      cta: "Start Free",
      popular: false,
      highlighted: false
    },
    {
      name: "Starter",
      slug: "starter",
      price: "$4",
      period: "per month",
      description: "Perfect for individual creators and small teams.",
      features: [
        "20 GB storage",
        "Unlimited posts",
        "Advanced AI tools",
        "Custom domain",
        "Priority support",
        "Analytics dashboard"
      ],
      cta: "Get Starter",
      popular: true,
      highlighted: true
    },
    {
      name: "Pro",
      slug: "pro",
      price: "$8",
      period: "per month",
      description: "For power users who need more control and features.",
      features: [
        "50 GB storage",
        "Unlimited posts & users",
        "All AI tools",
        "Custom domain",
        "24/7 priority support",
        "Advanced analytics",
        "Team collaboration"
      ],
      cta: "Get Pro",
      popular: false,
      highlighted: false
    },
    {
      name: "Business",
      slug: "business",
      price: "$15",
      period: "per month",
      description: "For growing teams and organizations.",
      features: [
        "100 GB storage",
        "Unlimited everything",
        "All AI tools + API access",
        "Custom domains",
        "Dedicated support",
        "Enterprise analytics",
        "White-label branding",
        "SLA guarantee"
      ],
      cta: "Get Business",
      popular: false,
      highlighted: false
    },
    {
      name: "Enterprise",
      slug: "enterprise",
      price: "Custom",
      period: "",
      description: "Tailored solutions for large organizations.",
      features: [
        "Unlimited storage",
        "Custom AI models",
        "API access & integrations",
        "Dedicated account manager",
        "On-premise deployment",
        "Custom workflows",
        "Security compliance",
        "Scalable infrastructure"
      ],
      cta: "Contact Sales",
      popular: false,
      highlighted: false
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-700 to-indigo-800 text-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            There is a plan for you
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-3xl mx-auto">
            Choose a plan today and unlock a powerful bundle of features. Or start with our free plan.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-md">
              Start Free
            </button>
            <button className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
              View All Plans
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {plans.map((plan, index) => (
            <PricingCard
              key={index}
              plan={plan}
              isPopular={plan.popular}
              isHighlighted={plan.highlighted}
            />
          ))}
        </div>

        {/* Visual Element */}
        <div className="mt-20 flex justify-center">
          <Image
            src="/images/pricing.svg"
            alt="Pricing Overview"
            width={600}
            height={300}
            className="rounded-2xl shadow-xl"
          />
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Upgrade?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are shaping the future of AI through collaboration, learning, and innovation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors shadow-md">
              Start Free Today
            </button>
            <button className="border border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
              Contact Sales
            </button>
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
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}