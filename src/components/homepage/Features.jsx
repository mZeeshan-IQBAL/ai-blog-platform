// components/homepage/Features.jsx
'use client';
import { useState } from 'react';
import Link from 'next/link';

const featuresData = [
  {
    id: 1,
    title: "Smart Content Discovery",
    shortDesc: "AI-powered recommendations help you find stories and writers that match your interests perfectly.",
    detailedDesc: "Our intelligent recommendation system learns from your reading habits and preferences to surface the most engaging content, helping you discover new writers and topics you'll love.",
    icon: "🔍",
    color: "bg-blue-100",
    benefits: [
      "Personalized story recommendations",
      "Discover new writers and genres", 
      "Smart topic suggestions",
      "Trending content alerts"
    ],
    stats: "87% more relevant content"
  },
  {
    id: 2,
    title: "Thriving Writer Community",
    shortDesc: "Connect with passionate writers, readers, and storytellers from around the globe.",
    detailedDesc: "Join a vibrant community of creative minds where writers support each other, readers engage meaningfully, and everyone contributes to a rich literary ecosystem.",
    icon: "👥",
    color: "bg-green-100",
    benefits: [
      "Writer support groups",
      "Reader feedback and engagement",
      "Writing challenges and prompts",
      "Literary events and discussions"
    ],
    stats: "50K+ active members"
  },
  {
    id: 3,
    title: "AI Writing Assistant",
    shortDesc: "Enhance your writing with intelligent suggestions, grammar checking, and creative inspiration.",
    detailedDesc: "Our advanced AI writing assistant helps you craft better content with real-time suggestions, grammar corrections, style improvements, and creative prompts to overcome writer's block.",
    icon: "✍️",
    color: "bg-purple-100",
    benefits: [
      "Real-time writing suggestions",
      "Grammar and style corrections",
      "Creative writing prompts",
      "Content optimization tips"
    ],
    stats: "95% writer satisfaction"
  },
  {
    id: 4,
    title: "Beautiful Reading Experience",
    shortDesc: "Enjoy distraction-free reading with customizable themes and seamless cross-device sync.",
    detailedDesc: "Experience content the way it was meant to be read with our clean, elegant interface, customizable reading preferences, and seamless synchronization across all your devices.",
    icon: "📚",
    color: "bg-gray-100",
    benefits: [
      "Distraction-free reading mode",
      "Customizable themes and fonts",
      "Cross-device synchronization",
      "Offline reading capability"
    ],
    stats: "99.9% uptime"
  }
];

const FeatureCard = ({ feature, isExpanded, onToggle }) => {
  return (
    <div 
      className={`bg-card text-card-foreground rounded-lg border border-border overflow-hidden transition-all duration-300 cursor-pointer ${
        isExpanded ? 'shadow-lg' : 'hover:shadow-md'
      }`}
      onClick={() => onToggle(feature.id)}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center text-xl flex-shrink-0`}>
            {feature.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {feature.title}
              </h3>
              <span className="text-xs text-primary font-medium">
                {feature.stats}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          {isExpanded ? feature.detailedDesc : feature.shortDesc}
        </p>

        {/* Expandable content */}
        <div className={`transition-all duration-300 overflow-hidden ${
          isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="pt-4 border-t border-border">
            <h4 className="font-medium mb-3 text-sm">Key Benefits:</h4>
            <ul className="space-y-2">
              {feature.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Expand indicator */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">
            {isExpanded ? 'Click to collapse' : 'Click to learn more'}
          </span>
          <svg 
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default function Features() {
  const [expandedCard, setExpandedCard] = useState(null);

  const handleToggle = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  return (
    <section className="py-16 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Everything writers and readers need
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Powerful tools for writing, discovering, and sharing amazing content with a global community of storytellers.
          </p>
        </div>

        {/* Features Grid - 2x2 Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {featuresData.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              isExpanded={expandedCard === feature.id}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>
    </section>
  );
}