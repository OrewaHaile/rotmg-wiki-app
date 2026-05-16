import { Component, ErrorInfo, ReactNode } from "react";
import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  reloadPage = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const message = this.state.error?.message || String(this.state.error) || "Unknown error";

      return (
        <div className="min-h-screen bg-stone-950 text-stone-100 px-4 py-10">
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-amber-900/60 bg-stone-900/80 p-8 shadow-xl shadow-black/30">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-amber-500/10 p-3 text-amber-300">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-amber-400">RotMG Wiki</p>
                <h1 className="mt-2 text-4xl font-black text-amber-100">Something went wrong</h1>
              </div>
            </div>

            <p className="mt-6 text-stone-300">
              The page failed to load correctly. You can try reloading or return to the home page.
            </p>

            <details className="mt-6 rounded-2xl border border-stone-800 bg-stone-950/70 p-4 text-sm text-stone-300">
              <summary className="cursor-pointer font-semibold text-amber-200">Error details</summary>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap text-sm leading-relaxed">{message}</pre>
            </details>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/">
                <button className="rounded-full border border-amber-700 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/20">
                  Back to Home
                </button>
              </Link>
              <button
                type="button"
                onClick={this.reloadPage}
                className="rounded-full border border-stone-700 bg-stone-900/80 px-4 py-2 text-sm font-semibold text-stone-100 transition hover:border-amber-700 hover:text-amber-200"
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
