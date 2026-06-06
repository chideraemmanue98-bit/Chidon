import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, ChevronRight } from 'lucide-react';
import { ChidonIqLogo } from './ChidonIqLogo';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to our systems
    console.error("🔒 [SECURE SHIELD] Caught uncaught client-side exception:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    // Gracefully clear persistent state that might be causing a render crash
    try {
      localStorage.removeItem('active_language');
      sessionStorage.clear();
    } catch (e) {
      console.error(e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0d0f14] flex flex-col items-center justify-center p-6 text-white font-sans text-sm select-none">
          {/* Outer glow effect */}
          <div className="absolute inset-0 bg-radial-gradient from-red-950/10 via-transparent to-transparent pointer-events-none" />

          <div className="w-full max-w-lg bg-[#141822] border border-[#d97706]/20 rounded-2xl p-8 relative overflow-hidden shadow-2xl">
            {/* Top orange gradient bar */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-amber-500 via-orange-600 to-amber-700" />

            <div className="flex flex-col items-center text-center space-y-6">
              {/* Animated Icon badge */}
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500/15 blur-lg rounded-full animate-pulse" />
                <div className="w-16 h-16 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-center text-amber-500 relative z-10">
                  <AlertTriangle size={32} />
                </div>
              </div>

              {/* Title & Badge */}
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] uppercase tracking-widest font-mono font-bold">
                  <span>SANDBOX SECURE TERMINAL</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-100">
                  Platform Core Halted
                </h1>
                <p className="text-xs text-neutral-400 font-mono max-w-sm">
                  CHIDON IQ intercepted an active runtime exception to protect your session vault from silent memory leaks.
                </p>
              </div>

              {/* Error details inside military styled terminal frame */}
              <div className="w-full text-left bg-[#090b0e] border border-neutral-850 p-4 rounded-xl space-y-3 font-mono text-xs text-neutral-300">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-[10px] text-neutral-500 tracking-wider font-bold">SYSTEM_DIAG_REPORT</span>
                </div>
                <div className="overflow-x-auto select-text font-medium text-amber-200/90 max-h-36 whitespace-pre-wrap leading-relaxed">
                  {this.state.error?.toString() || 'Unknown UI Module Resolution failure'}
                </div>
                {this.state.errorInfo?.componentStack && (
                  <details className="cursor-pointer group">
                    <summary className="text-[10px] text-neutral-500 hover:text-neutral-300 transition-colors uppercase tracking-widest font-bold flex items-center gap-1">
                      <ChevronRight size={10} className="transform group-open:rotate-90 transition-transform" />
                      View Trace Stack
                    </summary>
                    <pre className="mt-2 text-[10px] leading-tight text-neutral-500 font-normal overflow-auto max-h-32 p-2 bg-[#050608] rounded-md border border-white/5 max-w-md">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>

              {/* Action Grid */}
              <div className="w-full pt-2">
                <button
                  type="button"
                  id="err-boundary-reload-btn"
                  onClick={this.handleReset}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 font-semibold tracking-wide text-xs uppercase text-white shadow-xl hover:shadow-orange-700/15 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <RefreshCw size={14} className="animate-spin" style={{ animationDuration: '4s' }} />
                  Restore System Operation
                </button>
              </div>

              <div className="flex items-center gap-1.5 pt-2 text-[10px] text-neutral-500 font-mono">
                <ChidonIqLogo size={14} cropped />
                <span>CHIDON IQ NEURAL SHIELD SYSTEM</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
