import { FormBuilder } from "@/components/builder/FormBuilder";
import { ToastContainer, useToasts } from "@/components/ui";
import { useTheme } from "@/hooks/useTheme";
import { Logo } from "@/assets/logo";
import { AppLabels, Themes } from "@/constants/messages";
import { Sun, Moon } from "lucide-react";

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { toasts, addToast, dismissToast } = useToasts();

  return (
    <div className="min-h-screen bg-surface-100 dark:bg-surface-950 transition-colors duration-200">
      <header className="sticky top-0 z-40 border-b border-surface-200/60 dark:border-surface-800 bg-white/60 dark:bg-surface-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo />
            <div>
              <h1 className="text-sm font-semibold text-surface-900 dark:text-surface-100">
                {AppLabels.appTitle}
              </h1>
              <p className="text-xs text-surface-600 dark:text-surface-400 hidden sm:block">
                {AppLabels.appSubtitle}
              </p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-surface-600 hover:text-surface-800 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-surface-200 dark:hover:bg-surface-800 transition-colors"
            aria-label={AppLabels.switchTheme(theme)}
          >
            {theme === Themes.Light ? (
              <Moon className="h-5 w-5" />
            ) : (
              <Sun className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <FormBuilder onToast={addToast} />
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
