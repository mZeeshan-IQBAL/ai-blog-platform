// components/features/FeatureCard.jsx
import React from "react";

export default function FeatureCard({ icon, title, description, highlight, color = "bg-gray-100" }) {
  return (
    <div className="bg-card p-6 rounded-lg border border-border hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Icon - Simple, no gradient */}
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-xl flex-shrink-0`}>
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2">
            {title}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
          {/* Highlight tagline */}
          {highlight && (
            <p className="text-sm text-primary mt-2 font-medium">
              {highlight}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
