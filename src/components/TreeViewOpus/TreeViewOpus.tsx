/**
 * Living Tapestry - A unique Tree of Life visualization
 * 
 * Evolution represented as an organic tapestry where species are threads
 * that weave through time, creating a living fabric of interconnected life.
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { TapestrySpecies, TapestryThread, TapestryUIState } from './types';
import { generateThreadPaths } from './utils/threadGenerator';
import { TapestryRenderer } from './components/TapestryRenderer';
import { TimelineControl } from './components/TimelineControl';
import { ThreadDetails } from './components/ThreadDetails';
import { EnvironmentLayer } from './components/EnvironmentLayer';
import './styles/tapestry.css';

export interface TreeViewOpusProps {
  species: TapestrySpecies[];
  width?: number;
  height?: number;
  currentTurn?: number;
  onSpeciesSelect?: (species: TapestrySpecies) => void;
}

const defaultUIState: TapestryUIState = {
  viewMode: 'overview',
  camera: {
    zoom: 1,
    centerX: 0,
    centerY: 0,
    rotation: 0,
    perspective: 'front'
  },
  timeDisplay: {
    currentTurn: 0,
    playbackSpeed: 1,
    isPlaying: false,
    showFuture: false,
    timelineMode: 'linear'
  },
  selection: {
    comparisonSpeciesIds: []
  },
  visuals: {
    threadStyle: 'watercolor',
    backgroundColor: 'cosmos',
    glowIntensity: 0.7,
    particleDensity: 0.5,
    motionBlur: true,
    depthOfField: true
  },
  layers: {
    showExtinct: true,
    showRelationships: true,
    showPressure: false,
    showHabitats: true,
    showTimeline: true,
    showLegend: false
  },
  interactionMode: 'explore',
  analysis: {},
  animations: {
    pendingHighlights: [],
    cameraTransitions: [],
    activeEffects: new Map()
  },
  preferences: {
    autoFollowNew: true,
    soundEnabled: true,
    reducedMotion: false,
    tooltipDetail: 'normal',
    language: 'en'
  },
  performance: {
    quality: 'high',
    maxThreadsVisible: 200,
    enableShadows: true,
    enableReflections: true,
    antialiasing: true
  }
};

export const TreeViewOpus: React.FC<TreeViewOpusProps> = ({
  species,
  width = 1600,
  height = 900,
  currentTurn = 0,
  onSpeciesSelect
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [uiState, setUIState] = useState<TapestryUIState>(defaultUIState);
  const [hoveredThread, setHoveredThread] = useState<string | null>(null);
  
  // Generate thread paths from species data
  const threads = useMemo(() => {
    return generateThreadPaths(species, currentTurn, uiState);
  }, [species, currentTurn, uiState.timeDisplay.currentTurn]);
  
  // Handle time controls
  useEffect(() => {
    if (uiState.timeDisplay.isPlaying) {
      const interval = setInterval(() => {
        setUIState(prev => ({
          ...prev,
          timeDisplay: {
            ...prev.timeDisplay,
            currentTurn: Math.min(
              prev.timeDisplay.currentTurn + 1,
              currentTurn
            )
          }
        }));
      }, 1000 / uiState.timeDisplay.playbackSpeed);
      
      return () => clearInterval(interval);
    }
  }, [uiState.timeDisplay.isPlaying, uiState.timeDisplay.playbackSpeed, currentTurn]);
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          setUIState(prev => ({
            ...prev,
            timeDisplay: {
              ...prev.timeDisplay,
              isPlaying: !prev.timeDisplay.isPlaying
            }
          }));
          break;
        case 'r':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setUIState(prev => ({
              ...prev,
              camera: {
                zoom: 1,
                centerX: 0,
                centerY: 0,
                rotation: 0,
                perspective: 'front'
              }
            }));
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  const handleThreadClick = (threadId: string) => {
    const thread = threads.find(t => t.id === threadId);
    if (thread && onSpeciesSelect) {
      onSpeciesSelect(thread.species);
    }
    
    setUIState(prev => ({
      ...prev,
      selection: {
        ...prev.selection,
        selectedSpeciesId: threadId
      }
    }));
  };
  
  const handleTimeChange = (turn: number) => {
    setUIState(prev => ({
      ...prev,
      timeDisplay: {
        ...prev.timeDisplay,
        currentTurn: turn
      }
    }));
  };
  
  return (
    <div 
      ref={containerRef}
      className="tapestry-container"
      style={{ width, height }}
    >
      {/* Environment background layer */}
      <EnvironmentLayer
        width={width}
        height={height}
        uiState={uiState}
        currentTurn={uiState.timeDisplay.currentTurn}
      />
      
      {/* Main tapestry renderer */}
      <TapestryRenderer
        threads={threads}
        width={width}
        height={height}
        uiState={uiState}
        onThreadClick={handleThreadClick}
        onThreadHover={setHoveredThread}
      />
      
      {/* UI Controls */}
      <div className="tapestry-controls">
        <TimelineControl
          currentTurn={uiState.timeDisplay.currentTurn}
          maxTurn={currentTurn}
          isPlaying={uiState.timeDisplay.isPlaying}
          playbackSpeed={uiState.timeDisplay.playbackSpeed}
          onTurnChange={handleTimeChange}
          onPlayPause={() => setUIState(prev => ({
            ...prev,
            timeDisplay: {
              ...prev.timeDisplay,
              isPlaying: !prev.timeDisplay.isPlaying
            }
          }))}
          onSpeedChange={(speed) => setUIState(prev => ({
            ...prev,
            timeDisplay: {
              ...prev.timeDisplay,
              playbackSpeed: speed
            }
          }))}
        />
        
        {/* View mode selector */}
        <div className="view-modes">
          {(['overview', 'focused', 'timeline', 'cross-section'] as const).map(mode => (
            <button
              key={mode}
              className={`view-mode-btn ${uiState.viewMode === mode ? 'active' : ''}`}
              onClick={() => setUIState(prev => ({ ...prev, viewMode: mode }))}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
        
        {/* Visual style selector */}
        <div className="visual-styles">
          <select 
            value={uiState.visuals.threadStyle}
            onChange={(e) => setUIState(prev => ({
              ...prev,
              visuals: {
                ...prev.visuals,
                threadStyle: e.target.value as any
              }
            }))}
          >
            <option value="realistic">Realistic</option>
            <option value="abstract">Abstract</option>
            <option value="neon">Neon</option>
            <option value="watercolor">Watercolor</option>
            <option value="sketch">Sketch</option>
          </select>
        </div>
      </div>
      
      {/* Thread details panel */}
      {(uiState.selection.selectedSpeciesId || hoveredThread) && (
        <ThreadDetails
          thread={threads.find(t => 
            t.id === (hoveredThread || uiState.selection.selectedSpeciesId)
          )}
          uiState={uiState}
        />
      )}
      
      {/* Performance info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="performance-info">
          Threads: {threads.filter(t => t.isVisible).length}/{threads.length} | 
          FPS: {60} | 
          Quality: {uiState.performance.quality}
        </div>
      )}
    </div>
  );
};