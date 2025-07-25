import { type FC } from 'react';

interface ControlBarProps {
  onSkip: () => void;
  onPause: () => void;
  onReplay: () => void;
  isPlaying: boolean;
  allowSkip: boolean;
  allowReplay: boolean;
}

// Simple SVG icons
const PlayIcon: FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
  >
    <path d="M8 5v14l11-7z" />
  </svg>
);

const PauseIcon: FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
  >
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
  </svg>
);

const ReplayIcon: FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
  >
    <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z" />
  </svg>
);

const SkipIcon: FC = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-6 h-6"
  >
    <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
  </svg>
);

export const ControlBar: FC<ControlBarProps> = ({
  onSkip,
  onPause,
  onReplay,
  isPlaying,
  allowSkip,
  allowReplay
}) => {
  return (
    <div className="absolute bottom-10 right-10 flex gap-4 z-10">
      {/* Play/Pause Button */}
      <button
        onClick={onPause}
        className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-white hover:bg-opacity-30 transition-all duration-200 hover:scale-105"
        title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>

      {/* Replay Button */}
      {allowReplay && (
        <button
          onClick={onReplay}
          className="flex items-center justify-center w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-white hover:bg-opacity-30 transition-all duration-200 hover:scale-105"
          title="Replay (R)"
          aria-label="Replay cutscene"
        >
          <ReplayIcon />
        </button>
      )}

      {/* Skip Button */}
      {allowSkip && (
        <button
          onClick={onSkip}
          className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm rounded-full text-white hover:bg-opacity-30 transition-all duration-200 hover:scale-105"
          title="Skip (Esc)"
          aria-label="Skip cutscene"
        >
          <SkipIcon />
          <span className="text-sm font-medium hidden sm:inline">Skip</span>
        </button>
      )}
    </div>
  );
};