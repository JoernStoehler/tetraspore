/**
 * Thread path generation for the Living Tapestry
 * 
 * Converts species data into woven thread paths with organic movement
 */

import { TapestrySpecies, TapestryThread, ThreadSegment, TapestryUIState } from '../types';

export function generateThreadPaths(
  species: TapestrySpecies[],
  maxTurn: number,
  uiState: TapestryUIState
): TapestryThread[] {
  const threads: TapestryThread[] = [];
  const speciesMap = new Map(species.map(s => [s.id, s]));
  
  // Layout parameters
  const turnSpacing = 100;
  const layerSpacing = 200;
  const baseAmplitude = 30;
  
  // Layer offsets
  const layerOffsets = {
    deep: -300,
    middle: 0,
    surface: 300,
    aerial: 600
  };
  
  // Process each species
  for (const sp of species) {
    // Skip if before current display turn
    if (sp.birthTurn > uiState.timeDisplay.currentTurn) continue;
    
    const path: ThreadSegment[] = [];
    const startTurn = sp.birthTurn;
    const endTurn = Math.min(
      sp.extinctionTurn || maxTurn,
      uiState.timeDisplay.currentTurn
    );
    
    // Calculate base position
    const layerY = layerOffsets[sp.habitat.layer];
    const baseX = calculateSpeciesX(sp, species);
    
    // Generate path segments for each turn
    for (let turn = startTurn; turn <= endTurn; turn++) {
      const t = (turn - startTurn) / Math.max(1, endTurn - startTurn);
      
      // Calculate weaving pattern
      const waveOffset = calculateWaveOffset(sp, turn, t);
      const x = baseX + waveOffset.x;
      const y = layerY + turn * turnSpacing + waveOffset.y;
      const z = calculateDepth(sp, turn);
      
      // Determine visual properties at this turn
      const thickness = calculateThickness(sp, turn, t);
      const color = calculateColor(sp, turn, t);
      const opacity = calculateOpacity(sp, turn, endTurn, uiState);
      
      // Add control points for smooth curves
      const segment: ThreadSegment = {
        x,
        y,
        z,
        turn,
        thickness,
        color,
        opacity,
        tension: sp.pressure.environmental,
        vibration: sp.vitality.current * sp.weavingStyle.amplitude,
        twist: turn * sp.weavingStyle.frequency
      };
      
      // Add bezier control points
      if (path.length > 0) {
        const prev = path[path.length - 1];
        segment.controlBefore = {
          x: prev.x + (x - prev.x) * 0.3,
          y: prev.y + (y - prev.y) * 0.7
        };
        prev.controlAfter = {
          x: prev.x + (x - prev.x) * 0.7,
          y: prev.y + (y - prev.y) * 0.3
        };
      }
      
      path.push(segment);
    }
    
    // Create thread object
    const thread: TapestryThread = {
      id: sp.id,
      species: sp,
      path,
      visualState: {
        opacity: sp.extinctionTurn && sp.extinctionTurn <= uiState.timeDisplay.currentTurn ? 0.3 : 1,
        thickness: sp.threadThickness,
        glow: sp.threadColor.luminosity * uiState.visuals.glowIntensity,
        saturation: 1,
        blur: 0
      },
      bounds: calculateBounds(path),
      connections: generateConnections(sp, speciesMap, uiState),
      activeEffects: new Set(),
      isVisible: true,
      isSimplified: false,
      lastUpdate: Date.now()
    };
    
    // Apply LOD if too many threads
    if (threads.length > uiState.performance.maxThreadsVisible) {
      thread.isSimplified = true;
    }
    
    threads.push(thread);
  }
  
  return threads;
}

function calculateSpeciesX(species: TapestrySpecies, allSpecies: TapestrySpecies[]): number {
  // Group species by parent for better layout
  const siblings = allSpecies.filter(s => s.parentId === species.parentId);
  const index = siblings.findIndex(s => s.id === species.id);
  const spacing = 150;
  
  if (species.parentId) {
    const parent = allSpecies.find(s => s.id === species.parentId);
    if (parent) {
      const parentX = calculateSpeciesX(parent, allSpecies);
      const offset = (index - siblings.length / 2) * spacing;
      return parentX + offset;
    }
  }
  
  // Root species spacing
  const roots = allSpecies.filter(s => !s.parentId);
  const rootIndex = roots.findIndex(s => s.id === species.id);
  return (rootIndex - roots.length / 2) * spacing * 2;
}

function calculateWaveOffset(
  species: TapestrySpecies,
  turn: number,
  t: number
): { x: number; y: number } {
  const { pattern, frequency, amplitude } = species.weavingStyle;
  
  let x = 0;
  let y = 0;
  
  switch (pattern) {
    case 'tight':
      x = Math.sin(turn * frequency * 0.5) * amplitude * 0.3;
      y = Math.cos(turn * frequency * 0.5) * amplitude * 0.1;
      break;
    case 'loose':
      x = Math.sin(turn * frequency * 0.2) * amplitude;
      y = Math.sin(turn * frequency * 0.3) * amplitude * 0.5;
      break;
    case 'spiral':
      const angle = turn * frequency * 0.4;
      x = Math.cos(angle) * amplitude * (1 + t * 0.5);
      y = Math.sin(angle) * amplitude * 0.3;
      break;
    case 'branching':
      x = Math.sin(turn * frequency * 0.3) * amplitude * (1 + Math.random() * 0.2);
      y = t * amplitude * 0.2;
      break;
    case 'chaotic':
      x = (Math.random() - 0.5) * amplitude * 2;
      y = (Math.random() - 0.5) * amplitude;
      break;
  }
  
  // Add environmental pressure effects
  const pressureWobble = species.pressure.environmental * 10;
  x += Math.sin(turn * 2) * pressureWobble;
  y += Math.cos(turn * 1.5) * pressureWobble * 0.5;
  
  return { x, y };
}

function calculateDepth(species: TapestrySpecies, turn: number): number {
  // Base depth from habitat layer
  const layerDepths = { deep: 0, middle: 0.3, surface: 0.6, aerial: 0.9 };
  let depth = layerDepths[species.habitat.layer];
  
  // Add variation based on relationships
  depth += Math.sin(turn * 0.2) * 0.1;
  
  return depth;
}

function calculateThickness(
  species: TapestrySpecies,
  turn: number,
  t: number
): number {
  let thickness = species.threadThickness;
  
  // Start thin and grow
  if (t < 0.1) {
    thickness *= t * 10;
  }
  
  // Pulse with vitality
  thickness *= (0.9 + species.vitality.current * 0.2);
  
  // Vary with population/importance
  thickness *= (0.8 + Math.sin(turn * 0.3) * 0.2);
  
  return thickness;
}

function calculateColor(
  species: TapestrySpecies,
  turn: number,
  t: number
): string {
  // Interpolate between primary and secondary colors
  const ratio = (Math.sin(turn * 0.2) + 1) / 2;
  return interpolateColor(
    species.threadColor.primary,
    species.threadColor.secondary,
    ratio
  );
}

function calculateOpacity(
  species: TapestrySpecies,
  turn: number,
  endTurn: number,
  uiState: TapestryUIState
): number {
  let opacity = 1;
  
  // Fade extinct species
  if (species.extinctionTurn && species.extinctionTurn <= endTurn) {
    opacity = uiState.layers.showExtinct ? 0.3 : 0;
  }
  
  // Fade future ghosts
  if (uiState.timeDisplay.showFuture && turn > uiState.timeDisplay.currentTurn) {
    opacity *= 0.2;
  }
  
  // Distance fade for depth
  if (uiState.visuals.depthOfField) {
    const depthFade = 1 - (Math.abs(species.habitat.layer === 'middle' ? 0 : 0.5) * 0.3);
    opacity *= depthFade;
  }
  
  return opacity;
}

function calculateBounds(path: ThreadSegment[]): TapestryThread['bounds'] {
  if (path.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }
  
  const xs = path.map(p => p.x);
  const ys = path.map(p => p.y);
  
  return {
    minX: Math.min(...xs) - 50,
    maxX: Math.max(...xs) + 50,
    minY: Math.min(...ys) - 50,
    maxY: Math.max(...ys) + 50
  };
}

function generateConnections(
  species: TapestrySpecies,
  speciesMap: Map<string, TapestrySpecies>,
  uiState: TapestryUIState
): TapestryThread['connections'] {
  const connections: TapestryThread['connections'] = [];
  
  if (!uiState.layers.showRelationships) return connections;
  
  // Parent connection
  if (species.parentId && speciesMap.has(species.parentId)) {
    connections.push({
      targetId: species.parentId,
      type: 'parent',
      strength: 1,
      visual: {
        style: 'fiber',
        color: species.threadColor.primary,
        opacity: 0.5,
        animated: false
      },
      fromSegment: 0,
      toSegment: -1  // Will be calculated during render
    });
  }
  
  // Symbiotic connections
  for (const partnerId of species.relationships.symbioticPartners) {
    if (speciesMap.has(partnerId)) {
      connections.push({
        targetId: partnerId,
        type: 'symbiotic',
        strength: 0.8,
        visual: {
          style: 'energy',
          color: '#00ff88',
          opacity: 0.6,
          animated: true
        },
        fromSegment: Math.floor(species.birthTurn / 2),
        toSegment: -1
      });
    }
  }
  
  // Predator connections
  for (const predatorId of species.relationships.predators) {
    if (speciesMap.has(predatorId)) {
      connections.push({
        targetId: predatorId,
        type: 'predator',
        strength: 0.6,
        visual: {
          style: 'particle',
          color: '#ff4444',
          opacity: 0.4,
          animated: true
        },
        fromSegment: -1,
        toSegment: -1
      });
    }
  }
  
  return connections;
}

function interpolateColor(color1: string, color2: string, ratio: number): string {
  // Simple hex color interpolation
  const c1 = parseInt(color1.slice(1), 16);
  const c2 = parseInt(color2.slice(1), 16);
  
  const r1 = (c1 >> 16) & 255;
  const g1 = (c1 >> 8) & 255;
  const b1 = c1 & 255;
  
  const r2 = (c2 >> 16) & 255;
  const g2 = (c2 >> 8) & 255;
  const b2 = c2 & 255;
  
  const r = Math.round(r1 + (r2 - r1) * ratio);
  const g = Math.round(g1 + (g2 - g1) * ratio);
  const b = Math.round(b1 + (b2 - b1) * ratio);
  
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}