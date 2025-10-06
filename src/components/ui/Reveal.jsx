"use client";
// components/ui/Reveal.jsx
import { useEffect, useRef, useState } from "react";

export default function Reveal({ as: Tag = "div", children, className = "", delay = 0, y = 16, once = true }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
          if (once) obs.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.15 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [delay, once]);

  return (
    <Tag
      ref={ref}
      className={`${className} transition-all duration-500 ease-out ${
        visible ? "opacity-100 translate-y-0" : `opacity-0 translate-y-[${y}px]`
      }`}
    >
      {children}
    </Tag>
  );
}
