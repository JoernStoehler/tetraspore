/**
 * UI State for the Living Tapestry visualization
 * 
 * Tracks user interactions, view preferences, and animation states
 * that are not derived from game state.
 */

export interface TapestryUIState {
  // Camera and view
  viewMode: 'overview' | 'focused' | 'timeline' | 'cross-section';
  camera: {
    zoom: number;           // 0.1 - 10, current zoom level
    centerX: number;        // Horizontal pan
    centerY: number;        // Vertical pan  
    rotation: number;       // 0-360, for 3D tapestry rotation
    perspective: 'front' | 'side' | 'top' | 'isometric';
  };

  // Time controls
  timeDisplay: {
    currentTurn: number;          // Currently displayed turn
    playbackSpeed: number;        // 0.1-5x animation speed
    isPlaying: boolean;           // Auto-advance through time
    showFuture: boolean;          // Ghost threads for predictions
    timelineMode: 'linear' | 'compressed' | 'geological';
  };

  // Selection and focus
  selection: {
    selectedSpeciesId?: string;
    selectedLineage?: string[];  // All ancestors/descendants
    comparisonSpeciesIds: string[];  // For comparing multiple species
    hoveredSpeciesId?: string;
  };

  // Visual preferences
  visuals: {
    threadStyle: 'realistic' | 'abstract' | 'neon' | 'watercolor' | 'sketch';
    backgroundColor: 'dark' | 'light' | 'paper' | 'cosmos' | 'ocean';
    glowIntensity: number;        // 0-1, overall glow effects
    particleDensity: number;      // 0-1, ambient particles
    motionBlur: boolean;          // Smooth thread movements
    depthOfField: boolean;        // Blur distant threads
  };

  // Layer visibility
  layers: {
    showExtinct: boolean;         // Faded threads of extinct species
    showRelationships: boolean;   // Connection lines
    showPressure: boolean;        // Environmental pressure viz
    showHabitats: boolean;        // Habitat layer backgrounds
    showTimeline: boolean;        // Turn markers
    showLegend: boolean;          // Color/pattern legend
  };

  // Interaction modes
  interactionMode: 'explore' | 'analyze' | 'compare' | 'story';
  
  // Analysis tools
  analysis: {
    highlightPattern?: 'lineage' | 'competitors' | 'ecosystem' | 'era';
    measureTool: boolean;         // Distance between species
    statisticsPanel: boolean;     // Population graphs
    treeMetrics: boolean;         // Diversity index, etc.
  };

  // Animation queues
  animations: {
    pendingHighlights: Array<{speciesId: string; duration: number}>;
    cameraTransitions: Array<{target: any; duration: number}>;
    activeEffects: Map<string, {type: string; startTime: number}>;
  };

  // User preferences
  preferences: {
    autoFollowNew: boolean;       // Camera follows new species
    soundEnabled: boolean;        // Audio feedback
    reducedMotion: boolean;       // Accessibility
    tooltipDetail: 'minimal' | 'normal' | 'verbose';
    language: string;
  };

  // Performance settings
  performance: {
    quality: 'low' | 'medium' | 'high' | 'ultra';
    maxThreadsVisible: number;    // LOD threshold
    enableShadows: boolean;
    enableReflections: boolean;
    antialiasing: boolean;
  };

  // Story mode state
  storyMode?: {
    currentChapter: number;
    narrativeSpeed: number;
    focusSpecies: string[];
    cinematicCamera: boolean;
  };
}