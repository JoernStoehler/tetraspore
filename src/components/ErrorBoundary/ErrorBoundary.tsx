import { Component, type ReactNode, type ErrorInfo } from 'react';
import { logError } from '../../utils/errors';

export interface ErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallback?: ReactNode;
  errorTitle?: string;
  errorMessage?: string;
  showRetry?: boolean;
  onRetry?: () => void;
  showSkip?: boolean;
  onSkip?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Generic error boundary component for protecting component trees from unhandled errors.
 * Provides consistent error UI and recovery options across the application.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorTitle = this.props.errorTitle || 'Component Error';
    logError(`${errorTitle} caught by boundary`, {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
    
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const {
        errorTitle = 'Something went wrong',
        errorMessage = 'An unexpected error occurred. Please try again.',
        showRetry = true,
        showSkip = false,
        onSkip
      } = this.props;

      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mx-4 my-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="text-red-400 text-2xl">⚠️</div>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-medium text-red-800">{errorTitle}</h3>
              <p className="mt-2 text-red-700">{errorMessage}</p>
              
              {this.state.error && (
                <details className="mt-4">
                  <summary className="text-sm text-red-600 cursor-pointer hover:text-red-800">
                    Technical Details
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              
              <div className="mt-4 flex gap-3">
                {showRetry && (
                  <button
                    onClick={this.handleRetry}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
                  >
                    Try Again
                  </button>
                )}
                
                {showSkip && onSkip && (
                  <button
                    onClick={onSkip}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    Skip
                  </button>
                )}
                
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors text-sm font-medium"
                >
                  Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}