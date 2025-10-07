// components/pricing/PricingCard.jsx
"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useSubscription } from "@/hooks/useSubscription";

export default function PricingCard({ plan, isPopular, isHighlighted }) {
  const { subscription, isPremium } = useSubscription();
  const isCurrentPlan = subscription?.plan === plan.slug;
  // Determine the correct href based on plan type
  const getHref = () => {
    if (plan.slug === "free") {
      return "/dashboard"; // Direct to dashboard for free plan
    }
    if (plan.slug === "enterprise") {
      return "/contact"; // Enterprise goes to contact
    }
    return `/pricing/${plan.slug}`; // Paid plans go through auth flow
  };

  return (
    <div
      className={`
        relative flex flex-col h-full bg-card text-card-foreground rounded-2xl border border-border p-6
        ${isPopular ? "border-primary/60 shadow-glow" : ""}
        ${isHighlighted ? "bg-accent/40" : ""}
        transition-all hover:shadow-lg hover:-translate-y-0.5
      `}
    >
      {/* Labels */}
      <div className="absolute -top-3 left-6 flex gap-2">
        {isCurrentPlan && (
          <span className="bg-green-600 text-white text-xs font-medium px-3 py-1 rounded">
            Current Plan
          </span>
        )}
        {isPopular && !isCurrentPlan && (
          <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded">
            Popular
          </span>
        )}
      </div>

      {/* Plan Name */}
      <h3 className="text-xl font-semibold mb-2 mt-2">
        {plan.name}
      </h3>
      
      {/* Description */}
      <p className="text-sm text-muted-foreground mb-6">
        {plan.description}
      </p>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">
            {plan.price}
          </span>
          {plan.period && (
            <span className="text-sm text-muted-foreground">{plan.period}</span>
          )}
        </div>
        {plan.price !== "Custom" && plan.slug !== "free" && (
          <p className="text-xs text-muted-foreground mt-1">one-time payment for 30 days</p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-2.5 mb-8 flex-1">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start text-sm">
            <svg
              className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            {feature}
          </li>
        ))}
      </ul>

      {/* CTA Button */}
      {isCurrentPlan ? (
        <div className="w-full">
          <Button
            as="link"
            href="/billing"
            variant="outline"
            size="lg"
            className="w-full mb-2 border-green-300 text-green-700 hover:bg-green-50"
          >
            ✓ Current Plan
          </Button>
          <Button
            as="link"
            href="/billing"
            variant="ghost"
            size="sm"
            className="w-full text-xs text-gray-600"
          >
            Manage Subscription
          </Button>
        </div>
      ) : (
        <Button
          as="link"
          href={getHref()}
          variant={plan.slug === "enterprise" ? "secondary" : plan.slug === "free" ? "outline" : "gradient"}
          size="lg"
          className="w-full"
          disabled={subscription?.plan === 'free' && plan.slug === 'free'}
        >
          {subscription?.plan === 'free' && plan.slug === 'free' ? 'Current Plan' : plan.cta}
        </Button>
      )}
    </div>
  );
}
