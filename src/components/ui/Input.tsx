import { type InputHTMLAttributes, memo } from "react";
import { cn } from "@/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = memo(function Input({
  hasError,
  className,
  ...rest
}: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border px-3 py-2 text-sm",
        "bg-white/80 dark:bg-surface-900",
        "text-surface-900 dark:text-surface-100",
        "placeholder:text-surface-500 dark:placeholder:text-surface-400",
        "transition-colors duration-150",
        "focus:outline-none focus:ring-2 focus:ring-offset-1",
        "dark:focus:ring-offset-surface-950",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        hasError
          ? "border-danger-500 focus:ring-danger-400"
          : "border-surface-300 dark:border-surface-600 focus:ring-primary-500 focus:border-primary-500",
        className,
      )}
      {...rest}
    />
  );
});
