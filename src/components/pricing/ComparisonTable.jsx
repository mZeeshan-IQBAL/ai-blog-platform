// components/pricing/ComparisonTable.jsx
'use client';
import Reveal from '@/components/ui/Reveal';
import { Check, X } from 'lucide-react';

const features = [
  {
    category: 'Customisation',
    items: [
      { label: 'Full platform', values: [true, true, true] },
      { label: 'Built-in components', values: [true, true, true] },
      { label: 'Custom components', values: [true, true, true] },
      { label: 'Custom CSS and JS', values: [true, true, true] },
      { label: 'Remove Mintlify branding', values: [false, false, 'Custom'] },
      { label: 'Custom theme', values: [false, false, 'Custom'] },
    ]
  },
  {
    category: 'Features',
    items: [
      { label: 'Web editor', values: [true, true, true] },
      { label: 'API playground', values: [true, true, true] },
    ]
  }
];

const plans = [
  { name: 'Hobby', description: 'For personal projects', cta: 'Get started' },
  { name: 'Pro', description: 'For professional use', cta: 'Try for free' },
  { name: 'Custom', description: 'For enterprise needs', cta: 'Get a demo' },
];

export default function ComparisonTable() {
  return (
    <section className="content-section bg-muted/30">
      <div className="content-container">
        <Reveal className="text-center mb-12">
          <h2 className="text-xl sm:text-2xl font-bold mb-3">
            Choose your plan
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Start for free and upgrade as you grow. All plans include our core features.
          </p>
        </Reveal>

        <div className="comparison-table">
          {/* Header with plan names */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div></div> {/* Empty space for feature labels */}
            {plans.map((plan, idx) => (
              <div key={plan.name} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  <h3 className="text-base font-semibold">{plan.name}</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{plan.description}</p>
                <button 
                  className={`w-full py-1.5 px-3 rounded-lg text-xs font-medium transition-colors ${
                    idx === 1 
                      ? 'bg-gray-900 text-white hover:bg-gray-800' 
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Feature sections */}
          <div className="space-y-8">
            {features.map((section) => (
              <div key={section.category}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 bg-primary/10 rounded flex items-center justify-center">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                  <h4 className="text-xs font-semibold text-foreground">
                    {section.category}
                  </h4>
                </div>
                
                <div className="space-y-3">
                  {section.items.map((item) => (
                    <div key={item.label} className="grid grid-cols-4 gap-6 py-1.5">
                      <div className="text-xs text-muted-foreground font-medium">
                        {item.label}
                      </div>
                      {item.values.map((value, idx) => (
                        <div key={idx} className="flex justify-center">
                          {value === true ? (
                            <Check className="w-4 h-4 text-primary" />
                          ) : value === false ? (
                            <X className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <span className="text-xs text-primary font-medium">{value}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
