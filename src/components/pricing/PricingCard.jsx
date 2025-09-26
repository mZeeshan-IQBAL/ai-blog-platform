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
        relative flex flex-col h-full bg-white rounded-lg border p-6
        ${isPopular ? "border-blue-500 shadow-sm" : "border-gray-200"}
        ${isHighlighted ? "bg-gray-50" : ""}
        transition-shadow hover:shadow-md
      `}
    >
      {/* Popular Label */}
      {isPopular && (
        <div className="absolute -top-3 left-6">
          <span className="bg-blue-500 text-white text-xs font-medium px-3 py-1 rounded">
            Popular
          </span>
        </div>
      )}

      {/* Plan Name */}
      <h3 className="text-xl font-semibold text-gray-900 mb-2 mt-2">
        {plan.name}
      </h3>
      
      {/* Description */}
      <p className="text-sm text-gray-600 mb-6">
        {plan.description}
      </p>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-gray-900">
            {plan.price}
          </span>
          {plan.period && (
            <span className="text-sm text-gray-500">{plan.period}</span>
          )}
        </div>
        {/* Remove "billed annually" - not applicable for one-time payments */}
        {plan.price !== "Custom" && plan.slug !== "free" && (
          <p className="text-xs text-gray-500 mt-1">one-time payment for 30 days</p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-2.5 mb-8 flex-1">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start text-sm text-gray-700">
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
          transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2
          ${
            plan.slug === "enterprise"
              ? "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-500"
              : plan.slug === "free"
              ? "bg-white text-gray-900 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500"
              : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
          }
        `}
      >
        {plan.cta}
      </Link>
    </div>
  );
}