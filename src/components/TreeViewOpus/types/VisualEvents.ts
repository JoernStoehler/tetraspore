/**
 * Visual Events for the Living Tapestry
 * 
 * These events know about past and future, enabling rich animations
 * and cinematic moments in the tapestry visualization.
 */

export type TapestryVisualEvent = 
  | ThreadBirthEvent
  | ThreadEvolutionEvent
  | ThreadExtinctionEvent
  | RelationshipEvent
  | EnvironmentalEvent
  | CinematicEvent;

export interface BaseVisualEvent {
  id: string;
  timestamp: number;
  turn: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// When a new thread appears in the tapestry
export interface ThreadBirthEvent extends BaseVisualEvent {
  type: 'thread-birth';
  speciesId: string;
  parentId: string | null;
  
  // Where the thread emerges
  origin: {
    x: number;
    y: number;
    layer: 'deep' | 'middle' | 'surface' | 'aerial';
  };
  
  // How it enters the tapestry
  animation: {
    style: 'emerge' | 'split' | 'weave' | 'burst' | 'phase-in';
    duration: number;
    
    // Thread grows from parent or appears fresh
    growthPath?: Array<{x: number; y: number; t: number}>;
    
    // Visual effects during birth
    effects: {
      sparkBurst?: boolean;
      ripple?: boolean;
      lightBeam?: boolean;
      parentGlow?: boolean;
    };
    
    // Sound cue
    sound?: {
      type: 'chime' | 'growth' | 'crystallize' | 'whisper';
      pitch: number;
      volume: number;
    };
  };
  
  // Initial thread properties
  initialState: {
    thickness: number;
    opacity: number;
    glow: number;
    waveAmplitude: number;
  };
}

// When a thread changes significantly
export interface ThreadEvolutionEvent extends BaseVisualEvent {
  type: 'thread-evolution';
  speciesId: string;
  
  changes: {
    // Visual changes
    colorShift?: { from: string; to: string };
    thicknessChange?: { from: number; to: number };
    textureChange?: { from: string; to: string };
    
    // Behavioral changes
    weavingPattern?: { from: string; to: string };
    layerMigration?: { from: string; to: string };
    
    // Relationship changes
    newConnections?: string[];
    brokenConnections?: string[];
  };
  
  animation: {
    style: 'morph' | 'pulse' | 'shimmer' | 'crystallize';
    duration: number;
    
    // Multi-stage transformation
    keyframes?: Array<{
      t: number;  // 0-1 normalized time
      state: any; // Intermediate state
    }>;
    
    effects: {
      particleTrace?: boolean;
      electricArc?: boolean;
      metamorphosis?: boolean;
    };
  };
  
  // Ripple effects on nearby threads
  influence?: {
    affectedSpecies: string[];
    effectType: 'attract' | 'repel' | 'resonate' | 'disturb';
    radius: number;
    intensity: number;
  };
}

// When a thread fades from the tapestry
export interface ThreadExtinctionEvent extends BaseVisualEvent {
  type: 'thread-extinction';
  speciesId: string;
  
  cause: 'gradual' | 'sudden' | 'consumed' | 'transformed' | 'mysterious';
  
  animation: {
    style: 'fade' | 'unravel' | 'burn' | 'shatter' | 'dissolve';
    duration: number;
    
    // How the thread disappears
    dissolution?: {
      startPoint: { x: number; y: number };
      direction: 'inward' | 'outward' | 'upward' | 'scattered';
      particles: boolean;
    };
    
    // Final moments
    effects: {
      lastPulse?: boolean;
      ghostThread?: boolean;  // Faint remnant remains
      memorySpark?: boolean;  // Brief bright flash
      echoWave?: boolean;     // Ripples through tapestry
    };
    
    sound?: {
      type: 'sigh' | 'bell' | 'whisper' | 'silence';
      fadeOut: boolean;
    };
  };
  
  // Legacy effects
  legacy?: {
    ghostOpacity: number;     // How visible the extinct thread remains
    influenceDecay: number;   // How long its effects linger
    memoryMarkers: boolean;   // Special markers where it existed
  };
}

// When threads form new relationships
export interface RelationshipEvent extends BaseVisualEvent {
  type: 'relationship';
  speciesIds: string[];
  relationshipType: 'symbiosis' | 'predation' | 'competition' | 'parasitism';
  
  visualization: {
    style: 'bridge' | 'orbit' | 'tangle' | 'chase' | 'merge';
    
    // Connection rendering
    connection: {
      type: 'thread' | 'particle' | 'energy' | 'gravitational';
      color: string;
      thickness: number;
      pulseRate?: number;
      bidirectional: boolean;
    };
    
    // Interaction effects
    effects: {
      sparkExchange?: boolean;
      resonance?: boolean;
      tension?: boolean;
      harmony?: boolean;
    };
  };
  
  dynamics: {
    strength: number;        // 0-1, how strong the relationship
    stability: number;       // 0-1, how stable
    beneficial: boolean;     // Positive or negative for participants
    distance: number;        // How close threads need to be
  };
}

// Environmental changes affecting the whole tapestry
export interface EnvironmentalEvent extends BaseVisualEvent {
  type: 'environmental';
  eventName: string;  // "Ice Age", "Meteor Impact", "Volcanic Era"
  
  scope: {
    global: boolean;
    affectedLayers?: Array<'deep' | 'middle' | 'surface' | 'aerial'>;
    affectedRegion?: { x: number; y: number; radius: number };
    affectedSpecies: string[];
  };
  
  visualization: {
    style: 'wave' | 'storm' | 'freeze' | 'burn' | 'shift';
    
    // Background effects
    backdrop: {
      colorShift?: { from: string; to: string };
      particleStorm?: boolean;
      lightningStrikes?: boolean;
      fogEffect?: boolean;
      tremor?: boolean;
    };
    
    // Thread effects
    threadImpact: {
      vibration?: number;
      colorDrain?: number;
      thicknessReduction?: number;
      chaoticWeaving?: boolean;
    };
  };
  
  duration: number;
  intensity: number;  // 0-1, how severe
}

// Special cinematic moments
export interface CinematicEvent extends BaseVisualEvent {
  type: 'cinematic';
  title: string;  // "The Great Divergence", "Rise of Intelligence"
  
  sequence: Array<{
    timestamp: number;
    action: 
      | { type: 'camera'; target: any; duration: number }
      | { type: 'highlight'; speciesIds: string[]; style: string }
      | { type: 'effect'; name: string; params: any }
      | { type: 'narration'; text: string; duration: number }
      | { type: 'music'; track: string; volume: number };
  }>;
  
  // Overall cinematic style
  mood: 'epic' | 'mysterious' | 'triumphant' | 'melancholic' | 'chaotic';
  
  // Visual treatment during cinematic
  filters?: {
    bloom?: number;
    saturation?: number;
    contrast?: number;
    vignette?: boolean;
    slowMotion?: number;
  };
}