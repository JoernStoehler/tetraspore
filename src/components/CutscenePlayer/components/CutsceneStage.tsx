import { type FC, useState, useEffect } from 'react';
import { type CutsceneShot } from '../CutscenePlayer';

interface CutsceneStageProps {
  shot: CutsceneShot;
  isPlaying: boolean;
}

export const CutsceneStage: FC<CutsceneStageProps> = ({ shot, isPlaying }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageLoaded(false);
    setImageError(false);
  }, [shot.imageUrl]);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getAnimationClass = () => {
    if (!isPlaying || !imageLoaded) return '';
    
    // Ken Burns animations using CSS transforms for GPU acceleration
    // These animations are optimized for smooth 60fps performance
    switch (shot.animation) {
      case 'slow_zoom':
        return 'animate-slow-zoom';
      case 'pan_left':
        return 'animate-pan-left';
      case 'pan_right':
        return 'animate-pan-right';
      case 'fade':
        return 'animate-fade-cutscene';
      default:
        return '';
    }
  };

  if (imageError) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">=�</div>
          <p className="text-xl">Image not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white text-lg">Loading image...</div>
        </div>
      )}
      <img
        src={shot.imageUrl}
        alt="Cutscene frame"
        className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        } ${getAnimationClass()}`}
        style={{
          animationDuration: isPlaying ? `${shot.duration}s` : '0s',
          animationTimingFunction: 'ease-in-out',
          animationFillMode: 'forwards'
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
};