import { type ReactNode, memo } from "react";
import { cn } from "@/utils/cn";
import { AriaLabels } from "@/constants/messages";

interface FieldWrapperProps {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

/** Wraps any form control with label, required indicator, inline error, and optional hint. */
export const FieldWrapper = memo(function FieldWrapper({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
}: FieldWrapperProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-surface-700 dark:text-surface-300"
        >
          {label}
          {required && (
            <span className="text-danger-500 ml-0.5" aria-label={AriaLabels.required}>
              *
            </span>
          )}
        </label>
      )}
      {children}
      {error && (
        <p className="text-xs text-danger-600 dark:text-danger-400" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-surface-600 dark:text-surface-400">
          {hint}
        </p>
      )}
    </div>
  );
});
