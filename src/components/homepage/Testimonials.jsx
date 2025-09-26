// components/homepage/Testimonials.jsx
'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Enhanced testimonials data with more details
const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "AI Researcher",
    company: "Stanford University",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    text: "This platform has revolutionized how I collaborate with fellow researchers. The AI-powered insights have accelerated my research significantly.",
    rating: 5,
    featured: true
  },
  {
    id: 2,
    name: "James Rodriguez",
    role: "Senior Full-Stack Developer",
    company: "TechCorp Inc.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    text: "The community here is incredibly knowledgeable. I've learned cutting-edge techniques that I now use in production. Game-changer for my career!",
    rating: 5,
    featured: false
  },
  {
    id: 3,
    name: "Dr. Priya Patel",
    role: "Lead Data Scientist",
    company: "DataVision Labs",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    text: "Found amazing collaborators for my AI projects here. The quality of discussions and shared resources is unmatched in the industry.",
    rating: 5,
    featured: true
  },
  {
    id: 4,
    name: "Michael Thompson",
    role: "ML Engineer",
    company: "Google DeepMind",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    text: "The depth of knowledge shared here is incredible. It's like having access to the world's best AI minds 24/7.",
    rating: 5,
    featured: false
  },
  {
    id: 5,
    name: "Emily Watson",
    role: "Product Manager",
    company: "Microsoft AI",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    text: "As a PM working with AI teams, this platform helps me stay current with the latest developments and make informed decisions.",
    rating: 5,
    featured: false
  },
  {
    id: 6,
    name: "Alex Kim",
    role: "Startup Founder",
    company: "NeuralTech Solutions",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    text: "This community helped me validate my AI startup idea and connect with potential co-founders. Invaluable resource for entrepreneurs.",
    rating: 5,
    featured: true
  }
];

// Star rating component
const StarRating = ({ rating }) => {
  return (
    <div className="flex justify-center gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <svg
          key={i}
          className={`w-5 h-5 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
};

// Individual testimonial card
const TestimonialCard = ({ testimonial, index }) => {
  const [isVisible, setIsVisible] = useState(false);
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
    <div
      ref={cardRef}
      className={`transform transition-all duration-700 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      }`}
    >
      <div className={`relative overflow-hidden rounded-2xl p-8 transition-shadow duration-300 ${
        testimonial.featured 
          ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-lg' 
          : 'bg-white border border-gray-200 shadow-lg'
      }`}>
        
        {/* Featured badge */}
        {testimonial.featured && (
          <div className="absolute top-4 right-4">
            <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              ⭐ Featured
            </span>
          </div>
        )}

        {/* Quote decoration */}
        <div className="absolute top-6 left-6 text-6xl text-blue-100 font-serif leading-none select-none">
          "
        </div>

        <div className="relative z-10">
          {/* Rating */}
          <StarRating rating={testimonial.rating} />

          {/* Testimonial text */}
          <blockquote className="text-gray-600 text-lg leading-relaxed mb-6 italic font-medium">
            "{testimonial.text}"
          </blockquote>

          {/* Author info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="w-14 h-14 rounded-full object-cover border-3 border-white shadow-md"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${testimonial.name}&background=3b82f6&color=ffffff&size=150`;
                }}
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 text-lg">
                {testimonial.name}
              </h4>
              <p className="text-blue-600 font-medium text-sm">
                {testimonial.role}
              </p>
              <p className="text-gray-500 text-xs">
                {testimonial.company}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Carousel for mobile view
const TestimonialCarousel = ({ testimonials }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-500"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
              <TestimonialCard testimonial={testimonial} index={index} />
            </div>
          ))}
        </div>
      </div>

      {/* Carousel controls */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button 
          onClick={prevSlide}
          className="p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="flex gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <button 
          onClick={nextSlide}
          className="p-2 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default function Testimonials() {
  return (
    <section className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Testimonials
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            Trusted by Innovation Leaders
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join thousands of researchers, developers, and AI enthusiasts who are already 
            transforming their careers with our platform.
          </p>
        </div>

        {/* Mobile carousel */}
        <div className="block sm:hidden">
          <TestimonialCarousel testimonials={testimonials} />
        </div>

        {/* Desktop grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard 
              key={testimonial.id} 
              testimonial={testimonial} 
              index={index}
            />
          ))}
        </div>

        {/* Bottom stats */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-2">4.9/5</div>
            <div className="text-gray-600 text-sm">Average Rating</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-2">10K+</div>
            <div className="text-gray-600 text-sm">Happy Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-2">99%</div>
            <div className="text-gray-600 text-sm">Satisfaction Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 mb-2">24/7</div>
            <div className="text-gray-600 text-sm">Community Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}