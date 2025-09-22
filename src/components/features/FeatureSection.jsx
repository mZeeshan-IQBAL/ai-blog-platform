// components/features/FeatureSection.jsx
import React from "react";
import FeatureCard from "./FeatureCard";

export default function FeatureSection({ title, features }) {
  return (
    <div>
      {/* Section Title */}
      <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
        {title}
      </h2>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            highlight={feature.highlight} // ✅ added support
            color={feature.color}
          />
        ))}
      </div>
    </div>
  );
}
