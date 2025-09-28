// components/pricing/PricingCard.jsx
import React from "react";
import Link from "next/link";

export default function PricingCard({ plan, isPopular, isHighlighted }) {
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
        relative flex flex-col h-full bg-card text-card-foreground rounded-lg border border-border p-6
        ${isPopular ? "border-primary shadow-sm" : ""}
        ${isHighlighted ? "bg-accent" : ""}
        transition-shadow hover:shadow-md
      `}
    >
      {/* Popular Label */}
      {isPopular && (
        <div className="absolute -top-3 left-6">
          <span className="bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded">
            Popular
          </span>
        </div>
      )}

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
      <Link
        href={getHref()}
        className={`
          block w-full text-center py-2.5 px-4 rounded-md font-medium
          transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background
          ${
            plan.slug === "enterprise"
              ? "bg-foreground text-background hover:bg-foreground/90"
              : plan.slug === "free"
              ? "border border-input bg-background text-foreground hover:bg-accent"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }
        `}
      >
        {plan.cta}
      </Link>
    </div>
  );
}
