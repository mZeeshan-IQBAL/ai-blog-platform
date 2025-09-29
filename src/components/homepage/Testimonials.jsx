// components/homepage/Testimonials.jsx
'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// Enhanced testimonials data with more details
const testimonials = [
  {
    id: 1,
    name: "Sarah Chen",
    role: "Creative Writer",
    company: "Independent Author",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    text: "BlogSphere has completely transformed my writing journey. The AI writing assistant helps me overcome writer's block, and the community feedback is incredibly valuable.",
    rating: 5,
    featured: true
  },
  {
    id: 2,
    name: "James Rodriguez",
    role: "Lifestyle Blogger",
    company: "Travel & Food Blog",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    text: "The community here is incredibly supportive and engaged. I've found my voice as a writer and built an amazing readership. This platform changed my life!",
    rating: 5,
    featured: false
  },
  {
    id: 3,
    name: "Dr. Priya Patel",
    role: "Science Communicator",
    company: "Popular Science Writer",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    text: "As a science writer, I've found an incredible community of readers who are genuinely interested in learning. The engagement and discussions are top-notch.",
    rating: 5,
    featured: true
  },
  {
    id: 4,
    name: "Michael Thompson",
    role: "Fiction Writer",
    company: "Published Novelist",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    text: "The quality of writing and storytelling on this platform is extraordinary. I've discovered so many talented writers and made genuine connections with readers.",
    rating: 5,
    featured: false
  },
  {
    id: 5,
    name: "Emily Watson",
    role: "Book Reviewer",
    company: "Literary Magazine Editor",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    text: "As someone who reviews books professionally, I'm amazed by the caliber of content here. Many stories rival traditionally published works.",
    rating: 5,
    featured: false
  },
  {
    id: 6,
    name: "Alex Kim",
    role: "Poetry Enthusiast",
    company: "Amateur Poet",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    text: "I started sharing my poetry here as a complete beginner. The supportive community and constructive feedback helped me grow into a confident writer.",
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
          : 'bg-card border border-border shadow-lg'
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
          <blockquote className="text-muted-foreground text-lg leading-relaxed mb-6 italic font-medium">
            "{testimonial.text}"
          </blockquote>

          {/* Author info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-background shadow-md"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${testimonial.name}&background=3b82f6&color=ffffff&size=150`;
                }}
              />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-background"></div>
            </div>
            
            <div className="text-left">
              <h4 className="font-semibold text-lg">
                {testimonial.name}
              </h4>
              <p className="text-primary font-medium text-sm">
                {testimonial.role}
              </p>
              <p className="text-muted-foreground text-xs">
                {testimonial.company}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced carousel for mobile view with swipe support
const TestimonialCarousel = ({ testimonials }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
    setIsAutoPlay(false);
    setTimeout(() => setIsAutoPlay(true), 3000);
  };

  // Touch handlers for swipe gestures
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsAutoPlay(false);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;
    
    if (distance > minSwipeDistance) {
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      prevSlide();
    }
    
    setTimeout(() => setIsAutoPlay(true), 3000);
  };

  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [isAutoPlay]);

  return (
    <div className="relative">
      <div 
        className="overflow-hidden rounded-xl"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.id} className="w-full flex-shrink-0 px-2">
              <TestimonialCard testimonial={testimonial} index={index} />
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced carousel controls */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <button 
          onClick={() => {
            prevSlide();
            setIsAutoPlay(false);
            setTimeout(() => setIsAutoPlay(true), 3000);
          }}
          className="p-3 rounded-full bg-card border border-border shadow-lg hover:bg-accent hover:scale-105 active:scale-95 transition-all duration-200 min-w-[44px] min-h-[44px]"
          aria-label="Previous testimonial"
        >
          <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Enhanced dot indicators */}
        <div className="flex gap-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`min-w-[44px] min-h-[44px] flex items-center justify-center transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-8 h-3 bg-primary rounded-full' 
                  : 'w-3 h-3 bg-muted rounded-full hover:bg-muted-foreground/50'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        <button 
          onClick={() => {
            nextSlide();
            setIsAutoPlay(false);
            setTimeout(() => setIsAutoPlay(true), 3000);
          }}
          className="p-3 rounded-full bg-card border border-border shadow-lg hover:bg-accent hover:scale-105 active:scale-95 transition-all duration-200 min-w-[44px] min-h-[44px]"
          aria-label="Next testimonial"
        >
          <svg className="w-5 h-5 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default function Testimonials() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 xl:py-24 bg-background animate-fade-in">
      <div className="max-w-7xl mx-auto container-mobile">
        {/* Section header */}
        <div className="text-center mb-10 sm:mb-16 animate-slide-up">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4 sm:mb-6 border border-primary/20">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Testimonials
          </div>
          
          <h2 className="heading-responsive font-bold mb-4 sm:mb-6 leading-tight">
            Loved by Writers and Readers
          </h2>
          
          <p className="text-responsive text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Join thousands of storytellers, bloggers, and readers who are already 
            sharing amazing content and building meaningful connections on our platform.
          </p>
        </div>

        {/* Mobile carousel */}
        <div className="block sm:hidden mb-8">
          <TestimonialCarousel testimonials={testimonials} />
        </div>

        {/* Desktop grid */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <TestimonialCard 
                testimonial={testimonial} 
                index={0}
              />
            </div>
          ))}
        </div>

        {/* Bottom stats */}
        <div className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold mb-2">4.9/5</div>
            <div className="text-muted-foreground text-sm">Average Rating</div>
          </div>
          <div>
            <div className="text-2xl font-bold mb-2">10K+</div>
            <div className="text-muted-foreground text-sm">Happy Writers</div>
          </div>
          <div>
            <div className="text-2xl font-bold mb-2">99%</div>
            <div className="text-muted-foreground text-sm">Satisfaction Rate</div>
          </div>
          <div>
            <div className="text-2xl font-bold mb-2">24/7</div>
            <div className="text-muted-foreground text-sm">Community Support</div>
          </div>
        </div>
      </div>
    </section>
  );
}