import { memo, useEffect, useState } from "react";
import { cn } from "@/utils/cn";
import { TOAST_DURATION_MS, TOAST_EXIT_DELAY_MS } from "@/constants/config";
import { CheckCircle, AlertCircle, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  message: string;
}

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const Toast = memo(function Toast({ toast, onDismiss }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setIsVisible(true));
    let exitTimer: ReturnType<typeof setTimeout>;
    const timer = setTimeout(() => {
      setIsVisible(false);
      exitTimer = setTimeout(() => onDismiss(toast.id), TOAST_EXIT_DELAY_MS);
    }, TOAST_DURATION_MS);
    return () => {
      clearTimeout(timer);
      clearTimeout(exitTimer);
    };
  }, [toast.id, onDismiss]);

  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-3 shadow-lg border",
        "transition-all duration-200",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-2 opacity-0",
        toast.type === "success" &&
          "bg-success-50 border-success-500/30 text-success-700 dark:bg-success-700/20 dark:text-success-500 dark:border-success-500/20",
        toast.type === "error" &&
          "bg-danger-50 border-danger-500/30 text-danger-700 dark:bg-danger-500/20 dark:text-danger-400 dark:border-danger-500/20",
        toast.type === "info" &&
          "bg-primary-50 border-primary-500/30 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300 dark:border-primary-500/20",
      )}
    >
      {toast.type === "success" && <CheckCircle className="h-4 w-4 shrink-0" />}
      {toast.type === "error" && <AlertCircle className="h-4 w-4 shrink-0" />}
      {toast.type === "info" && <AlertCircle className="h-4 w-4 shrink-0" />}
      <p className="text-sm flex-1">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 p-0.5 rounded hover:bg-black/5 dark:hover:bg-white/10"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
});

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
