import { type FC, useState, useEffect, useRef } from 'react';

interface SubtitleDisplayProps {
  audioUrl: string;
  isPlaying: boolean;
}

// Mock subtitle data - in a real implementation, this would come from the backend
const mockSubtitles: Record<string, string> = {
  '/test-assets/narration-1.mp3': 'In the vast expanse of space, countless worlds await discovery.',
  '/test-assets/narration-2.mp3': 'Each planet holds secrets that could change the course of history.',
  '/test-assets/demo-1.mp3': 'This is a demonstration of the slow zoom animation effect.',
  '/test-assets/demo-2.mp3': 'Now we see the pan left animation in action.',
  '/test-assets/demo-3.mp3': 'The pan right animation creates movement across the screen.',
  '/test-assets/demo-4.mp3': 'Finally, the fade animation provides a gentle transition.'
};

const fetchSubtitleText = async (audioUrl: string): Promise<string> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100));
  return mockSubtitles[audioUrl] || '';
};

export const SubtitleDisplay: FC<SubtitleDisplayProps> = ({ audioUrl, isPlaying }) => {
  const [text, setText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Load subtitle text when audio URL changes
  useEffect(() => {
    let isMounted = true;
    
    const loadSubtitle = async () => {
      try {
        const subtitleText = await fetchSubtitleText(audioUrl);
        if (isMounted) {
          setText(subtitleText);
        }
      } catch (error) {
        console.error('Failed to load subtitle:', error);
        if (isMounted) {
          setText('');
        }
      }
    };

    loadSubtitle();

    return () => {
      isMounted = false;
    };
  }, [audioUrl]);

  // Handle audio play/pause
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(error => {
        console.error('Failed to play audio:', error);
      });
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // Show/hide subtitles based on audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsVisible(true);
    const handlePause = () => setIsVisible(false);
    const handleEnded = () => setIsVisible(false);
    const handleError = () => {
      console.error('Audio playback error');
      setIsVisible(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  // Reset audio when URL changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = 0;
      setIsVisible(false);
    }
  }, [audioUrl]);

  if (!text) {
    return (
      <>
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="auto"
        />
      </>
    );
  }

  return (
    <>
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="auto"
      />
      <div
        className={`absolute bottom-[10%] left-[10%] right-[10%] text-center transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="bg-black bg-opacity-80 rounded-lg p-5 backdrop-blur-sm">
          <p className="text-white text-lg leading-relaxed m-0 drop-shadow-lg sm:text-xl md:text-2xl">
            {text}
          </p>
        </div>
      </div>
    </>
  );
};