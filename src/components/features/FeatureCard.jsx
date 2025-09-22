// components/features/FeatureCard.jsx
import React from "react";

export default function FeatureCard({ icon, title, description, highlight, color }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-200 border border-gray-100">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-2xl`}
        >
          {icon}
        </div>

        {/* Content */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-gray-600 leading-relaxed mb-2">
            {description}
          </p>
          {/* ✅ Highlight tagline */}
          {highlight && (
            <p className="text-sm italic font-medium text-blue-600">
              {highlight}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
