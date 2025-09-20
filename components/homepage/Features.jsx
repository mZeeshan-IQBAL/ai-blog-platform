// components/homepage/Features.jsx
'use client';
import { useState, useEffect, useRef } from 'react';

// Enhanced features data with more comprehensive information
const featuresData = [
  {
    id: 1,
    title: "AI-Powered Discovery",
    shortDesc: "Enhance content discovery with AI",
    detailedDesc: "Our advanced machine learning algorithms analyze your interests, reading patterns, and collaboration history to surface the most relevant content and potential collaborators for your projects.",
    icon: "🤖",
    color: "bg-blue-100 text-blue-600",
    gradient: "from-blue-50 to-blue-100",
    borderColor: "border-blue-200",
    hoverColor: "hover:border-blue-300",
    benefits: [
      "Smart content recommendations",
      "Personalized learning paths", 
      "Auto-generated research insights",
      "Predictive collaboration matching"
    ],
    metrics: {
      value: "87%",
      label: "More relevant content discovery"
    }
  },
  {
    id: 2,
    title: "Community Driven",
    shortDesc: "Knowledge sharing for developers",
    detailedDesc: "Join a thriving ecosystem of developers, researchers, and innovators. Share your expertise, learn from others, and build meaningful professional relationships that accelerate your growth.",
    icon: "👥",
    color: "bg-green-100 text-green-600",
    gradient: "from-green-50 to-green-100",
    borderColor: "border-green-200",
    hoverColor: "hover:border-green-300",
    benefits: [
      "Expert-led discussions",
      "Peer code reviews",
      "Mentorship programs",
      "Global networking events"
    ],
    metrics: {
      value: "50K+",
      label: "Active community members"
    }
  },
  {
    id: 3,
    title: "Innovation Hub",
    shortDesc: "Contribute and learn new ideas",
    detailedDesc: "Be at the forefront of technological innovation. Access cutting-edge research, contribute to open-source projects, and collaborate on groundbreaking solutions that shape the future.",
    icon: "💡",
    color: "bg-purple-100 text-purple-600",
    gradient: "from-purple-50 to-purple-100",
    borderColor: "border-purple-200",
    hoverColor: "hover:border-purple-300",
    benefits: [
      "Early access to new technologies",
      "Research collaboration opportunities",
      "Innovation challenges & hackathons",
      "Patent and publication support"
    ],
    metrics: {
      value: "1000+",
      label: "Innovation projects launched"
    }
  }
];

// Individual feature card component
const FeatureCard = ({ feature, index, isExpanded, onToggle }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), index * 200);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [index]);

  return (
    <article
      ref={cardRef}
      className={`group relative overflow-hidden rounded-2xl transition-all duration-700 cursor-pointer ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onToggle(feature.id)}
    >
      <div className={`relative p-8 bg-gradient-to-br ${feature.gradient} border-2 ${feature.borderColor} ${feature.hoverColor} transition-all duration-500 h-full ${
        isExpanded ? 'shadow-2xl scale-105' : 'shadow-lg hover:shadow-xl hover:scale-102'
      }`}>
        
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
        
        {/* Floating particles effect */}
        {isHovered && (
          <>
            <div className="absolute top-4 right-8 w-2 h-2 bg-current rounded-full animate-ping" style={{ animationDelay: '0s' }}></div>
            <div className="absolute top-12 right-4 w-1 h-1 bg-current rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-8 right-12 w-1.5 h-1.5 bg-current rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          </>
        )}

        {/* Header section */}
        <div className="relative z-10 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className={`${feature.color} p-4 rounded-2xl text-3xl shadow-lg group-hover:shadow-xl transition-shadow duration-300`}>
              {feature.icon}
            </div>
            
            {/* Metric badge */}
            <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-700 shadow-md">
              {feature.metrics.value}
            </div>
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-current transition-colors duration-300">
            {feature.title}
          </h3>
          
          <p className="text-gray-600 leading-relaxed">
            {isExpanded ? feature.detailedDesc : feature.shortDesc}
          </p>
        </div>

        {/* Expandable content */}
        <div className={`transition-all duration-500 overflow-hidden ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="space-y-4 pt-4 border-t border-white/30">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Key Benefits:</h4>
              <ul className="space-y-2">
                {feature.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-current flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white/50 p-3 rounded-lg">
              <div className="text-lg font-bold text-current">{feature.metrics.value}</div>
              <div className="text-xs text-gray-600">{feature.metrics.label}</div>
            </div>
          </div>
        </div>

        {/* Expand/Collapse indicator */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/30">
          <span className="text-sm text-gray-600">
            {isExpanded ? 'Click to collapse' : 'Click to learn more'}
          </span>
          <svg 
            className={`w-5 h-5 text-current transition-transform duration-300 ${
              isExpanded ? 'rotate-180' : ''
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/20 group-hover:to-white/10 transition-all duration-500 rounded-2xl pointer-events-none"></div>
      </div>
    </article>
  );
};

// Main features component
export default function Features() {
  const [expandedCard, setExpandedCard] = useState(null);

  const handleToggle = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50/50 to-blue-50/30"></div>
      <div className="absolute top-10 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '3s' }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 px-6 py-3 rounded-full text-sm font-semibold mb-6">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Platform Features
          </div>
          
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Everything You Need to
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
              Accelerate Innovation
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Our platform combines cutting-edge AI technology with a vibrant community to create 
            the ultimate environment for learning, collaboration, and innovation.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-10">
          {featuresData.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              index={index}
              isExpanded={expandedCard === feature.id}
              onToggle={handleToggle}
            />
          ))}
        </div>

        {/* Bottom CTA section */}
        <div className="text-center mt-20">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-8 lg:p-12 rounded-3xl border border-blue-100">
            <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Ready to Experience These Features?
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of innovators who are already leveraging our platform to 
              accelerate their projects and advance their careers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                Start Free Trial
              </button>
              <button className="bg-white text-gray-700 px-8 py-4 rounded-xl font-semibold border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-200">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}