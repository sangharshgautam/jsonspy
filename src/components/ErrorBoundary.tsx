import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RefreshCw, Copy, Check, ShieldAlert } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  copied: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    copied: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null, copied: false };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo });
    console.error('[JSONSpy React ErrorBoundary Captured Error]:', error, errorInfo);

    // Send error stack trace back to Kotlin bridge if in JCEF environment
    try {
      if (typeof window !== 'undefined' && (window as any).cefQuery) {
        (window as any).cefQuery({
          request: JSON.stringify({
            action: 'log_error',
            message: error.message,
            stack: errorInfo.componentStack || error.stack || '',
          }),
        });
      }
    } catch (e) {
      // ignore bridge fallback
    }
  }

  private handleCopyLog = () => {
    const logData = `[JSONSpy Error Diagnostic Log]
Error: ${this.state.error?.message}
Stack:
${this.state.error?.stack}

Component Stack:
${this.state.errorInfo?.componentStack}
UserAgent: ${navigator.userAgent}
Time: ${new Date().toISOString()}`;

    navigator.clipboard.writeText(logData);
    this.setState({ copied: true });
    setTimeout(() => this.setState({ copied: false }), 2000);
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen w-screen bg-slate-950 text-slate-100 p-6 select-text font-sans z-50">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 flex flex-col space-y-4">
            {/* Header */}
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-800">
              <div className="p-2.5 bg-rose-950/80 border border-rose-800 rounded-lg text-rose-400">
                <AlertOctagon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-rose-400">JSONSpy Workspace Runtime Exception</h2>
                <p className="text-xs text-slate-400">An unexpected React component error was caught safely.</p>
              </div>
            </div>

            {/* Error Message */}
            <div className="bg-rose-950/40 border border-rose-900/60 rounded-lg p-3.5 text-xs text-rose-200 font-mono overflow-x-auto">
              <div className="font-semibold text-rose-400 mb-1 flex items-center">
                <ShieldAlert className="w-4 h-4 mr-1.5" />
                Error Message:
              </div>
              <div>{this.state.error?.message || 'Unknown Exception'}</div>
            </div>

            {/* Component Stack Details */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-300 max-h-48 overflow-y-auto space-y-2">
              <div className="text-slate-400 font-semibold font-sans">Component Trace:</div>
              <pre className="text-[11px] leading-relaxed text-slate-400 whitespace-pre-wrap">
                {this.state.errorInfo?.componentStack || this.state.error?.stack || 'No component stack available'}
              </pre>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2">
              <button
                onClick={this.handleCopyLog}
                className="flex items-center px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-medium transition"
              >
                {this.state.copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                    Diagnostic Log Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                    Copy Diagnostic Log
                  </>
                )}
              </button>

              <button
                onClick={this.handleReset}
                className="flex items-center px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white shadow-md transition"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                Reload Workspace
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
