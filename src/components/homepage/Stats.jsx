// components/homepage/Stats.jsx
'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

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
    <div className="text-center p-6 bg-card rounded-lg border border-border hover:shadow-md transition-shadow">
      <div className="mb-4">
        <h3 className="text-3xl sm:text-4xl font-bold">
          {inView ? `${count.toLocaleString()}${suffix}` : '0'}
        </h3>
      </div>
      <p className="text-muted-foreground font-medium">
        {stat.label}
      </p>
    </div>
  );
};

export default function Stats() {
  const [ref, inView] = useInView(0.3);

  const stats = [
    { label: "Active Writers", value: "25k+" },
    { label: "Stories Published", value: "120k+" },
    { label: "Monthly Readers", value: "500k+" },
    { label: "Countries Reached", value: "80+" },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-12">
          <h2 className="heading-responsive font-bold mb-4">
            Trusted by storytellers worldwide
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Join thousands of writers, readers, and storytellers sharing compelling content and building meaningful connections.
          </p>
        </div>

        {/* Stats grid */}
        <div 
          ref={ref}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
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
      </div>
    </section>
  );
}