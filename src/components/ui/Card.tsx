import { memo, type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface CardProps {
  children: ReactNode;
  className?: string;
}

/** Frosted glass card — used for preview area, config panel, and empty states. */
export const Card = memo(function Card({ children, className }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-surface-200/60 dark:border-surface-700 bg-white/70 dark:bg-surface-800/50 backdrop-blur-lg",
        className,
      )}
    >
      {children}
    </div>
  );
});
