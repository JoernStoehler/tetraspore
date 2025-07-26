import { type ReactNode, type ErrorInfo } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { logError } from '../../utils/errors';

interface ActionErrorBoundaryProps {
  children: ReactNode;
  actionId?: string;
  onSkip?: () => void;
}

/**
 * Error boundary for action processing components.
 * Provides specific recovery options for action-related errors.
 */
export const ActionErrorBoundary = ({ 
  children, 
  actionId,
  onSkip 
}: ActionErrorBoundaryProps) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    logError('Action processing error', {
      actionId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  };

  return (
    <ErrorBoundary
      onError={handleError}
      errorTitle="Action Processing Error"
      errorMessage="There was a problem processing this action. You can retry or skip to continue."
      showRetry={true}
      showSkip={!!onSkip}
      onSkip={onSkip}
    >
      {children}
    </ErrorBoundary>
  );
};