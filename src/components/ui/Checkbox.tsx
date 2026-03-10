import { type InputHTMLAttributes, type Ref, memo } from "react";
import { cn } from "@/utils/cn";

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  hasError?: boolean;
  ref?: Ref<HTMLInputElement>;
}

export const Checkbox = memo(function Checkbox({
  label,
  hasError,
  className,
  id,
  ref,
  ...rest
}: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex items-center gap-2 cursor-pointer select-none",
        rest.disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        id={id}
        className={cn(
          "h-4 w-4 rounded border transition-colors",
          "text-primary-600 focus:ring-primary-500 focus:ring-2",
          "dark:bg-surface-800",
          hasError
            ? "border-danger-500"
            : "border-surface-300 dark:border-surface-600",
        )}
        {...rest}
      />
      {label && (
        <span className="text-sm text-surface-700 dark:text-surface-300">
          {label}
        </span>
      )}
    </label>
  );
});
