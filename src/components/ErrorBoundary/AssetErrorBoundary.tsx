import { type ReactNode, type ErrorInfo } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { logError } from '../../utils/errors';

interface AssetErrorBoundaryProps {
  children: ReactNode;
  assetId?: string;
  onFallback?: () => void;
}

/**
 * Error boundary for asset generation and loading components.
 * Provides fallback options when assets cannot be loaded or generated.
 */
export const AssetErrorBoundary = ({ 
  children, 
  assetId,
  onFallback 
}: AssetErrorBoundaryProps) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    logError('Asset generation/loading error', {
      assetId,
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  };

  return (
    <ErrorBoundary
      onError={handleError}
      errorTitle="Asset Loading Error"
      errorMessage="Unable to load or generate required assets. The application will continue with fallback content."
      showRetry={true}
      showSkip={!!onFallback}
      onSkip={onFallback}
    >
      {children}
    </ErrorBoundary>
  );
};