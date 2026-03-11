import { FormBuilder } from "@/components/builder/FormBuilder";
import { ToastContainer, useToasts, Button } from "@/components/ui";
import { useTheme } from "@/hooks/useTheme";
import { Logo } from "@/assets/logo";
import { AppLabels, Themes } from "@/constants/messages";
import { Sun, Moon } from "lucide-react";

/** Root layout: header with theme toggle, main content area, and global toast container. */
export default function App() {
  const { theme, toggleTheme } = useTheme();
  const { toasts, addToast, dismissToast } = useToasts();

  return (
    <div className="min-h-screen bg-surface-100 dark:bg-surface-950 transition-colors duration-200">
      <header className="glass-header">
        <div className="container-app h-14 flex items-center justify-between">
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

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            aria-label={AppLabels.switchTheme(theme)}
            icon={theme === Themes.Light ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          />
        </div>
      </header>

      <main className="container-app py-6">
        <FormBuilder onToast={addToast} />
      </main>

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
