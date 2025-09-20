// components/homepage/Stats.jsx
'use client';
import { useState, useEffect, useRef } from 'react';

// Custom hook for intersection observer
const useInView = (threshold = 0.1) => {
  const [inView, setInView] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
};

// Custom hook for counting animation
const useCountAnimation = (end, duration = 2000, inView = false) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    let startTime;
    const startValue = 0;
    const endValue = parseInt(end.replace(/[^\d]/g, ''));

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      const currentCount = Math.floor(progress * endValue);
      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [end, duration, inView]);

  return count;
};

// Individual stat card component
const StatCard = ({ stat, index, inView }) => {
  const count = useCountAnimation(stat.value, 2000 + index * 200, inView);
  const suffix = stat.value.replace(/[^\D]/g, '');

  return (
    <div 
      className="group relative overflow-hidden bg-gradient-to-br from-white to-gray-50 p-6 sm:p-8 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all duration-500 hover:shadow-xl hover:-translate-y-2"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-50 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-700"></div>
      
      {/* Icon background */}
      <div className="absolute top-4 right-4 w-8 h-8 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg opacity-60 group-hover:opacity-100 transition-opacity duration-300">
        {index === 0 && (
          <svg className="w-5 h-5 text-blue-600 m-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
          </svg>
        )}
        {index === 1 && (
          <svg className="w-5 h-5 text-blue-600 m-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
          </svg>
        )}
        {index === 2 && (
          <svg className="w-5 h-5 text-blue-600 m-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        )}
        {index === 3 && (
          <svg className="w-5 h-5 text-blue-600 m-1.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div className="mb-3">
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {inView ? `${count.toLocaleString()}${suffix}` : '0'}
          </h3>
          <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mt-2 group-hover:w-16 transition-all duration-500"></div>
        </div>
        <p className="text-gray-600 font-medium text-sm sm:text-base leading-relaxed">
          {stat.label}
        </p>
      </div>

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-blue-100/0 group-hover:from-blue-50/30 group-hover:to-blue-100/10 transition-all duration-500 rounded-2xl"></div>
    </div>
  );
};

export default function Stats() {
  const [ref, inView] = useInView(0.3);

  const stats = [
    { label: "Active Members", value: "25k+", description: "Growing community of developers" },
    { label: "Posts Published", value: "120k+", description: "Knowledge articles shared" },
    { label: "Monthly Visitors", value: "500k+", description: "Global reach and engagement" },
    { label: "Countries Reached", value: "80+", description: "Worldwide presence" },
  ];

  return (
    <section className="relative py-16 sm:py-20 lg:py-24 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white"></div>
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12 lg:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Powering Innovation
            <span className="block text-blue-600 mt-2">Across the Globe</span>
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Join thousands of developers, researchers, and AI enthusiasts who trust our platform 
            to share knowledge and drive technological advancement.
          </p>
        </div>

        {/* Stats grid */}
        <div 
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
        >
          {stats.map((stat, index) => (
            <StatCard 
              key={stat.label} 
              stat={stat} 
              index={index} 
              inView={inView}
            />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 lg:mt-16">
          <p className="text-gray-600 mb-6">
            Ready to be part of our growing community?
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
            Join Us Today
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </section>
  );
}