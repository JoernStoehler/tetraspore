import { type FC, useState, useEffect, useCallback, useRef } from 'react';
import { CutsceneStage } from './components/CutsceneStage';
import { SubtitleDisplay } from './components/SubtitleDisplay';
import { ControlBar } from './components/ControlBar';
import { ProgressIndicator } from './components/ProgressIndicator';
import { CutsceneErrorBoundary } from './components/CutsceneErrorBoundary';

export interface CutscenePlayerProps {
  cutsceneId: string;
  onComplete: () => void;
  onSkip?: () => void;
  autoplay?: boolean;
  allowSkip?: boolean;
  allowReplay?: boolean;
}

export interface CutsceneDefinition {
  id: string;
  shots: CutsceneShot[];
}

export interface CutsceneShot {
  imageUrl: string;
  audioUrl: string;
  duration: number;
  animation: 'none' | 'slow_zoom' | 'pan_left' | 'pan_right' | 'fade';
  audioDuration: number;
}

export interface PlayerState {
  isPlaying: boolean;
  currentShot: number;
  progress: number;
  isLoading: boolean;
  error: Error | null;
}

// Mock cutscene data for development
const mockCutscenes: Record<string, CutsceneDefinition> = {
  'test-cutscene-1': {
    id: 'test-cutscene-1',
    shots: [
      {
        imageUrl: '/test-assets/planet-1.jpg',
        audioUrl: '/test-assets/narration-1.mp3',
        duration: 5,
        animation: 'slow_zoom',
        audioDuration: 4.5
      },
      {
        imageUrl: '/test-assets/planet-2.jpg',
        audioUrl: '/test-assets/narration-2.mp3',
        duration: 6,
        animation: 'pan_right',
        audioDuration: 5.8
      }
    ]
  },
  'animation-showcase': {
    id: 'animation-showcase',
    shots: [
      {
        imageUrl: '/test-assets/demo-1.jpg',
        audioUrl: '/test-assets/demo-1.mp3',
        duration: 4,
        animation: 'slow_zoom',
        audioDuration: 3.5
      },
      {
        imageUrl: '/test-assets/demo-2.jpg',
        audioUrl: '/test-assets/demo-2.mp3',
        duration: 4,
        animation: 'pan_left',
        audioDuration: 3.8
      },
      {
        imageUrl: '/test-assets/demo-3.jpg',
        audioUrl: '/test-assets/demo-3.mp3',
        duration: 4,
        animation: 'pan_right',
        audioDuration: 3.2
      },
      {
        imageUrl: '/test-assets/demo-4.jpg',
        audioUrl: '/test-assets/demo-4.mp3',
        duration: 5,
        animation: 'fade',
        audioDuration: 4.7
      }
    ]
  }
};

const loadCutsceneDefinition = async (cutsceneId: string): Promise<CutsceneDefinition> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const definition = mockCutscenes[cutsceneId];
  if (!definition) {
    throw new Error(`Cutscene not found: ${cutsceneId}`);
  }
  
  return definition;
};

export const CutscenePlayer: FC<CutscenePlayerProps> = ({
  cutsceneId,
  onComplete,
  onSkip,
  autoplay = true,
  allowSkip = true,
  allowReplay = true
}) => {
  const [definition, setDefinition] = useState<CutsceneDefinition | null>(null);
  const [currentShot, setCurrentShot] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Load cutscene definition
  useEffect(() => {
    let isMounted = true;
    
    const loadCutscene = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const def = await loadCutsceneDefinition(cutsceneId);
        if (isMounted) {
          setDefinition(def);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to load cutscene'));
          setIsLoading(false);
        }
      }
    };

    loadCutscene();

    return () => {
      isMounted = false;
    };
  }, [cutsceneId]);

  // Shot progression logic
  useEffect(() => {
    if (!isPlaying || !definition || isLoading) return;

    const shot = definition.shots[currentShot];
    if (!shot) return;

    startTimeRef.current = Date.now();
    
    // Progress tracking
    progressIntervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const shotProgress = Math.min(elapsed / shot.duration, 1);
        setProgress(shotProgress);
      }
    }, 100);

    // Shot timer
    timerRef.current = setTimeout(() => {
      if (currentShot < definition.shots.length - 1) {
        setCurrentShot(prev => prev + 1);
        setProgress(0);
      } else {
        onComplete();
      }
    }, shot.duration * 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [currentShot, isPlaying, definition, onComplete, isLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const handlePause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handleSkip = useCallback(() => {
    if (onSkip) {
      onSkip();
    } else {
      onComplete();
    }
  }, [onSkip, onComplete]);

  const handleReplay = useCallback(() => {
    setCurrentShot(0);
    setProgress(0);
    setIsPlaying(true);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case ' ':
          event.preventDefault();
          handlePause();
          break;
        case 'Escape':
          event.preventDefault();
          if (allowSkip) {
            handleSkip();
          }
          break;
        case 'r':
        case 'R':
          event.preventDefault();
          if (allowReplay) {
            handleReplay();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [allowSkip, allowReplay, handlePause, handleSkip, handleReplay]);

  // Preload next shot's image for smoother transitions
  useEffect(() => {
    if (definition && currentShot < definition.shots.length - 1) {
      const nextShot = definition.shots[currentShot + 1];
      const img = new Image();
      img.src = nextShot.imageUrl;
    }
  }, [definition, currentShot]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center" role="status" aria-label="Loading cutscene">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
          <div className="text-white text-xl">Loading cutscene...</div>
          <div className="text-gray-400 text-sm mt-2">Preparing assets...</div>
        </div>
      </div>
    );
  }

  if (error || !definition) {
    return (
      <div className="fixed inset-0 bg-black z-[9999] flex items-center justify-center">
        <div className="text-center text-white">
          <p className="text-xl mb-4">Unable to load cutscene</p>
          <button
            onClick={onComplete}
            className="px-6 py-3 bg-white text-black rounded hover:bg-gray-200 transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  const currentShotData = definition.shots[currentShot];

  return (
    <div className="fixed inset-0 bg-black z-[9999] flex flex-col items-center justify-center">
      <CutsceneStage
        shot={currentShotData}
        isPlaying={isPlaying}
      />
      
      <SubtitleDisplay
        audioUrl={currentShotData.audioUrl}
        isPlaying={isPlaying}
      />
      
      <ControlBar
        onSkip={handleSkip}
        onPause={handlePause}
        onReplay={handleReplay}
        isPlaying={isPlaying}
        allowSkip={allowSkip}
        allowReplay={allowReplay}
      />
      
      <ProgressIndicator
        current={currentShot}
        total={definition.shots.length}
        progress={progress}
      />
    </div>
  );
};

// Enhanced component with error boundary
export const CutscenePlayerWithErrorBoundary: FC<CutscenePlayerProps> = (props) => {
  return (
    <CutsceneErrorBoundary
      onSkip={props.onComplete}
      onError={(error, errorInfo) => {
        console.error('Cutscene player error:', error, errorInfo);
        // Could send to error reporting service here
      }}
    >
      <CutscenePlayer {...props} />
    </CutsceneErrorBoundary>
  );
};