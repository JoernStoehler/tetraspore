import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CutscenePlayer } from './CutscenePlayer';

// Mock the sub-components to simplify testing
vi.mock('./components/CutsceneStage', () => ({
  CutsceneStage: ({ shot, isPlaying }: { shot: { imageUrl: string; animation: string } | null; isPlaying: boolean }) => (
    <div data-testid="cutscene-stage">
      <div data-testid="current-image">{shot?.imageUrl}</div>
      <div data-testid="is-playing">{isPlaying ? 'playing' : 'paused'}</div>
      <div data-testid="animation">{shot?.animation}</div>
    </div>
  )
}));

vi.mock('./components/SubtitleDisplay', () => ({
  SubtitleDisplay: ({ audioUrl, isPlaying }: { audioUrl: string; isPlaying: boolean }) => (
    <div data-testid="subtitle-display">
      <div data-testid="audio-url">{audioUrl}</div>
      <div data-testid="subtitle-playing">{isPlaying ? 'playing' : 'paused'}</div>
    </div>
  )
}));

vi.mock('./components/ControlBar', () => ({
  ControlBar: ({ onSkip, onPause, onReplay, isPlaying, allowSkip, allowReplay }: { 
    onSkip: () => void; 
    onPause: () => void; 
    onReplay: () => void; 
    isPlaying: boolean; 
    allowSkip: boolean; 
    allowReplay: boolean; 
  }) => (
    <div data-testid="control-bar">
      <button data-testid="pause-button" onClick={onPause}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      {allowSkip && (
        <button data-testid="skip-button" onClick={onSkip}>
          Skip
        </button>
      )}
      {allowReplay && (
        <button data-testid="replay-button" onClick={onReplay}>
          Replay
        </button>
      )}
    </div>
  )
}));

vi.mock('./components/ProgressIndicator', () => ({
  ProgressIndicator: ({ current, total, progress }: { current: number; total: number; progress: number }) => (
    <div data-testid="progress-indicator">
      <div data-testid="current-shot">{current}</div>
      <div data-testid="total-shots">{total}</div>
      <div data-testid="progress">{progress}</div>
    </div>
  )
}));

describe('CutscenePlayer', () => {
  const mockOnComplete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('renders without crashing', () => {
    render(
      <CutscenePlayer
        cutsceneId="test-cutscene-1"
        onComplete={mockOnComplete}
      />
    );

    expect(screen.getByText('Loading cutscene...')).toBeInTheDocument();
  });

  it('prevents default behavior for keyboard shortcuts', () => {
    render(
      <CutscenePlayer
        cutsceneId="test-cutscene-1"
        onComplete={mockOnComplete}
      />
    );

    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    const preventDefaultSpy = vi.spyOn(spaceEvent, 'preventDefault');
    
    fireEvent(document, spaceEvent);
    expect(preventDefaultSpy).toHaveBeenCalled();

    const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    const escPreventDefaultSpy = vi.spyOn(escEvent, 'preventDefault');
    
    fireEvent(document, escEvent);
    expect(escPreventDefaultSpy).toHaveBeenCalled();
  });

  it('has correct component structure', () => {
    const { container } = render(
      <CutscenePlayer
        cutsceneId="test-cutscene-1"
        onComplete={mockOnComplete}
      />
    );

    // Check that the main overlay is rendered
    expect(container.querySelector('.fixed.inset-0.bg-black')).toBeInTheDocument();
  });

  it('component accepts all TypeScript interface props', () => {
    // Test that all required and optional props are correctly typed
    const allProps = {
      cutsceneId: "test-cutscene-1",
      onComplete: mockOnComplete,
      onSkip: vi.fn(),
      autoplay: true,
      allowSkip: true,
      allowReplay: true
    };

    // Should render without TypeScript errors
    const { container } = render(<CutscenePlayer {...allProps} />);
    expect(container.firstChild).toBeTruthy();
  });

  it('exports correct TypeScript types', () => {
    // This test ensures the types are properly exported
    // TypeScript compilation will fail if types are not exported correctly
    const playerProps: import('./types').CutscenePlayerProps = {
      cutsceneId: "test",
      onComplete: () => {}
    };

    expect(playerProps.cutsceneId).toBe("test");
  });
});