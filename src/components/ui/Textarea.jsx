// src/components/ui/Textarea.jsx
import { cn } from "@/lib/utils";

export function Textarea({ className, rows = 4, ...props }) {
  return (
    <textarea
      rows={rows}
      className={cn(
        "w-full rounded-lg border border-input bg-background px-4 py-3 text-sm ring-offset-background transition-all duration-200",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "focus:border-ring hover:border-accent-foreground/30 focus:shadow-[0_0_0_3px_rgba(13,147,115,0.12)]",
        "disabled:cursor-not-allowed disabled:opacity-50 resize-y",
        "min-h-[88px] text-base sm:text-sm caret-primary placeholder:opacity-80 focus:placeholder:opacity-50",
        className
      )}
      {...props}
    />
  );
}
