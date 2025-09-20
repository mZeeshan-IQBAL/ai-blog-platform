// components/ui/Breadcrumbs.jsx
"use client";

import Link from "next/link";
import { Home } from "lucide-react";
import { motion } from "framer-motion";

export default function Breadcrumbs({ items = [] }) {
  if (!items || items.length === 0) return null;

  // Limit to max 5 items, truncate middle if longer
  const maxItems = 5;
  let displayItems = items;
  if (items.length > maxItems) {
    displayItems = [
      items[0], // first
      { label: "...", href: null },
      ...items.slice(items.length - (maxItems - 2)), // last few
    ];
  }

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-gray-600 mb-4">
      <ol className="flex items-center gap-2 flex-wrap">
        {displayItems.map((item, idx) => {
          const isLast = idx === displayItems.length - 1;
          const isEllipsis = item.label === "...";

          return (
            <li key={idx} className="flex items-center gap-2">
              {isEllipsis ? (
                <span className="text-gray-400">...</span>
              ) : item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                >
                  {idx === 0 && <Home size={14} className="inline-block" />}
                  <motion.span
                    initial={{ opacity: 0, y: 2 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.05 }}
                  >
                    {item.label}
                  </motion.span>
                </Link>
              ) : (
                <span
                  className={`${
                    isLast ? "text-gray-900 font-medium" : "text-gray-500"
                  }`}
                >
                  {item.label}
                </span>
              )}
              {!isLast && <span className="text-gray-400">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
