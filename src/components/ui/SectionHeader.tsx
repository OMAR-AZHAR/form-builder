import { memo, type ReactNode } from "react";
import { cn } from "@/utils/cn";

interface SectionHeaderProps {
  children: ReactNode;
  className?: string;
  as?: "h2" | "h3" | "h4" | "p";
}

export const SectionHeader = memo(function SectionHeader({
  children,
  className,
  as: Tag = "h3",
}: SectionHeaderProps) {
  return (
    <Tag
      className={cn(
        "text-xs font-semibold uppercase tracking-wider text-surface-600 dark:text-surface-300",
        className,
      )}
    >
      {children}
    </Tag>
  );
});
