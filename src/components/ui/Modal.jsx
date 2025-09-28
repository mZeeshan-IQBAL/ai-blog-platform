// src/components/ui/Modal.jsx
"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export function Modal({ open, onClose, title, children, className, ...props }) {
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => onClose?.()}
            aria-hidden="true"
          />
          <motion.div
            className={cn(
              "relative z-10 w-full max-w-lg rounded-lg border border-border bg-card text-card-foreground shadow-lg",
              className
            )}
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            {...props}
          >
            {title && (
              <div className="p-4 border-b border-border">
                <h2 className="text-lg font-semibold">{title}</h2>
              </div>
            )}
            <div className="p-4">{children}</div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
