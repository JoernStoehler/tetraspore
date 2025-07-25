import { type FC } from 'react';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  progress: number;
}

export const ProgressIndicator: FC<ProgressIndicatorProps> = ({
  current,
  total,
  progress
}) => {
  const overallProgress = ((current + progress) / total) * 100;

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-64 max-w-[80vw]">
      {/* Progress Bar */}
      <div className="mb-3">
        <div className="w-full bg-white bg-opacity-20 rounded-full h-1 backdrop-blur-sm">
          <div
            className="bg-white h-1 rounded-full transition-all duration-100 ease-out"
            style={{ width: `${Math.min(overallProgress, 100)}%` }}
          />
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: total }).map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index < current
                ? 'bg-white' // Completed shots
                : index === current
                ? 'bg-white bg-opacity-70' // Current shot
                : 'bg-white bg-opacity-30' // Future shots
            }`}
            aria-label={`Shot ${index + 1} of ${total}${
              index < current
                ? ' (completed)'
                : index === current
                ? ' (current)'
                : ' (upcoming)'
            }`}
          />
        ))}
      </div>

      {/* Shot Counter */}
      <div className="text-center mt-2">
        <span className="text-white text-sm font-medium opacity-80">
          {current + 1} / {total}
        </span>
      </div>
    </div>
  );
};