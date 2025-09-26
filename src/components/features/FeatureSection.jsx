// components/features/FeatureSection.jsx
import React from "react";
import FeatureCard from "./FeatureCard";

export default function FeatureSection({ title, subtitle, features }) {
  return (
    <div className="py-16">
      {/* Section Header */}
      <div className="text-center mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
          {title}
        </h2>
        {subtitle && (
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <FeatureCard
            key={feature.id || index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            highlight={feature.highlight}
            color={feature.color}
          />
        ))}
      </div>
    </div>
  );
}