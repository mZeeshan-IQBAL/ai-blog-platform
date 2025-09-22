// components/pricing/PricingCard.jsx
import React from "react";
import Link from "next/link";

export default function PricingCard({ plan, isPopular, isHighlighted }) {
  const baseClass =
    "bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-transform transform hover:-translate-y-1 hover:shadow-xl";
  const popularClass = isPopular ? "ring-2 ring-blue-500 scale-[1.02]" : "";
  const highlightedClass = isHighlighted
    ? "bg-gradient-to-br from-blue-50 to-purple-50"
    : "";

  return (
    <div className={`${baseClass} ${popularClass} ${highlightedClass}`}>
      {/* Popular Label */}
      {isPopular && (
        <div className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 text-center uppercase tracking-wide">
          Most Popular
        </div>
      )}

      <div className="p-8 flex flex-col h-full">
        {/* Plan Name */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-gray-600 mb-6 text-sm">{plan.description}</p>

        {/* Price */}
        <div className="mb-8">
          <div className="flex items-baseline">
            <span className="text-4xl font-extrabold text-gray-900">
              {plan.price}
            </span>
            {plan.period && (
              <span className="text-sm text-gray-500 ml-2">{plan.period}</span>
            )}
          </div>
          {plan.price !== "Custom" && (
            <div className="text-xs text-gray-500 mt-1">
              per month, billed yearly
            </div>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-3 mb-8 flex-1">
          {plan.features.map((feature, index) => (
            <li
              key={index}
              className="flex items-start text-sm text-gray-700 leading-snug"
            >
              <svg
                className="w-5 h-5 text-green-500 mt-0.5 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {feature}
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Link
          href={`/pricing/${plan.slug}`}
          className={`block w-full text-center py-3 px-4 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition ${
            plan.slug === "free"
              ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
              : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-purple-500"
          }`}
        >
          {plan.cta}
        </Link>
      </div>
    </div>
  );
}