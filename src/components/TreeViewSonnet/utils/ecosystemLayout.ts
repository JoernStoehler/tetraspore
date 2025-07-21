/**
 * Ecosystem layout algorithm for the Living River visualization.
 * Creates flowing, organic stream patterns with natural clustering.
 */

import { Species, EcosystemStream } from '../types';
import { EcosystemLayout } from '../types';

/**
 * Calculate positions for species in a flowing river ecosystem layout
 */
export function computeEcosystemLayout(
  species: Species[], 
  width: number, 
  height: number
): EcosystemLayout {
  // Create a gravity-fed river system flowing downward
  const speciesPositions = new Map<string, { x: number; y: number; }>();
  const streamPaths = new Map<string, { x: number; y: number; }[]>();
  
  // Group species by turn (time flows downward)
  const speciesByTurn = new Map<number, Species[]>();
  species.forEach(s => {
    const turn = s.birthTurn;
    if (!speciesByTurn.has(turn)) {
      speciesByTurn.set(turn, []);
    }
    speciesByTurn.get(turn)!.push(s);
  });
  
  const turns = Array.from(speciesByTurn.keys()).sort((a, b) => a - b);
  const turnHeight = height / (turns.length + 1);
  
  // Position species with organic flow patterns
  turns.forEach((turn, turnIndex) => {
    const turnSpecies = speciesByTurn.get(turn)!;
    const y = (turnIndex + 1) * turnHeight;
    
    if (turn === turns[0]) {
      // Root species: center of river source
      turnSpecies.forEach((species, index) => {
        const x = width / 2 + (index - turnSpecies.length / 2) * 100;
        speciesPositions.set(species.id, { x, y });
      });
    } else {
      // Position children relative to parents with natural branching
      turnSpecies.forEach((species) => {
        const parentPos = species.parentId 
          ? speciesPositions.get(species.parentId) 
          : { x: width / 2, y: y - turnHeight };
        
        if (parentPos) {
          // Create natural branching with biome clustering
          const biomeOffset = getBiomeOffset(species.biome);
          const flowOffset = getFlowOffset(species.flowPattern, species.mobility);
          
          const x = parentPos.x + biomeOffset + flowOffset + (Math.random() - 0.5) * 60;
          speciesPositions.set(species.id, { x: Math.max(50, Math.min(width - 50, x)), y });
          
          // Create stream path from parent to child
          const streamId = `${species.parentId}-${species.id}`;
          const streamPath = createFlowingStreamPath(parentPos, { x, y }, species);
          streamPaths.set(streamId, streamPath);
        }
      });
    }
  });
  
  // Generate flow field for particle movement
  const flowFields = generateFlowField(width, height, streamPaths);
  
  // Create ecosystem zones for different biomes
  const ecosystemZones = createEcosystemZones(species, speciesPositions, width, height);
  
  return {
    speciesPositions,
    streamPaths,
    flowFields,
    ecosystemZones
  };
}

/**
 * Get horizontal offset based on biome type for natural clustering
 */
function getBiomeOffset(biome: Species['biome']): number {
  const biomeOffsets: Record<Species['biome'], number> = {
    'deep-ocean': -200,
    'abyssal': -250,
    'shallow-seas': -100,
    'coral-reefs': 0,
    'kelp-forests': -50,
    'tidal-pools': 100,
    'freshwater-rivers': 150,
    'mountain-lakes': 200,
    'wetlands': 50
  };
  return biomeOffsets[biome] || 0;
}

/**
 * Get flow pattern offset based on species movement characteristics
 */
function getFlowOffset(flowPattern: Species['flowPattern'], mobility: Species['mobility']): number {
  const mobilityMultiplier = {
    'sessile': 0,
    'slow-drifter': 0.3,
    'active-swimmer': 0.7,
    'rapid-hunter': 1.0
  }[mobility];
  
  const patternOffset = {
    'straight': 0,
    'meandering': 30,
    'spiral': 50,
    'chaotic': 80
  }[flowPattern];
  
  return patternOffset * mobilityMultiplier * (Math.random() - 0.5) * 2;
}

/**
 * Create a flowing stream path between parent and child positions
 */
function createFlowingStreamPath(
  start: { x: number; y: number; },
  end: { x: number; y: number; },
  species: Species
): { x: number; y: number; }[] {
  const path: { x: number; y: number; }[] = [];
  const segments = 8;
  
  // Create control points for smooth Bezier-like curve
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  
  // Add curvature based on species characteristics
  const curvature = species.flowPattern === 'meandering' ? 0.6 : 
                   species.flowPattern === 'spiral' ? 0.8 : 0.3;
  
  const midX = start.x + dx / 2;
  const midY = start.y + dy / 2;
  
  // Control points for natural river curve
  const cp1x = start.x + dx * 0.25 + curvature * 40 * (Math.random() - 0.5);
  const cp1y = start.y + dy * 0.25;
  const cp2x = start.x + dx * 0.75 + curvature * 60 * (Math.random() - 0.5);
  const cp2y = start.y + dy * 0.75;
  
  // Generate smooth path points
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    
    // Cubic Bezier interpolation for natural flow
    const x = Math.pow(1 - t, 3) * start.x +
              3 * Math.pow(1 - t, 2) * t * cp1x +
              3 * (1 - t) * Math.pow(t, 2) * cp2x +
              Math.pow(t, 3) * end.x;
              
    const y = Math.pow(1 - t, 3) * start.y +
              3 * Math.pow(1 - t, 2) * t * cp1y +
              3 * (1 - t) * Math.pow(t, 2) * cp2y +
              Math.pow(t, 3) * end.y;
    
    path.push({ x, y });
  }
  
  return path;
}

/**
 * Generate a flow field for natural particle movement
 */
function generateFlowField(
  width: number, 
  height: number, 
  streamPaths: Map<string, { x: number; y: number; }[]>
): { x: number; y: number; velocity: { x: number; y: number; }; turbulence: number; }[][] {
  const gridSize = 40;
  const cols = Math.ceil(width / gridSize);
  const rows = Math.ceil(height / gridSize);
  
  const flowField: { x: number; y: number; velocity: { x: number; y: number; }; turbulence: number; }[][] = [];
  
  for (let i = 0; i < rows; i++) {
    flowField[i] = [];
    for (let j = 0; j < cols; j++) {
      const x = j * gridSize;
      const y = i * gridSize;
      
      // Base downward flow (gravity effect)
      let velocity = { x: 0, y: 1.0 };
      let turbulence = 0.1;
      
      // Influence from nearby streams
      for (const path of streamPaths.values()) {
        const influence = getStreamInfluence({ x, y }, path);
        velocity.x += influence.velocity.x;
        velocity.y += influence.velocity.y;
        turbulence += influence.turbulence;
      }
      
      // Normalize velocity
      const magnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
      if (magnitude > 0) {
        velocity.x /= magnitude;
        velocity.y /= magnitude;
      }
      
      flowField[i][j] = { x, y, velocity, turbulence: Math.min(turbulence, 1.0) };
    }
  }
  
  return flowField;
}

/**
 * Calculate stream influence on a given point for flow field generation
 */
function getStreamInfluence(
  point: { x: number; y: number; },
  streamPath: { x: number; y: number; }[]
): { velocity: { x: number; y: number; }; turbulence: number; } {
  let closestDistance = Infinity;
  let closestSegment = 0;
  
  // Find closest point on stream path
  for (let i = 0; i < streamPath.length - 1; i++) {
    const distance = distanceToLineSegment(point, streamPath[i], streamPath[i + 1]);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestSegment = i;
    }
  }
  
  // Influence decreases with distance
  const maxInfluenceDistance = 100;
  const influenceStrength = Math.max(0, 1 - closestDistance / maxInfluenceDistance);
  
  if (influenceStrength === 0) {
    return { velocity: { x: 0, y: 0 }, turbulence: 0 };
  }
  
  // Calculate flow direction along stream
  const segmentStart = streamPath[closestSegment];
  const segmentEnd = streamPath[Math.min(closestSegment + 1, streamPath.length - 1)];
  
  const dx = segmentEnd.x - segmentStart.x;
  const dy = segmentEnd.y - segmentStart.y;
  const segmentLength = Math.sqrt(dx * dx + dy * dy);
  
  let velocity = { x: 0, y: 1 }; // Default downward
  if (segmentLength > 0) {
    velocity = { x: dx / segmentLength, y: dy / segmentLength };
  }
  
  // Scale by influence strength
  velocity.x *= influenceStrength;
  velocity.y *= influenceStrength;
  
  const turbulence = influenceStrength * 0.3;
  
  return { velocity, turbulence };
}

/**
 * Distance from point to line segment
 */
function distanceToLineSegment(
  point: { x: number; y: number; },
  lineStart: { x: number; y: number; },
  lineEnd: { x: number; y: number; }
): number {
  const dx = lineEnd.x - lineStart.x;
  const dy = lineEnd.y - lineStart.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  
  if (length === 0) {
    const pdx = point.x - lineStart.x;
    const pdy = point.y - lineStart.y;
    return Math.sqrt(pdx * pdx + pdy * pdy);
  }
  
  const t = Math.max(0, Math.min(1, ((point.x - lineStart.x) * dx + (point.y - lineStart.y) * dy) / (length * length)));
  const projectionX = lineStart.x + t * dx;
  const projectionY = lineStart.y + t * dy;
  
  const pdx = point.x - projectionX;
  const pdy = point.y - projectionY;
  return Math.sqrt(pdx * pdx + pdy * pdy);
}

/**
 * Create ecosystem zones based on species biomes and positions
 */
function createEcosystemZones(
  species: Species[],
  positions: Map<string, { x: number; y: number; }>,
  width: number,
  height: number
): { biome: string; center: { x: number; y: number; }; radius: number; color: string; }[] {
  const biomeGroups = new Map<string, { x: number; y: number; }[]>();
  
  // Group positions by biome
  species.forEach(s => {
    const pos = positions.get(s.id);
    if (pos) {
      if (!biomeGroups.has(s.biome)) {
        biomeGroups.set(s.biome, []);
      }
      biomeGroups.get(s.biome)!.push(pos);
    }
  });
  
  // Calculate zone centers and radii
  const zones: { biome: string; center: { x: number; y: number; }; radius: number; color: string; }[] = [];
  
  biomeGroups.forEach((positions, biome) => {
    if (positions.length === 0) return;
    
    // Calculate center of mass
    const centerX = positions.reduce((sum, pos) => sum + pos.x, 0) / positions.length;
    const centerY = positions.reduce((sum, pos) => sum + pos.y, 0) / positions.length;
    
    // Calculate radius to encompass most positions
    const distances = positions.map(pos => 
      Math.sqrt((pos.x - centerX) ** 2 + (pos.y - centerY) ** 2)
    );
    distances.sort((a, b) => a - b);
    const radius = distances[Math.floor(distances.length * 0.8)] + 60; // 80th percentile + buffer
    
    zones.push({
      biome,
      center: { x: centerX, y: centerY },
      radius,
      color: getBiomeColor(biome as Species['biome'])
    });
  });
  
  return zones;
}

/**
 * Get color representation for each biome
 */
function getBiomeColor(biome: Species['biome']): string {
  const colors: Record<Species['biome'], string> = {
    'deep-ocean': '#0B3D5C',
    'shallow-seas': '#1E6B8C',
    'coral-reefs': '#FF6B47',
    'kelp-forests': '#2E7D32',
    'tidal-pools': '#00838F',
    'freshwater-rivers': '#0277BD',
    'mountain-lakes': '#0288D1',
    'wetlands': '#558B2F'
  };
  return colors[biome] || '#455A64';
}