/**
 * Extended Species type for the Living Tapestry visualization
 * 
 * The tapestry metaphor treats each species as a thread in the fabric of life.
 * Threads have thickness (population), texture (traits), and weaving patterns (relationships).
 */

export interface TapestrySpecies {
  // Core identity
  id: string;
  name: string;
  parentId: string | null;
  birthTurn: number;
  extinctionTurn?: number;

  // Thread properties
  threadColor: {
    primary: string;      // Main thread color
    secondary: string;    // Accent color for patterns
    luminosity: number;   // 0-1, how bright/prominent
  };
  
  threadTexture: 'smooth' | 'rough' | 'silky' | 'metallic' | 'ethereal';
  threadThickness: number;  // Population/importance, affects visual weight
  
  // Weaving patterns - how this thread interacts with others
  weavingStyle: {
    pattern: 'tight' | 'loose' | 'spiral' | 'branching' | 'chaotic';
    frequency: number;     // How often it crosses other threads
    amplitude: number;     // How far it deviates from straight path
  };

  // Life force - affects animation and glow
  vitality: {
    current: number;      // 0-1, current life force
    peak: number;         // Historical maximum
    trend: 'rising' | 'stable' | 'declining' | 'volatile';
  };

  // Environmental adaptation
  habitat: {
    layer: 'deep' | 'middle' | 'surface' | 'aerial';  // Vertical position in tapestry
    temperature: 'arctic' | 'temperate' | 'tropical' | 'volcanic';
    moisture: 'arid' | 'moderate' | 'humid' | 'aquatic';
  };

  // Traits that affect visual representation
  traits: {
    mobility: 'stationary' | 'slow' | 'moderate' | 'fast' | 'teleporting';
    sociability: 'solitary' | 'pairs' | 'packs' | 'swarms' | 'hive';
    metabolism: 'photosynthetic' | 'herbivore' | 'carnivore' | 'omnivore' | 'exotic';
    reproduction: 'asexual' | 'sexual' | 'spores' | 'budding' | 'metamorphic';
  };

  // Relationships that create visual connections
  relationships: {
    symbioticPartners: string[];   // Threads that intertwine closely
    predators: string[];           // Threads that chase/follow
    prey: string[];                // Threads being chased
    competitors: string[];         // Threads that repel each other
  };

  // Sound and animation preferences
  audioSignature: {
    tone: 'harmonic' | 'rhythmic' | 'ambient' | 'percussive' | 'dissonant';
    frequency: number;  // Hz, affects pitch
    volume: number;     // 0-1, species prominence
  };

  // Evolutionary pressure - affects thread behavior
  pressure: {
    environmental: number;  // 0-1, how stressed by environment
    predation: number;      // 0-1, hunting pressure
    competition: number;    // 0-1, resource competition
    disease: number;        // 0-1, pathogen load
  };

  // Visual effects and particles
  effects: {
    sparkles: boolean;           // Reproductive events
    pulses: boolean;             // Heartbeat/life rhythm
    trails: boolean;             // Movement history
    aura: 'none' | 'soft' | 'electric' | 'flame' | 'mist';
  };

  // Story elements for rich tooltips
  lore: {
    origin: string;              // "Born from volcanic vents..."
    achievement: string;         // "First to develop flight..."
    challenge: string;           // "Struggling against ice age..."
    destiny?: string;            // "Prophesied to..."
  };
}