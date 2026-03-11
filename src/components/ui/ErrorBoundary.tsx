import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "./Button";
import { ErrorBoundaryLabels } from "@/constants/messages";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches unhandled render errors and displays a recovery UI
 * instead of unmounting the entire component tree.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="min-h-screen bg-surface-100 dark:bg-surface-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-xl border border-danger-300 dark:border-danger-700 bg-white dark:bg-surface-900 shadow-lg p-8 text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-danger-50 dark:bg-danger-500/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-danger-500" />
          </div>

          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            {ErrorBoundaryLabels.title}
          </h2>

          <p className="text-sm text-surface-600 dark:text-surface-400">
            {ErrorBoundaryLabels.description}
          </p>

          {this.state.error && (
            <pre className="mt-2 rounded-lg bg-surface-100 dark:bg-surface-800 p-3 text-xs text-left text-surface-600 dark:text-surface-400 overflow-auto max-h-32">
              {this.state.error.message}
            </pre>
          )}

          <Button
            variant="primary"
            onClick={this.handleReset}
            icon={<RefreshCw className="h-4 w-4" />}
          >
            {ErrorBoundaryLabels.retry}
          </Button>
        </div>
      </div>
    );
  }
}
