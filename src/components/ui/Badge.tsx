import { type ReactNode, memo } from "react";
import { cn } from "@/utils/cn";

type BadgeVariant = "default" | "primary" | "success" | "warning" | "danger";

const variants: Record<BadgeVariant, string> = {
  default:
    "bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300",
  primary:
    "bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300",
  success:
    "bg-success-50 text-success-700 dark:bg-success-700/20 dark:text-success-500",
  warning:
    "bg-warning-50 text-warning-600 dark:bg-warning-600/20 dark:text-warning-500",
  danger:
    "bg-danger-50 text-danger-700 dark:bg-danger-500/20 dark:text-danger-400",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
}

export const Badge = memo(function Badge({
  variant = "default",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
});
