import { memo, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "./Button";
import { ButtonLabels } from "@/constants/messages";

interface ErrorBannerProps {
  children: ReactNode;
  onDismiss?: () => void;
}

/** Dismissible error alert with icon and danger styling. */
export const ErrorBanner = memo(function ErrorBanner({
  children,
  onDismiss,
}: ErrorBannerProps) {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-danger-300 dark:border-danger-700 bg-danger-50 dark:bg-danger-500/10 px-4 py-3 text-sm text-danger-700 dark:text-danger-400">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <p className="flex-1">{children}</p>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="ml-auto text-danger-600 hover:text-danger-800 dark:text-danger-400 dark:hover:text-danger-300"
        >
          {ButtonLabels.dismiss}
        </Button>
      )}
    </div>
  );
});
