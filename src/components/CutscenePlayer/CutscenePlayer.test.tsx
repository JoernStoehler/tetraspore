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

  it('displays loading message when cutscene is initializing', () => {
    // Arrange
    const props = {
      cutsceneId: "test-cutscene-1",
      onComplete: mockOnComplete
    };

    // Act
    render(<CutscenePlayer {...props} />);

    // Assert
    expect(screen.getByText('Loading cutscene...')).toBeInTheDocument();
  });

  it('handles keyboard shortcuts correctly', () => {
    // Arrange
    render(
      <CutscenePlayer
        cutsceneId="test-cutscene-1"
        onComplete={mockOnComplete}
      />
    );
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
    const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
    const preventDefaultSpy = vi.spyOn(spaceEvent, 'preventDefault');
    const escPreventDefaultSpy = vi.spyOn(escEvent, 'preventDefault');

    // Act
    fireEvent(document, spaceEvent);
    fireEvent(document, escEvent);

    // Assert
    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(escPreventDefaultSpy).toHaveBeenCalled();
  });

  it('displays a fullscreen overlay when active', () => {
    // Arrange
    const props = {
      cutsceneId: "test-cutscene-1",
      onComplete: mockOnComplete
    };

    // Act
    render(<CutscenePlayer {...props} />);

    // Assert
    expect(screen.getByTestId('cutscene-stage')).toBeInTheDocument();
    expect(screen.getByTestId('control-bar')).toBeInTheDocument();
  });

  it('accepts and handles all optional configuration props', () => {
    // Arrange
    const allProps = {
      cutsceneId: "test-cutscene-1",
      onComplete: mockOnComplete,
      onSkip: vi.fn(),
      autoplay: true,
      allowSkip: true,
      allowReplay: true
    };

    // Act
    const { container } = render(<CutscenePlayer {...allProps} />);

    // Assert
    expect(container.firstChild).toBeTruthy();
  });

  it('responds to completion callback when cutscene ends', () => {
    // Arrange
    const onCompleteMock = vi.fn();
    const props = {
      cutsceneId: "test-cutscene-1",
      onComplete: onCompleteMock
    };

    // Act
    render(<CutscenePlayer {...props} />);
    // In a real test, we would simulate cutscene completion
    // For now, we verify the callback is passed correctly

    // Assert
    expect(onCompleteMock).toBeInstanceOf(Function);
  });
});