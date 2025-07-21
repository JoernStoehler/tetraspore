/**
 * Thread representation for rendering in the tapestry
 * 
 * This is the runtime representation of a species as it appears
 * in the visualization, with computed positions and states.
 */

import { TapestrySpecies } from './Species';

export interface TapestryThread {
  id: string;
  species: TapestrySpecies;
  
  // Computed path through the tapestry
  path: ThreadSegment[];
  
  // Current visual state (animated)
  visualState: {
    opacity: number;
    thickness: number;
    glow: number;
    saturation: number;
    blur: number;
  };
  
  // Bounding box for performance optimization
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };
  
  // Connections to other threads
  connections: ThreadConnection[];
  
  // Active effects
  activeEffects: Set<string>;
  
  // Performance flags
  isVisible: boolean;
  isSimplified: boolean;  // Low LOD
  lastUpdate: number;
}

export interface ThreadSegment {
  // Position at this point
  x: number;
  y: number;
  z: number;  // Layer depth
  
  // Time
  turn: number;
  
  // Visual properties at this point
  thickness: number;
  color: string;
  opacity: number;
  
  // Thread behavior
  tension: number;      // How taut the thread
  vibration: number;    // Oscillation amplitude
  twist: number;        // Rotation along thread
  
  // Control points for smooth curves
  controlBefore?: { x: number; y: number };
  controlAfter?: { x: number; y: number };
}

export interface ThreadConnection {
  targetId: string;
  type: 'parent' | 'child' | 'symbiotic' | 'predator' | 'prey' | 'competitor';
  strength: number;
  
  // Visual representation
  visual: {
    style: 'fiber' | 'energy' | 'particle';
    color: string;
    opacity: number;
    animated: boolean;
  };
  
  // Connection points
  fromSegment: number;  // Index in source thread path
  toSegment: number;    // Index in target thread path
}