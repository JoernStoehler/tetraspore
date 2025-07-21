/**
 * Timeline control for navigating through evolutionary history
 */

import React from 'react';

interface TimelineControlProps {
  currentTurn: number;
  maxTurn: number;
  isPlaying: boolean;
  playbackSpeed: number;
  onTurnChange: (turn: number) => void;
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
}

export const TimelineControl: React.FC<TimelineControlProps> = ({
  currentTurn,
  maxTurn,
  isPlaying,
  playbackSpeed,
  onTurnChange,
  onPlayPause,
  onSpeedChange
}) => {
  return (
    <div className="timeline-control">
      <div className="timeline-header">
        <span className="timeline-label">Era {Math.floor(currentTurn / 10)}</span>
        <span className="timeline-turn">Turn {currentTurn}</span>
      </div>
      
      <div className="timeline-slider-container">
        <input
          type="range"
          className="timeline-slider"
          min={0}
          max={maxTurn}
          value={currentTurn}
          onChange={(e) => onTurnChange(parseInt(e.target.value))}
        />
        <div className="timeline-markers">
          {Array.from({ length: Math.min(10, maxTurn + 1) }, (_, i) => {
            const turn = Math.floor(i * maxTurn / 9);
            return (
              <div
                key={i}
                className="timeline-marker"
                style={{ left: `${(turn / maxTurn) * 100}%` }}
              >
                <div className="marker-line" />
                <div className="marker-label">{turn}</div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="timeline-controls">
        <button
          className="timeline-btn"
          onClick={onPlayPause}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        
        <div className="speed-control">
          <label>Speed:</label>
          <select
            value={playbackSpeed}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={5}>5x</option>
          </select>
        </div>
        
        <div className="timeline-shortcuts">
          <button
            className="timeline-btn small"
            onClick={() => onTurnChange(0)}
            title="Go to beginning"
          >
            ⏮
          </button>
          <button
            className="timeline-btn small"
            onClick={() => onTurnChange(Math.max(0, currentTurn - 1))}
            title="Previous turn"
          >
            ⏪
          </button>
          <button
            className="timeline-btn small"
            onClick={() => onTurnChange(Math.min(maxTurn, currentTurn + 1))}
            title="Next turn"
          >
            ⏩
          </button>
          <button
            className="timeline-btn small"
            onClick={() => onTurnChange(maxTurn)}
            title="Go to end"
          >
            ⏭
          </button>
        </div>
      </div>
    </div>
  );
};