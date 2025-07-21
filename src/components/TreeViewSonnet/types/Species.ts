/**
 * Extended Species interface for the Living River Ecosystem visualization.
 * This enriched model enables immersive biodiversity representation.
 */
export interface Species {
  // Core identity (required)
  id: string;
  name: string;
  parentId: string | null;
  birthTurn: number;
  extinctionTurn?: number;
  
  // Visual identity for river ecosystem
  primaryColor: string;        // Main species color (#4ECDC4)
  secondaryColor?: string;     // Accent color for patterns
  size: number;               // Relative size (0.5-3.0) affects flow position
  opacity: number;            // Base opacity (0.3-1.0) for depth layering
  particleCount: number;      // Number of flowing particles (5-50)
  
  // Ecosystem context
  biome: 'deep-ocean' | 'shallow-seas' | 'coral-reefs' | 'kelp-forests' | 
         'tidal-pools' | 'freshwater-rivers' | 'mountain-lakes' | 'wetlands';
  climate: 'tropical' | 'temperate' | 'arctic' | 'volcanic' | 'abyssal';
  depth: number;              // Water depth preference (0-1000m)
  
  // Behavioral traits for flow dynamics
  mobility: 'sessile' | 'slow-drifter' | 'active-swimmer' | 'rapid-hunter';
  groupBehavior: 'solitary' | 'small-pods' | 'large-schools' | 'colonial';
  flowPattern: 'straight' | 'meandering' | 'spiral' | 'chaotic';
  
  // Rich metadata for interactions
  population: number;         // Current population size (affects flow density)
  traits: string[];          // ['bioluminescent', 'filter-feeder', 'symbiotic']
  territorySize: number;     // Territory radius affects clustering
  
  // Relationship ecology
  competitors?: string[];     // Species IDs of direct competitors
  preySpecies?: string[];     // What this species feeds on
  predators?: string[];       // What feeds on this species  
  symbioticPartners?: string[]; // Mutual benefit relationships
  
  // Audio landscape (for immersive experience)
  soundSignature?: {
    frequency: number;        // Base frequency (20-2000 Hz)
    rhythm: 'constant' | 'pulsing' | 'irregular' | 'harmonic';
    volume: number;          // Relative volume (0.0-1.0)
    timbre: 'whale-song' | 'dolphin-click' | 'bubbles' | 'current' | 'silence';
  };
  
  // Animation preferences
  birthAnimation: 'bubble-burst' | 'flow-split' | 'gentle-emerge' | 'dramatic-splash';
  extinctionAnimation: 'fade-away' | 'sink-down' | 'scatter' | 'dissolve';
  
  // Environmental sensitivity for dynamic behaviors
  temperatureTolerance: { min: number; max: number; }; // Celsius
  pressureTolerance: { min: number; max: number; };    // Atmospheres
  oxygenRequirement: number;  // 0-1, affects position in water column
}

/**
 * A flowing particle represents a single organism within a species
 * moving through the river ecosystem.
 */
export interface FlowParticle {
  id: string;
  speciesId: string;
  
  // Current position and movement
  x: number;
  y: number;
  velocity: { x: number; y: number; };
  
  // Visual properties
  size: number;           // Individual size variation (0.8-1.2)
  brightness: number;     // Individual brightness (0.7-1.3)
  
  // Lifecycle
  age: number;           // Age in animation frames
  lifespan: number;      // Total lifespan before recycling
  
  // Behavior state
  isLeader: boolean;     // Group leaders influence others
  targetPosition?: { x: number; y: number; }; // For flocking behavior
}

/**
 * Represents the flowing stream/tributary that connects parent to child species
 */
export interface EcosystemStream {
  id: string;
  parentSpeciesId: string | null;
  childSpeciesId: string;
  
  // Stream geometry
  path: { x: number; y: number; }[];  // Bezier control points
  width: number;                      // Stream width (affects flow volume)
  
  // Flow characteristics  
  flowRate: number;        // Speed of particle movement
  turbulence: number;      // Amount of random variation (0-1)
  
  // Visual properties
  color: string;           // Stream water color
  opacity: number;         // Stream visibility
  
  // Ecological properties
  nutrients: number;       // Affects species size/health in this stream
  oxygenLevel: number;     // Affects what species can use this stream
  temperature: number;     // Stream temperature
}