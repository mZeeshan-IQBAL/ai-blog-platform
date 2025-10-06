// src/components/ui/Button.jsx
"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";

const baseStyles =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background transform active:scale-95 select-none";

const variants = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md active:bg-primary/95",
  secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-sm active:bg-secondary/90",
  outline: "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground hover:border-accent-foreground/20 active:bg-accent/80",
  ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:shadow-md active:bg-destructive/95",
  link: "text-primary underline-offset-4 hover:underline hover:text-primary/80 active:text-primary/90",
  gradient: "brand-gradient text-white shadow-glow hover:brightness-110 active:brightness-95 btn-glow",
};

const sizes = {
  xs: "h-8 px-2 py-1 text-xs",
  sm: "h-9 px-3 py-2 text-sm min-w-[2.25rem]",
  md: "h-10 px-4 py-2 text-sm min-w-[2.5rem]",
  lg: "h-11 px-6 py-3 text-base min-w-[2.75rem]",
  xl: "h-12 px-8 py-3 text-lg min-w-[3rem]",
  icon: "h-10 w-10 min-w-[2.5rem] min-h-[2.5rem]",
  "icon-sm": "h-8 w-8 min-w-[2rem] min-h-[2rem]",
  "icon-lg": "h-12 w-12 min-w-[3rem] min-h-[3rem]",
};

export function Button({
  as = "button",
  variant = "default",
  size = "md",
  className,
  href,
  children,
  ...props
}) {
  const classes = cn(baseStyles, variants[variant], sizes[size], className);
  if (as === "a" && href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  if (as === "link") {
    return (
      <Link href={href || "#"} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
