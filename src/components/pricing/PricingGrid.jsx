"use client";
// components/pricing/PricingGrid.jsx
import { useState } from "react";
import PricingCard from "@/components/pricing/PricingCard";
import Reveal from "@/components/ui/Reveal";

export default function PricingGrid({ plans }) {
  const [mode, setMode] = useState("one-time"); // 'one-time' | 'monthly'

  const computePlan = (p) => {
    // For demo, monthly matches 30-day pricing. You can adjust as needed.
    if (mode === "one-time") return p;
    return {
      ...p,
      period: "per month",
    };
  };

  return (
    <div className="mt-8">
      {/* Toggle */}
      <Reveal className="flex items-center justify-center gap-2 mb-6">
        <span className={`text-sm ${mode === 'one-time' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>One‑time</span>
        <button
          type="button"
          onClick={() => setMode(mode === 'one-time' ? 'monthly' : 'one-time')}
          className="relative h-9 w-16 rounded-full bg-muted border border-border transition-colors"
          aria-label="Toggle billing mode"
        >
          <span
            className={`absolute top-1 left-1 h-7 w-7 rounded-full bg-card border border-border transition-transform ${mode === 'monthly' ? 'translate-x-7' : ''}`}
          />
        </button>
        <span className={`text-sm ${mode === 'monthly' ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>Monthly</span>
      </Reveal>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <Reveal key={plan.slug}>
            <PricingCard
              plan={computePlan(plan)}
              isPopular={plan.popular}
              isHighlighted={plan.highlighted}
            />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
