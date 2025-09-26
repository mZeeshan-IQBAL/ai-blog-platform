// components/features/FeatureCard.jsx
import React from "react";

export default function FeatureCard({ icon, title, description, highlight, color = "bg-gray-100" }) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Icon - Simple, no gradient */}
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-gray-700 text-xl flex-shrink-0`}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {description}
          </p>
          {/* Highlight tagline */}
          {highlight && (
            <p className="text-sm text-blue-600 mt-2 font-medium">
              {highlight}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}