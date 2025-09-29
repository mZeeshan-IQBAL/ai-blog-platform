// src/components/ui/Input.jsx
import { cn } from "@/lib/utils";

export function Input({ className, type = "text", ...props }) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background transition-all duration-200",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "focus:border-ring hover:border-accent-foreground/30",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "min-h-[44px] text-base sm:text-sm", // Better mobile touch targets and prevent zoom on iOS
        className
      )}
      {...props}
    />
  );
}
