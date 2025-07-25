# Cutscene Player Component Specification

## Overview

The Cutscene Player is a React component that renders cutscenes as fullscreen overlays with synchronized images, animations, audio narration, and subtitles. It provides controls for skipping, pausing, and replaying.

## Component Architecture

```
CutscenePlayer (Container)
├── CutsceneOverlay (Fullscreen backdrop)
├── CutsceneStage (Image display with animations)
├── SubtitleDisplay (Text overlay)
├── AudioPlayer (Hidden audio element)
├── ControlBar (Skip, pause, replay controls)
└── ProgressIndicator (Visual progress)
```

## Component Interface

```typescript
interface CutscenePlayerProps {
  cutsceneId: string;
  onComplete: () => void;
  onSkip?: () => void;
  autoplay?: boolean;
  allowSkip?: boolean;
  allowReplay?: boolean;
}

interface CutsceneDefinition {
  id: string;
  shots: CutsceneShot[];
}

interface CutsceneShot {
  imageUrl: string;
  audioUrl: string;
  duration: number;
  animation: 'none' | 'slow_zoom' | 'pan_left' | 'pan_right' | 'fade';
  audioDuration: number;
}
```

## Core Component

```typescript
const CutscenePlayer: React.FC<CutscenePlayerProps> = ({
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
  
  // Load cutscene definition
  useEffect(() => {
    loadCutsceneDefinition(cutsceneId).then(setDefinition);
  }, [cutsceneId]);
  
  // Shot progression logic
  useEffect(() => {
    if (!isPlaying || !definition) return;
    
    const shot = definition.shots[currentShot];
    const timer = setTimeout(() => {
      if (currentShot < definition.shots.length - 1) {
        setCurrentShot(currentShot + 1);
      } else {
        onComplete();
      }
    }, shot.duration * 1000);
    
    return () => clearTimeout(timer);
  }, [currentShot, isPlaying, definition]);
  
  if (!definition) return <LoadingScreen />;
  
  return (
    <CutsceneOverlay>
      <CutsceneStage
        shot={definition.shots[currentShot]}
        isPlaying={isPlaying}
      />
      <SubtitleDisplay
        audioUrl={definition.shots[currentShot].audioUrl}
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
    </CutsceneOverlay>
  );
};
```

## Sub-Components

### CutsceneOverlay

```typescript
const CutsceneOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: black;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;
```

### CutsceneStage

Handles image display and animations:

```typescript
interface CutsceneStageProps {
  shot: CutsceneShot;
  isPlaying: boolean;
}

const CutsceneStage: React.FC<CutsceneStageProps> = ({ shot, isPlaying }) => {
  return (
    <StageContainer>
      <AnimatedImage
        src={shot.imageUrl}
        animation={shot.animation}
        duration={shot.duration}
        isPlaying={isPlaying}
      />
    </StageContainer>
  );
};

const AnimatedImage = styled.img<{ animation: string; duration: number; isPlaying: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: contain;
  animation: ${props => props.isPlaying ? animations[props.animation] : 'none'} 
            ${props => props.duration}s ease-in-out;
`;

const animations = {
  none: keyframes``,
  slow_zoom: keyframes`
    from { transform: scale(1); }
    to { transform: scale(1.1); }
  `,
  pan_left: keyframes`
    from { transform: translateX(0); }
    to { transform: translateX(-5%); }
  `,
  pan_right: keyframes`
    from { transform: translateX(0); }
    to { transform: translateX(5%); }
  `,
  fade: keyframes`
    0% { opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { opacity: 0; }
  `
};
```

### SubtitleDisplay

Shows synchronized subtitles:

```typescript
const SubtitleDisplay: React.FC<{ audioUrl: string }> = ({ audioUrl }) => {
  const [text, setText] = useState('');
  const audioRef = useRef<HTMLAudioElement>(null);
  
  useEffect(() => {
    // Extract subtitle from audio metadata or associated text file
    fetchSubtitleText(audioUrl).then(setText);
  }, [audioUrl]);
  
  return (
    <>
      <audio ref={audioRef} src={audioUrl} autoPlay />
      <SubtitleContainer>
        <SubtitleText>{text}</SubtitleText>
      </SubtitleContainer>
    </>
  );
};

const SubtitleContainer = styled.div`
  position: absolute;
  bottom: 10%;
  left: 10%;
  right: 10%;
  text-align: center;
  background: rgba(0, 0, 0, 0.8);
  padding: 20px;
  border-radius: 8px;
`;

const SubtitleText = styled.p`
  color: white;
  font-size: 1.2rem;
  line-height: 1.6;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
`;
```

### ControlBar

Player controls:

```typescript
const ControlBar: React.FC<ControlBarProps> = ({
  onSkip,
  onPause,
  onReplay,
  isPlaying,
  allowSkip,
  allowReplay
}) => {
  return (
    <Controls>
      <ControlButton onClick={onPause}>
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </ControlButton>
      
      {allowReplay && (
        <ControlButton onClick={onReplay}>
          <ReplayIcon />
        </ControlButton>
      )}
      
      {allowSkip && (
        <SkipButton onClick={onSkip}>
          Skip (Esc)
        </SkipButton>
      )}
    </Controls>
  );
};

const Controls = styled.div`
  position: absolute;
  bottom: 40px;
  right: 40px;
  display: flex;
  gap: 16px;
`;
```

### ProgressIndicator

Visual progress through cutscene:

```typescript
const ProgressIndicator: React.FC<ProgressProps> = ({ current, total, progress }) => {
  return (
    <ProgressContainer>
      <ProgressBar style={{ width: `${(current / total) * 100}%` }} />
      <ProgressDots>
        {Array.from({ length: total }).map((_, i) => (
          <Dot key={i} active={i <= current} />
        ))}
      </ProgressDots>
    </ProgressContainer>
  );
};
```

## Animations

Using Framer Motion for advanced animations:

```typescript
import { motion, AnimatePresence } from 'framer-motion';

const AdvancedCutsceneStage: React.FC<CutsceneStageProps> = ({ shot }) => {
  const animationVariants = {
    slow_zoom: {
      initial: { scale: 1 },
      animate: { scale: 1.1 },
      transition: { duration: shot.duration, ease: 'easeInOut' }
    },
    pan_left: {
      initial: { x: 0 },
      animate: { x: '-5%' },
      transition: { duration: shot.duration, ease: 'easeInOut' }
    }
    // ... other animations
  };
  
  return (
    <AnimatePresence mode="wait">
      <motion.img
        key={shot.imageUrl}
        src={shot.imageUrl}
        variants={animationVariants[shot.animation]}
        initial="initial"
        animate="animate"
        exit={{ opacity: 0 }}
      />
    </AnimatePresence>
  );
};
```

## Accessibility

1. **Keyboard Controls**:
   - `Space`: Pause/Resume
   - `Escape`: Skip
   - `R`: Replay
   - `→`: Next shot (when paused)
   - `←`: Previous shot (when paused)

2. **Screen Reader Support**:
   - Announce cutscene start/end
   - Read subtitles aloud
   - Describe scene changes

3. **Visual Accessibility**:
   - High contrast subtitle text
   - Adjustable subtitle size (via settings)
   - Option to disable animations

## Mobile Responsiveness

```typescript
const MobileOptimizedStage = styled.div`
  @media (max-width: 768px) {
    .subtitle-text {
      font-size: 1rem;
      padding: 12px;
    }
    
    .controls {
      bottom: 20px;
      right: 20px;
      scale: 0.9;
    }
  }
  
  @media (orientation: landscape) and (max-height: 500px) {
    .subtitle-container {
      bottom: 5%;
    }
  }
`;
```

## Storybook Stories

```typescript
// CutscenePlayer.stories.tsx
export default {
  title: 'Components/CutscenePlayer',
  component: CutscenePlayer,
};

export const BasicCutscene = {
  args: {
    cutsceneId: 'test-cutscene-1',
    onComplete: () => console.log('Cutscene completed'),
  }
};

export const NoSkipAllowed = {
  args: {
    ...BasicCutscene.args,
    allowSkip: false,
  }
};

export const AllAnimationTypes = {
  args: {
    cutsceneId: 'animation-showcase',
  }
};

export const MobileView = {
  parameters: {
    viewport: {
      defaultViewport: 'iphone12',
    },
  },
};

// Test data
const mockCutscenes = {
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
  }
};
```

## Testing Strategy

### Unit Tests
```typescript
describe('CutscenePlayer', () => {
  it('should advance to next shot after duration', () => {
    jest.useFakeTimers();
    const onComplete = jest.fn();
    
    render(<CutscenePlayer cutsceneId="test" onComplete={onComplete} />);
    
    act(() => {
      jest.advanceTimersByTime(5000);
    });
    
    expect(screen.getByTestId('current-shot')).toBe('1');
  });
  
  it('should pause audio when paused', () => {
    // Test pause functionality
  });
  
  it('should skip to end when skip pressed', () => {
    // Test skip functionality
  });
});
```

### Visual Regression Tests
- Capture screenshots at key moments
- Test all animation types
- Verify mobile layouts
- Check subtitle rendering

## Performance Considerations

1. **Image Preloading**: Load next shot's image while current plays
2. **Audio Buffering**: Ensure smooth playback
3. **Memory Management**: Cleanup previous shots
4. **Animation Performance**: Use GPU-accelerated transforms

```typescript
const useImagePreloader = (shots: CutsceneShot[], currentIndex: number) => {
  useEffect(() => {
    if (currentIndex < shots.length - 1) {
      const img = new Image();
      img.src = shots[currentIndex + 1].imageUrl;
    }
  }, [currentIndex, shots]);
};
```

## Error Handling

```typescript
const CutscenePlayerWithErrorBoundary: React.FC<CutscenePlayerProps> = (props) => {
  return (
    <ErrorBoundary
      fallback={<CutsceneErrorFallback onSkip={props.onComplete} />}
      onError={(error) => console.error('Cutscene error:', error)}
    >
      <CutscenePlayer {...props} />
    </ErrorBoundary>
  );
};

const CutsceneErrorFallback: React.FC<{ onSkip: () => void }> = ({ onSkip }) => {
  return (
    <ErrorContainer>
      <p>Unable to load cutscene</p>
      <button onClick={onSkip}>Continue</button>
    </ErrorContainer>
  );
};
```

## Future Enhancements

1. **Branching Cutscenes**: Support for player choices mid-cutscene
2. **3D Scenes**: WebGL integration for 3D cutscenes
3. **Particle Effects**: Environmental effects overlay
4. **Dynamic Subtitles**: Word-by-word highlighting synced to audio
5. **Cutscene Editor**: Visual tool for creating cutscenes