import { useState, useEffect, useRef, useCallback } from 'react';
import { type CutsceneDefinition, type PlayerState, type CutsceneShot } from '../CutscenePlayer';

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

interface UseCutscenePlayerProps {
  cutsceneId: string;
  autoplay?: boolean;
  onComplete: () => void;
}

interface UseCutscenePlayerReturn extends PlayerState {
  definition: CutsceneDefinition | null;
  currentShotData: CutsceneShot | null;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  skip: () => void;
  replay: () => void;
  nextShot: () => void;
  previousShot: () => void;
}

export const useCutscenePlayer = ({
  cutsceneId,
  autoplay = true,
  onComplete
}: UseCutscenePlayerProps): UseCutscenePlayerReturn => {
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

  const play = useCallback(() => {
    setIsPlaying(true);
  }, []);

  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const skip = useCallback(() => {
    onComplete();
  }, [onComplete]);

  const replay = useCallback(() => {
    setCurrentShot(0);
    setProgress(0);
    setIsPlaying(true);
  }, []);

  const nextShot = useCallback(() => {
    if (definition && currentShot < definition.shots.length - 1) {
      setCurrentShot(prev => prev + 1);
      setProgress(0);
    }
  }, [definition, currentShot]);

  const previousShot = useCallback(() => {
    if (currentShot > 0) {
      setCurrentShot(prev => prev - 1);
      setProgress(0);
    }
  }, [currentShot]);

  const currentShotData = definition?.shots[currentShot] || null;

  return {
    definition,
    currentShot,
    isPlaying,
    progress,
    isLoading,
    error,
    currentShotData,
    play,
    pause,
    toggle,
    skip,
    replay,
    nextShot,
    previousShot
  };
};