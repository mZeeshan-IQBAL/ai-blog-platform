"use client";
//src/components/ui/Breadcrumbs.jsx

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
    <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground mb-4">
      <ol className="flex items-center gap-2 flex-wrap">
        {displayItems.map((item, idx) => {
          const isLast = idx === displayItems.length - 1;
          const isEllipsis = item.label === "...";

          return (
            <li key={idx} className="flex items-center gap-2">
              {isEllipsis ? (
                <span className="text-muted-foreground">...</span>
              ) : item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="flex items-center gap-1 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
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
                    isLast ? "text-foreground font-medium" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </span>
              )}
              {!isLast && <span className="text-muted-foreground">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
