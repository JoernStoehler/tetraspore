/**
 * UI State management for the Living River Ecosystem visualization.
 * Tracks user interactions, preferences, and view state independently from game state.
 */

export interface CameraState {
  position: { x: number; y: number; };
  zoom: number;
  rotation: number;           // For 3D-like effects
  followTarget?: string;      // Species ID to automatically follow
  
  // Smooth transitions
  isTransitioning: boolean;
  transitionStart: number;    // Timestamp
  transitionDuration: number; // Milliseconds
  targetPosition?: { x: number; y: number; };
  targetZoom?: number;
}

export interface SelectionState {
  selectedSpeciesId?: string;
  hoveredSpeciesId?: string;
  selectedStreamId?: string;
  
  // Multi-selection for comparisons
  comparisonSpeciesIds: string[];
  
  // Selection history for navigation
  selectionHistory: {
    speciesId: string;
    timestamp: number;
    position: { x: number; y: number; };
  }[];
}

export interface FilterState {
  // Species visibility filters
  showExtinct: boolean;
  showOnlyRecentTurns: boolean;
  maxTurnsVisible?: number;
  
  // Biome and characteristic filters
  visibleBiomes: Set<string>;
  visibleClimateTypes: Set<string>;
  minPopulationThreshold?: number;
  
  // Relationship filters
  showCompetitionLines: boolean;
  showSymbiosisLines: boolean;
  showPredationLines: boolean;
  
  // Visual complexity
  showParticleTrails: boolean;
  showEnvironmentalEffects: boolean;
  particleDensityMultiplier: number;  // 0.1 - 2.0
}

export interface UserPreferences {
  // Animation settings
  animationSpeed: number;         // 0.1 - 3.0 multiplier
  enableSoundEffects: boolean;
  masterVolume: number;           // 0.0 - 1.0
  
  // Color scheme preferences
  colorScheme: 'vibrant' | 'pastel' | 'monochrome' | 'neon' | 'natural';
  contrastLevel: 'low' | 'medium' | 'high';
  colorBlindFriendly: boolean;
  
  // Visual style preferences
  particleStyle: 'realistic' | 'abstract' | 'minimal' | 'magical';
  streamStyle: 'natural' | 'geometric' | 'artistic';
  backgroundStyle: 'gradient' | 'textured' | 'starfield' | 'plain';
  
  // Information display
  showSpeciesNames: boolean;
  showPopulationNumbers: boolean;
  showRelationshipTooltips: boolean;
  showTurnNumbers: boolean;
  
  // Performance preferences
  enableHighQualityRendering: boolean;
  maxParticlesPerSpecies: number; // Performance limit
  enableBloomEffects: boolean;
  enableMotionBlur: boolean;
}

export interface TimeNavigationState {
  // Current time view
  currentTurn: number;
  viewingMode: 'live' | 'historical' | 'time-lapse' | 'paused';
  
  // Time-lapse playback
  playbackSpeed: number;      // Turns per second
  isPlaying: boolean;
  playbackDirection: 'forward' | 'backward';
  
  // Time range selection
  timeRangeStart?: number;    // For focused viewing
  timeRangeEnd?: number;
  
  // Key moments bookmarks
  bookmarkedMoments: {
    turn: number;
    label: string;
    description: string;
    cameraPosition: { x: number; y: number; zoom: number; };
  }[];
}

export interface InteractionState {
  // Current interaction mode
  mode: 'explore' | 'select' | 'compare' | 'trace-lineage' | 'analyze-ecosystem';
  
  // Drag and pan state
  isDragging: boolean;
  dragStart?: { x: number; y: number; };
  
  // Hover information
  hoverInfo?: {
    speciesId: string;
    position: { x: number; y: number; };
    displayData: {
      name: string;
      population: number;
      traits: string[];
      relationships: string[];
    };
  };
  
  // Tool states
  measurementTool: {
    active: boolean;
    startPoint?: { x: number; y: number; };
    endPoint?: { x: number; y: number; };
  };
  
  searchState: {
    query: string;
    results: string[];  // Species IDs
    highlightedIndex: number;
  };
}

export interface AnalyticsState {
  // Performance metrics
  frameRate: number;
  particleCount: number;
  renderTime: number;
  
  // User behavior tracking (for UX improvements)
  sessionStartTime: number;
  totalInteractions: number;
  mostViewedSpecies: string[];
  averageZoomLevel: number;
  
  // Feature usage
  featureUsage: {
    [featureName: string]: {
      usageCount: number;
      lastUsed: number;
      averageSessionTime: number;
    };
  };
}

/**
 * Complete UI state for the TreeViewSonnet component
 */
export interface TreeViewSonnetUIState {
  // Core view state
  camera: CameraState;
  selection: SelectionState;
  filters: FilterState;
  userPreferences: UserPreferences;
  timeNavigation: TimeNavigationState;
  interaction: InteractionState;
  
  // Session and analytics
  analytics: AnalyticsState;
  
  // Last viewed state (persisted)
  lastViewedTurn?: number;
  lastCameraPosition?: { x: number; y: number; zoom: number; };
  
  // Error states
  errorState?: {
    hasError: boolean;
    errorMessage: string;
    errorCode: string;
    timestamp: number;
  };
  
  // Loading states
  loadingState: {
    isLoading: boolean;
    loadingProgress: number;    // 0-1
    loadingStage: string;       // "Calculating layout", "Rendering particles", etc.
  };
}