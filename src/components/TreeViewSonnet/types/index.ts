/**
 * Type definitions for the Living River Ecosystem TreeViewSonnet
 */

// Species and ecosystem types
export type { 
  Species, 
  FlowParticle, 
  EcosystemStream 
} from './Species';

// Visual event system
export type { 
  VisualEvent,
  BaseVisualEvent,
  SpeciesBirthEvent,
  SpeciesExtinctionEvent,
  PopulationChangeEvent,
  EnvironmentalChangeEvent,
  EcosystemInteractionEvent,
  CameraMovementEvent,
  EcosystemMomentEvent
} from './VisualEvents';

// UI state management
export type {
  TreeViewSonnetUIState,
  CameraState,
  SelectionState,
  FilterState,
  UserPreferences,
  TimeNavigationState,
  InteractionState,
  AnalyticsState
} from './UIState';

// Component props interface
export interface TreeViewSonnetProps {
  // Core data
  species: Species[];
  currentTurn: number;
  
  // Visualization dimensions
  width: number;
  height: number;
  
  // Event handlers
  onSpeciesClick?: (speciesId: string) => void;
  onSpeciesHover?: (speciesId: string | null) => void;
  onEcosystemInteraction?: (interactionType: string, speciesIds: string[]) => void;
  onTimeNavigate?: (turn: number) => void;
  
  // Initial UI state (optional)
  initialUIState?: Partial<TreeViewSonnetUIState>;
  
  // Visual events to animate (optional)
  visualEvents?: VisualEvent[];
  
  // Configuration
  enableSoundEffects?: boolean;
  enableParticleEffects?: boolean;
  maxParticlesPerSpecies?: number;
}

// Layout calculation types
export interface EcosystemLayout {
  speciesPositions: Map<string, { x: number; y: number; }>;
  streamPaths: Map<string, { x: number; y: number; }[]>;
  flowFields: {
    x: number;
    y: number;
    velocity: { x: number; y: number; };
    turbulence: number;
  }[][];
  
  // Ecosystem zones for different biomes
  ecosystemZones: {
    biome: string;
    center: { x: number; y: number; };
    radius: number;
    color: string;
  }[];
}

// Animation frame data
export interface AnimationFrame {
  timestamp: number;
  deltaTime: number;
  
  // Particle updates
  particleUpdates: Map<string, FlowParticle[]>;
  
  // Active visual events
  activeEvents: VisualEvent[];
  
  // Camera state
  cameraState: CameraState;
}

// Performance metrics
export interface PerformanceMetrics {
  frameRate: number;
  renderTime: number;
  particleCount: number;
  memoryUsage: number;
  
  // Bottleneck identification
  layoutCalculationTime: number;
  particleUpdateTime: number;
  renderingTime: number;
  eventProcessingTime: number;
}