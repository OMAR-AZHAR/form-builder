import { memo } from "react";
import { cn } from "@/utils/cn";

interface LogoProps {
  className?: string;
}

export const Logo = memo(function Logo({ className }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={cn("h-8 w-8", className)}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="currentColor" className="text-primary-600" />
      <path
        d="M9 11h14M9 16h10M9 21h12"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="23" cy="21" r="3" className="text-primary-400" fill="currentColor" />
    </svg>
  );
});
