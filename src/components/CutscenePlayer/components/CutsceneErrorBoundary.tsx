import { Component, type ReactNode, type ErrorInfo } from 'react';

interface CutsceneErrorBoundaryProps {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  fallback?: ReactNode;
  onSkip: () => void;
}

interface CutsceneErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class CutsceneErrorBoundary extends Component<
  CutsceneErrorBoundaryProps,
  CutsceneErrorBoundaryState
> {
  constructor(props: CutsceneErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): CutsceneErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Cutscene error caught by boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center">
          <div className="text-center text-white max-w-md mx-4">
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-2xl font-bold mb-4">Cutscene Error</h2>
            <p className="text-lg mb-6 text-gray-300">
              Something went wrong while playing the cutscene.
            </p>
            <div className="text-sm text-gray-400 mb-6 font-mono bg-gray-800 p-3 rounded">
              {this.state.error?.message || 'Unknown error occurred'}
            </div>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={this.props.onSkip}
                className="px-6 py-3 bg-white text-black rounded hover:bg-gray-200 transition-colors"
              >
                Continue Game
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}