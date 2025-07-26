import { type ReactNode, type ErrorInfo } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { logError } from '../../utils/errors';

interface GlobalErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Application-level error boundary that catches all unhandled React errors.
 * Should wrap the entire application to provide a last line of defense.
 */
export const GlobalErrorBoundary = ({ children }: GlobalErrorBoundaryProps) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    // In production, this would integrate with error monitoring service
    logError('Global application error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    });
    
    // TODO: Send to error monitoring service (Sentry, LogRocket, etc.)
  };

  return (
    <ErrorBoundary
      onError={handleError}
      errorTitle="Application Error"
      errorMessage="The application encountered an unexpected error. Please reload the page to continue."
      showRetry={false}
      showSkip={false}
    >
      {children}
    </ErrorBoundary>
  );
};