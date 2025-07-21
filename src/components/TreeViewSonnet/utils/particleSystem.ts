/**
 * Particle system for the Living River Ecosystem visualization.
 * Manages flowing particles that represent individual organisms.
 */

import { Species, FlowParticle } from '../types';
import { EcosystemLayout } from '../types';

/**
 * Create initial particles for a species
 */
export function createSpeciesParticles(
  species: Species,
  position: { x: number; y: number; },
  layout: EcosystemLayout
): FlowParticle[] {
  const particles: FlowParticle[] = [];
  const baseParticleCount = Math.min(species.particleCount, 50); // Performance limit
  
  // Adjust particle count based on population
  const populationFactor = Math.log10(species.population) / 6; // Normalize to 0-1
  const adjustedCount = Math.floor(baseParticleCount * (0.3 + populationFactor * 0.7));
  
  for (let i = 0; i < adjustedCount; i++) {
    // Spawn particles in a cluster around species position
    const angle = (i / adjustedCount) * 2 * Math.PI;
    const radius = species.territorySize * (0.5 + Math.random() * 0.5);
    
    const particle: FlowParticle = {
      id: `${species.id}-particle-${i}`,
      speciesId: species.id,
      
      // Position with some spread based on group behavior
      x: position.x + Math.cos(angle) * radius,
      y: position.y + Math.sin(angle) * radius,
      
      // Initial velocity based on species mobility
      velocity: getInitialVelocity(species, layout, position),
      
      // Visual variation
      size: species.size * (0.8 + Math.random() * 0.4), // ±20% variation
      brightness: 0.7 + Math.random() * 0.6, // 0.7-1.3 range
      
      // Lifecycle
      age: Math.random() * 100, // Stagger initial ages
      lifespan: 300 + Math.random() * 200, // 300-500 frame lifespan
      
      // Behavior
      isLeader: i === 0, // First particle is group leader
      targetPosition: undefined // Will be set by flocking behavior
    };
    
    particles.push(particle);
  }
  
  return particles;
}

/**
 * Update particle positions and behaviors for one animation frame
 */
export function updateParticles(
  particles: FlowParticle[],
  species: Map<string, Species>,
  layout: EcosystemLayout,
  deltaTime: number
): FlowParticle[] {
  const timeStep = deltaTime / 16.67; // Normalize to 60fps
  
  return particles.map(particle => {
    const speciesData = species.get(particle.speciesId);
    if (!speciesData) return particle;
    
    // Age the particle
    const newAge = particle.age + timeStep;
    
    // Recycle particle if too old
    if (newAge >= particle.lifespan) {
      return recycleParticle(particle, speciesData, layout);
    }
    
    // Apply flocking behavior for group species
    let velocity = { ...particle.velocity };
    if (speciesData.groupBehavior !== 'solitary') {
      velocity = applyFlockingBehavior(particle, particles, speciesData);
    }
    
    // Apply flow field influence
    velocity = applyFlowFieldInfluence(particle, layout, velocity);
    
    // Apply species-specific behavior
    velocity = applySpeciesBehavior(particle, speciesData, velocity);
    
    // Update position
    const newX = particle.x + velocity.x * timeStep;
    const newY = particle.y + velocity.y * timeStep;
    
    // Boundary behavior (wrap or bounce)
    const { x, y, velocity: adjustedVelocity } = handleBoundaries(
      newX, newY, velocity, layout
    );
    
    return {
      ...particle,
      x,
      y,
      velocity: adjustedVelocity,
      age: newAge,
      brightness: calculateBrightness(particle, speciesData, newAge)
    };
  });
}

/**
 * Get initial velocity for a particle based on species characteristics
 */
function getInitialVelocity(
  species: Species,
  layout: EcosystemLayout,
  position: { x: number; y: number; }
): { x: number; y: number; } {
  // Base velocity from flow field
  const flowVelocity = getFlowFieldVelocity(position, layout);
  
  // Mobility multipliers
  const mobilitySpeed = {
    'sessile': 0.1,
    'slow-drifter': 0.5,
    'active-swimmer': 1.2,
    'rapid-hunter': 2.0
  }[species.mobility];
  
  // Flow pattern modifications
  const patternModification = {
    'straight': { x: 0, y: 0 },
    'meandering': { x: Math.sin(Date.now() * 0.001) * 0.3, y: 0 },
    'spiral': { x: Math.cos(Date.now() * 0.002) * 0.5, y: Math.sin(Date.now() * 0.002) * 0.5 },
    'chaotic': { x: (Math.random() - 0.5) * 0.8, y: (Math.random() - 0.5) * 0.8 }
  }[species.flowPattern];
  
  return {
    x: (flowVelocity.x + patternModification.x) * mobilitySpeed,
    y: (flowVelocity.y + patternModification.y) * mobilitySpeed
  };
}

/**
 * Apply flocking behavior for group species
 */
function applyFlockingBehavior(
  particle: FlowParticle,
  allParticles: FlowParticle[],
  species: Species
): { x: number; y: number; } {
  // Find nearby particles of the same species
  const neighborRadius = species.territorySize * 2;
  const neighbors = allParticles.filter(other => 
    other.speciesId === particle.speciesId &&
    other.id !== particle.id &&
    distance(particle, other) < neighborRadius
  );
  
  if (neighbors.length === 0) {
    return particle.velocity;
  }
  
  // Three rules of flocking: separation, alignment, cohesion
  const separation = calculateSeparation(particle, neighbors);
  const alignment = calculateAlignment(particle, neighbors);
  const cohesion = calculateCohesion(particle, neighbors);
  
  // Weight the rules based on group behavior type
  const weights = {
    'small-pods': { sep: 0.5, align: 0.3, coh: 0.2 },
    'large-schools': { sep: 0.2, align: 0.5, coh: 0.3 },
    'colonial': { sep: 0.1, align: 0.2, coh: 0.7 }
  }[species.groupBehavior as 'small-pods' | 'large-schools' | 'colonial'] || 
  { sep: 0.33, align: 0.33, coh: 0.34 };
  
  return {
    x: particle.velocity.x + 
       separation.x * weights.sep + 
       alignment.x * weights.align + 
       cohesion.x * weights.coh,
    y: particle.velocity.y + 
       separation.y * weights.sep + 
       alignment.y * weights.align + 
       cohesion.y * weights.coh
  };
}

/**
 * Calculate separation force (avoid crowding)
 */
function calculateSeparation(
  particle: FlowParticle,
  neighbors: FlowParticle[]
): { x: number; y: number; } {
  let separationX = 0;
  let separationY = 0;
  let count = 0;
  
  const separationRadius = 20; // Minimum distance
  
  neighbors.forEach(neighbor => {
    const dist = distance(particle, neighbor);
    if (dist > 0 && dist < separationRadius) {
      const diffX = particle.x - neighbor.x;
      const diffY = particle.y - neighbor.y;
      
      // Weight by distance (closer = stronger repulsion)
      const weight = (separationRadius - dist) / separationRadius;
      separationX += (diffX / dist) * weight;
      separationY += (diffY / dist) * weight;
      count++;
    }
  });
  
  if (count === 0) return { x: 0, y: 0 };
  
  return {
    x: separationX / count * 0.1,
    y: separationY / count * 0.1
  };
}

/**
 * Calculate alignment force (match velocity of neighbors)
 */
function calculateAlignment(
  particle: FlowParticle,
  neighbors: FlowParticle[]
): { x: number; y: number; } {
  let avgVelX = 0;
  let avgVelY = 0;
  
  neighbors.forEach(neighbor => {
    avgVelX += neighbor.velocity.x;
    avgVelY += neighbor.velocity.y;
  });
  
  avgVelX /= neighbors.length;
  avgVelY /= neighbors.length;
  
  return {
    x: (avgVelX - particle.velocity.x) * 0.05,
    y: (avgVelY - particle.velocity.y) * 0.05
  };
}

/**
 * Calculate cohesion force (move toward average position of neighbors)
 */
function calculateCohesion(
  particle: FlowParticle,
  neighbors: FlowParticle[]
): { x: number; y: number; } {
  let avgX = 0;
  let avgY = 0;
  
  neighbors.forEach(neighbor => {
    avgX += neighbor.x;
    avgY += neighbor.y;
  });
  
  avgX /= neighbors.length;
  avgY /= neighbors.length;
  
  return {
    x: (avgX - particle.x) * 0.01,
    y: (avgY - particle.y) * 0.01
  };
}

/**
 * Apply flow field influence to particle velocity
 */
function applyFlowFieldInfluence(
  particle: FlowParticle,
  layout: EcosystemLayout,
  currentVelocity: { x: number; y: number; }
): { x: number; y: number; } {
  const flowVelocity = getFlowFieldVelocity(particle, layout);
  
  // Blend current velocity with flow field (90% current, 10% flow)
  return {
    x: currentVelocity.x * 0.9 + flowVelocity.x * 0.1,
    y: currentVelocity.y * 0.9 + flowVelocity.y * 0.1
  };
}

/**
 * Apply species-specific movement behavior
 */
function applySpeciesBehavior(
  particle: FlowParticle,
  species: Species,
  velocity: { x: number; y: number; }
): { x: number; y: number; } {
  // Add some random variation based on species characteristics
  const randomFactor = species.flowPattern === 'chaotic' ? 0.2 : 0.05;
  
  return {
    x: velocity.x + (Math.random() - 0.5) * randomFactor,
    y: velocity.y + (Math.random() - 0.5) * randomFactor
  };
}

/**
 * Get velocity from flow field at given position
 */
function getFlowFieldVelocity(
  position: { x: number; y: number; },
  layout: EcosystemLayout
): { x: number; y: number; } {
  const { flowFields } = layout;
  
  // Find grid cell
  const gridSize = 40;
  const col = Math.floor(position.x / gridSize);
  const row = Math.floor(position.y / gridSize);
  
  // Bounds check
  if (row < 0 || row >= flowFields.length || col < 0 || col >= flowFields[0].length) {
    return { x: 0, y: 1 }; // Default downward flow
  }
  
  const cell = flowFields[row][col];
  
  // Add turbulence
  const turbulenceX = (Math.random() - 0.5) * cell.turbulence;
  const turbulenceY = (Math.random() - 0.5) * cell.turbulence;
  
  return {
    x: cell.velocity.x + turbulenceX,
    y: cell.velocity.y + turbulenceY
  };
}

/**
 * Handle boundary conditions for particles
 */
function handleBoundaries(
  x: number,
  y: number,
  velocity: { x: number; y: number; },
  layout: EcosystemLayout
): { x: number; y: number; velocity: { x: number; y: number; } } {
  const margin = 50;
  const width = 1200; // Default canvas width
  const height = 800;  // Default canvas height
  
  let newX = x;
  let newY = y;
  let newVelocity = { ...velocity };
  
  // Horizontal boundaries - soft bounce
  if (newX < margin) {
    newX = margin;
    newVelocity.x = Math.abs(newVelocity.x) * 0.8; // Damped bounce
  } else if (newX > width - margin) {
    newX = width - margin;
    newVelocity.x = -Math.abs(newVelocity.x) * 0.8;
  }
  
  // Vertical boundaries - wrap around (river flow)
  if (newY > height + margin) {
    newY = -margin; // Flow from top again
  }
  
  return { x: newX, y: newY, velocity: newVelocity };
}

/**
 * Recycle old particles by repositioning them at the top
 */
function recycleParticle(
  particle: FlowParticle,
  species: Species,
  layout: EcosystemLayout
): FlowParticle {
  // Find species position to respawn near
  const speciesPos = layout.speciesPositions.get(species.id) || { x: 600, y: 100 };
  
  return {
    ...particle,
    x: speciesPos.x + (Math.random() - 0.5) * species.territorySize,
    y: speciesPos.y - 100, // Spawn above current position
    age: 0,
    lifespan: 300 + Math.random() * 200,
    velocity: getInitialVelocity(species, layout, speciesPos)
  };
}

/**
 * Calculate dynamic brightness based on particle age and species health
 */
function calculateBrightness(
  particle: FlowParticle,
  species: Species,
  age: number
): number {
  // Age-based brightness (fade in/out)
  const lifeRatio = age / particle.lifespan;
  const ageBrightness = lifeRatio < 0.1 ? lifeRatio * 10 : // Fade in
                       lifeRatio > 0.9 ? (1 - lifeRatio) * 10 : // Fade out
                       1; // Full brightness in middle of life
  
  // Population health affects brightness
  const populationFactor = Math.min(species.population / 1000000, 1); // Normalize
  
  return particle.brightness * ageBrightness * (0.5 + populationFactor * 0.5);
}

/**
 * Calculate distance between two particles
 */
function distance(p1: FlowParticle, p2: FlowParticle): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}