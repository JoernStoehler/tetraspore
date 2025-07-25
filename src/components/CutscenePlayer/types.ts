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