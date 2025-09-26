// components/homepage/Features.jsx
'use client';
import { useState } from 'react';
import Link from 'next/link';

const featuresData = [
  {
    id: 1,
    title: "AI-Powered Discovery",
    shortDesc: "Smart algorithms help you discover relevant content and connect with the right people.",
    detailedDesc: "Our advanced machine learning algorithms analyze your interests, reading patterns, and collaboration history to surface the most relevant content and potential collaborators for your projects.",
    icon: "🤖",
    color: "bg-blue-100",
    benefits: [
      "Smart content recommendations",
      "Personalized learning paths", 
      "Auto-generated research insights",
      "Predictive collaboration matching"
    ],
    stats: "87% more relevant content"
  },
  {
    id: 2,
    title: "Community Driven",
    shortDesc: "Connect with developers, researchers, and innovators worldwide.",
    detailedDesc: "Join a thriving ecosystem of developers, researchers, and innovators. Share your expertise, learn from others, and build meaningful professional relationships that accelerate your growth.",
    icon: "👥",
    color: "bg-green-100",
    benefits: [
      "Expert-led discussions",
      "Peer code reviews",
      "Mentorship programs",
      "Global networking events"
    ],
    stats: "50K+ active members"
  },
  {
    id: 3,
    title: "Innovation Hub",
    shortDesc: "Access cutting-edge research and contribute to open-source projects.",
    detailedDesc: "Be at the forefront of technological innovation. Access cutting-edge research, contribute to open-source projects, and collaborate on groundbreaking solutions that shape the future.",
    icon: "💡",
    color: "bg-purple-100",
    benefits: [
      "Early access to new technologies",
      "Research collaboration opportunities",
      "Innovation challenges & hackathons",
      "Patent and publication support"
    ],
    stats: "1000+ projects launched"
  },
  {
    id: 4,
    title: "Secure & Reliable",
    shortDesc: "Enterprise-grade security with 99.9% uptime for mission-critical projects.",
    detailedDesc: "Built with security-first architecture, our platform ensures your data and projects are protected with industry-leading encryption, compliance standards, and reliable infrastructure that scales with your needs.",
    icon: "🔒",
    color: "bg-gray-100",
    benefits: [
      "End-to-end encryption",
      "SOC2 & GDPR compliance",
      "99.9% uptime guarantee",
      "Advanced backup systems"
    ],
    stats: "99.9% uptime"
  }
];

const FeatureCard = ({ feature, isExpanded, onToggle }) => {
  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 overflow-hidden transition-all duration-300 cursor-pointer ${
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
              <h3 className="text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <span className="text-xs text-blue-600 font-medium">
                {feature.stats}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed mb-4">
          {isExpanded ? feature.detailedDesc : feature.shortDesc}
        </p>

        {/* Expandable content */}
        <div className={`transition-all duration-300 overflow-hidden ${
          isExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="pt-4 border-t border-gray-100">
            <h4 className="font-medium text-gray-800 mb-3 text-sm">Key Benefits:</h4>
            <ul className="space-y-2">
              {feature.benefits.map((benefit, idx) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-gray-600">
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
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <span className="text-xs text-gray-500">
            {isExpanded ? 'Click to collapse' : 'Click to learn more'}
          </span>
          <svg 
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
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
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Built for modern teams
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Everything you need to discover, learn, and collaborate with the global AI community.
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