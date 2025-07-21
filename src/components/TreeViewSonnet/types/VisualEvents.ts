/**
 * Visual events for the Living River Ecosystem visualization.
 * These events orchestrate smooth animations and ecosystem dynamics.
 */

export interface BaseVisualEvent {
  id: string;
  type: string;
  startTime: number;      // Animation start timestamp
  duration: number;       // Animation duration in milliseconds  
  easing: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce';
}

/**
 * New species emergence from parent stream
 */
export interface SpeciesBirthEvent extends BaseVisualEvent {
  type: 'species-birth';
  speciesId: string;
  parentSpeciesId: string | null;
  
  // Pre-calculated positions for smooth animation
  birthPosition: { x: number; y: number; };
  finalPosition: { x: number; y: number; };
  
  // Stream creation
  newStreamPath: { x: number; y: number; }[];
  streamWidth: number;
  
  animation: {
    // Birth animation style
    style: 'bubble-burst' | 'flow-split' | 'gentle-emerge' | 'dramatic-splash';
    
    // Particle effects
    particleBurst: {
      count: number;
      colors: string[];
      spreadRadius: number;
    };
    
    // Stream formation animation
    streamGrowth: {
      fromPosition: { x: number; y: number; };
      growthDuration: number;
      waveAmplitude: number;
    };
    
    // Sound effects
    soundEffects?: {
      birthSound: string;     // Audio file or generated frequency
      streamSound: string;    // Flowing water sound
      volume: number;
    };
  };
}

/**
 * Species extinction - particles fade and stream dries up
 */
export interface SpeciesExtinctionEvent extends BaseVisualEvent {
  type: 'species-extinction';
  speciesId: string;
  
  // Final position before extinction
  lastPosition: { x: number; y: number; };
  
  animation: {
    // Extinction animation style  
    style: 'fade-away' | 'sink-down' | 'scatter' | 'dissolve';
    
    // Stream closing
    streamClosure: {
      drainDuration: number;
      finalWidth: number;     // Usually 0
    };
    
    // Particle behavior during extinction
    particleScatter: {
      scatterRadius: number;
      fadeRate: number;
    };
    
    // Sound effects
    soundEffects?: {
      extinctionSound: string;
      echoDuration: number;
      volume: number;
    };
  };
}

/**
 * Population changes affecting flow density and particle count
 */
export interface PopulationChangeEvent extends BaseVisualEvent {
  type: 'population-change';
  speciesId: string;
  
  // Population statistics
  oldPopulation: number;
  newPopulation: number;
  changeRate: number;      // Positive for growth, negative for decline
  
  // Visual response
  animation: {
    // Particle count changes
    particleCountChange: {
      oldCount: number;
      newCount: number;
      transitionStyle: 'gradual' | 'burst' | 'fade';
    };
    
    // Flow density changes
    flowDensityChange: {
      oldDensity: number;
      newDensity: number;
      affectsStreamWidth: boolean;
    };
    
    // Color intensity changes (health indicator)
    colorIntensityChange: {
      oldIntensity: number;
      newIntensity: number;
    };
  };
}

/**
 * Environmental changes affecting the entire ecosystem
 */
export interface EnvironmentalChangeEvent extends BaseVisualEvent {
  type: 'environmental-change';
  
  // Environmental parameters
  changeType: 'temperature' | 'oxygen' | 'nutrients' | 'toxins' | 'current-strength';
  oldValue: number;
  newValue: number;
  affectedArea: {
    center: { x: number; y: number; };
    radius: number;
  };
  
  // Which species are affected
  affectedSpeciesIds: string[];
  
  animation: {
    // Visual representation of environmental change
    environmentalWave: {
      waveColor: string;
      waveSpeed: number;
      waveAmplitude: number;
    };
    
    // Species response animations
    speciesResponse: {
      migrationPaths?: { speciesId: string; path: { x: number; y: number; }[]; }[];
      colorChanges?: { speciesId: string; newColor: string; }[];
      sizeChanges?: { speciesId: string; sizeMultiplier: number; }[];
    };
  };
}

/**
 * Predator-prey interaction visualization
 */
export interface EcosystemInteractionEvent extends BaseVisualEvent {
  type: 'ecosystem-interaction';
  interactionType: 'predation' | 'competition' | 'symbiosis' | 'parasitism';
  
  // Participating species
  primarySpeciesId: string;
  secondarySpeciesId: string;
  
  // Interaction location and intensity
  interactionZone: {
    center: { x: number; y: number; };
    radius: number;
  };
  intensity: number;        // 0-1, affects visual impact
  
  animation: {
    // Connection visualization between species
    connectionLine: {
      color: string;
      thickness: number;
      pattern: 'solid' | 'dashed' | 'pulsing' | 'flowing';
    };
    
    // Particle interactions
    particleInteraction: {
      attractionForce?: number;   // For symbiosis
      repulsionForce?: number;    // For competition
      consumptionRate?: number;   // For predation
    };
    
    // Visual effects
    effects: {
      sparks?: boolean;          // Competition sparks
      healing?: boolean;         // Symbiotic healing glow
      energyTransfer?: boolean;  // Predation energy transfer
    };
  };
}

/**
 * Camera/viewport movement for cinematic presentations
 */
export interface CameraMovementEvent extends BaseVisualEvent {
  type: 'camera-movement';
  
  // Camera path
  cameraPath: {
    position: { x: number; y: number; };
    zoom: number;
    rotation?: number;
  }[];
  
  // Movement characteristics
  movementStyle: 'smooth' | 'dramatic' | 'following' | 'orbiting';
  
  // What the camera is focusing on
  focusTarget?: {
    speciesId?: string;
    ecosystemRegion?: { x: number; y: number; radius: number; };
    interactionEvent?: string; // ID of another event to follow
  };
}

/**
 * Combined event for complex ecosystem moments (multiple simultaneous events)
 */
export interface EcosystemMomentEvent extends BaseVisualEvent {
  type: 'ecosystem-moment';
  
  // Title and description for this moment
  momentTitle: string;
  description: string;
  
  // Constituent events that happen together
  simultaneousEvents: BaseVisualEvent[];
  
  // Overall cinematic direction
  cinematicStyle: 'dramatic' | 'peaceful' | 'chaotic' | 'mysterious';
  
  // Background ambiance changes
  ambianceChanges?: {
    backgroundColor: string;
    lightingIntensity: number;
    particleDensity: number;
    soundscape: string;
  };
}

// Union type for all visual events
export type VisualEvent = 
  | SpeciesBirthEvent
  | SpeciesExtinctionEvent  
  | PopulationChangeEvent
  | EnvironmentalChangeEvent
  | EcosystemInteractionEvent
  | CameraMovementEvent
  | EcosystemMomentEvent;