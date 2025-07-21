/**
 * TreeViewSonnet - Living River Ecosystem Visualization
 * 
 * An innovative evolution visualization that represents species as flowing particles
 * in a river ecosystem, with time flowing downward like gravity.
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Species, FlowParticle, TreeViewSonnetProps, EcosystemLayout, AnimationFrame } from './types';
import { computeEcosystemLayout, createSpeciesParticles, updateParticles } from './utils';
import { ColorUtils, AnimationUtils, PerformanceUtils } from './utils';

// Hardcoded rich example data for the Living River Ecosystem
const SAMPLE_ECOSYSTEM_DATA: Species[] = [
  {
    id: 'primordial-1',
    name: 'Primordial Bubbler',
    parentId: null,
    birthTurn: 1,
    primaryColor: '#4ECDC4',
    secondaryColor: '#45B7B8',
    size: 1.0,
    opacity: 0.8,
    particleCount: 15,
    biome: 'deep-ocean',
    climate: 'abyssal',
    depth: 800,
    mobility: 'slow-drifter',
    groupBehavior: 'colonial',
    flowPattern: 'meandering',
    population: 50000,
    traits: ['bioluminescent', 'filter-feeder', 'colonial-builder'],
    territorySize: 40,
    soundSignature: {
      frequency: 80,
      rhythm: 'constant',
      volume: 0.3,
      timbre: 'bubbles'
    },
    birthAnimation: 'bubble-burst',
    extinctionAnimation: 'fade-away',
    temperatureTolerance: { min: 2, max: 8 },
    pressureTolerance: { min: 50, max: 100 },
    oxygenRequirement: 0.1
  },
  {
    id: 'thermal-explorer',
    name: 'Thermal Vent Explorer',
    parentId: 'primordial-1',
    birthTurn: 2,
    primaryColor: '#FF6B47',
    secondaryColor: '#FF8C42',
    size: 0.8,
    opacity: 0.9,
    particleCount: 12,
    biome: 'deep-ocean',
    climate: 'volcanic',
    depth: 900,
    mobility: 'active-swimmer',
    groupBehavior: 'small-pods',
    flowPattern: 'spiral',
    population: 25000,
    traits: ['heat-resistant', 'chemosynthetic', 'rapid-reproduction'],
    territorySize: 30,
    competitors: [],
    symbioticPartners: ['primordial-1'],
    soundSignature: {
      frequency: 120,
      rhythm: 'pulsing',
      volume: 0.4,
      timbre: 'whale-song'
    },
    birthAnimation: 'dramatic-splash',
    extinctionAnimation: 'dissolve',
    temperatureTolerance: { min: 15, max: 50 },
    pressureTolerance: { min: 80, max: 120 },
    oxygenRequirement: 0.05
  },
  {
    id: 'coral-architect',
    name: 'Coral Reef Architect',
    parentId: 'primordial-1',
    birthTurn: 3,
    primaryColor: '#FF9F43',
    secondaryColor: '#FFC048',
    size: 1.2,
    opacity: 0.7,
    particleCount: 20,
    biome: 'coral-reefs',
    climate: 'tropical',
    depth: 50,
    mobility: 'sessile',
    groupBehavior: 'colonial',
    flowPattern: 'straight',
    population: 100000,
    traits: ['calcium-carbonate-builder', 'symbiotic', 'photosynthetic-partner'],
    territorySize: 60,
    symbioticPartners: ['algae-symbiont', 'reef-cleaner'],
    soundSignature: {
      frequency: 200,
      rhythm: 'harmonic',
      volume: 0.2,
      timbre: 'current'
    },
    birthAnimation: 'gentle-emerge',
    extinctionAnimation: 'scatter',
    temperatureTolerance: { min: 20, max: 30 },
    pressureTolerance: { min: 4, max: 6 },
    oxygenRequirement: 0.8
  },
  {
    id: 'kelp-giant',
    name: 'Towering Kelp Giant',
    parentId: 'coral-architect',
    birthTurn: 4,
    primaryColor: '#2E7D32',
    secondaryColor: '#388E3C',
    size: 2.5,
    opacity: 0.6,
    particleCount: 35,
    biome: 'kelp-forests',
    climate: 'temperate',
    depth: 30,
    mobility: 'sessile',
    groupBehavior: 'colonial',
    flowPattern: 'straight',
    population: 75000,
    traits: ['rapid-growth', 'current-filter', 'ecosystem-engineer'],
    territorySize: 80,
    soundSignature: {
      frequency: 40,
      rhythm: 'constant',
      volume: 0.15,
      timbre: 'current'
    },
    birthAnimation: 'gentle-emerge',
    extinctionAnimation: 'sink-down',
    temperatureTolerance: { min: 8, max: 18 },
    pressureTolerance: { min: 2, max: 4 },
    oxygenRequirement: 0.9
  },
  {
    id: 'swift-hunter',
    name: 'Swift Current Hunter',
    parentId: 'thermal-explorer',
    birthTurn: 4,
    primaryColor: '#3498DB',
    secondaryColor: '#5DADE2',
    size: 0.6,
    opacity: 1.0,
    particleCount: 25,
    biome: 'shallow-seas',
    climate: 'temperate',
    depth: 100,
    mobility: 'rapid-hunter',
    groupBehavior: 'large-schools',
    flowPattern: 'chaotic',
    population: 200000,
    traits: ['high-speed', 'echolocation', 'pack-coordination'],
    territorySize: 25,
    preySpecies: ['thermal-explorer'],
    competitors: ['apex-predator'],
    soundSignature: {
      frequency: 300,
      rhythm: 'irregular',
      volume: 0.6,
      timbre: 'dolphin-click'
    },
    birthAnimation: 'flow-split',
    extinctionAnimation: 'scatter',
    temperatureTolerance: { min: 10, max: 25 },
    pressureTolerance: { min: 8, max: 15 },
    oxygenRequirement: 0.7
  }
];

export function TreeViewSonnet({
  species = SAMPLE_ECOSYSTEM_DATA,
  currentTurn = 4,
  width = 1200,
  height = 800,
  onSpeciesClick,
  onSpeciesHover,
  enableParticleEffects = true,
  maxParticlesPerSpecies = 50
}: TreeViewSonnetProps) {
  // Refs for canvas and animation
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const lastFrameTimeRef = useRef<number>(0);
  const frameTimesRef = useRef<number[]>([]);
  
  // State management
  const [layout, setLayout] = useState<EcosystemLayout | null>(null);
  const [particles, setParticles] = useState<Map<string, FlowParticle[]>>(new Map());
  const [selectedSpeciesId, setSelectedSpeciesId] = useState<string | null>(null);
  const [hoveredSpeciesId, setHoveredSpeciesId] = useState<string | null>(null);
  const [performance, setPerformance] = useState({ fps: 60, particleCount: 0, renderTime: 0 });
  const [isPlaying, setIsPlaying] = useState(true);
  
  // Initialize layout and particles
  useEffect(() => {
    const newLayout = computeEcosystemLayout(species, width, height);
    setLayout(newLayout);
    
    // Create initial particles for each species
    const speciesMap = new Map(species.map(s => [s.id, s]));
    const initialParticles = new Map<string, FlowParticle[]>();
    
    species.forEach(s => {
      const position = newLayout.speciesPositions.get(s.id);
      if (position && enableParticleEffects) {
        const speciesParticles = createSpeciesParticles(s, position, newLayout);
        initialParticles.set(s.id, speciesParticles);
      }
    });
    
    setParticles(initialParticles);
  }, [species, width, height, enableParticleEffects]);
  
  // Animation loop
  const animate = useCallback((timestamp: number) => {
    if (!layout || !canvasRef.current) {
      animationRef.current = requestAnimationFrame(animate);
      return;
    }
    
    const deltaTime = timestamp - lastFrameTimeRef.current;
    lastFrameTimeRef.current = timestamp;
    
    // Track frame times for FPS calculation
    frameTimesRef.current.push(deltaTime);
    if (frameTimesRef.current.length > 60) {
      frameTimesRef.current.shift();
    }
    
    if (isPlaying && enableParticleEffects) {
      // Update particles
      const speciesMap = new Map(species.map(s => [s.id, s]));
      const updatedParticles = new Map<string, FlowParticle[]>();
      let totalParticles = 0;
      
      particles.forEach((speciesParticles, speciesId) => {
        const updated = updateParticles(speciesParticles, speciesMap, layout, deltaTime);
        updatedParticles.set(speciesId, updated);
        totalParticles += updated.length;
      });
      
      setParticles(updatedParticles);
      
      // Update performance metrics
      if (frameTimesRef.current.length > 10) {
        const fps = PerformanceUtils.calculateFPS(frameTimesRef.current);
        setPerformance(prev => ({
          ...prev,
          fps,
          particleCount: totalParticles,
          renderTime: deltaTime
        }));
      }
    }
    
    // Render the scene
    renderEcosystem(timestamp);
    
    animationRef.current = requestAnimationFrame(animate);
  }, [layout, particles, species, isPlaying, enableParticleEffects]);
  
  // Start animation loop
  useEffect(() => {
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animate]);
  
  // Render ecosystem to canvas
  const renderEcosystem = useCallback((timestamp: number) => {
    const canvas = canvasRef.current;
    if (!canvas || !layout) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas with gradient background (deep ocean to surface)
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#001122'); // Deep ocean
    gradient.addColorStop(0.4, '#003366'); // Mid-depth
    gradient.addColorStop(0.8, '#006699'); // Shallow
    gradient.addColorStop(1, '#0088CC');   // Surface
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Render ecosystem zones (biome background areas)
    layout.ecosystemZones.forEach(zone => {
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = zone.color;
      ctx.beginPath();
      ctx.arc(zone.center.x, zone.center.y, zone.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    
    // Render streams (flowing connections between species)
    ctx.save();
    ctx.globalAlpha = 0.4;
    layout.streamPaths.forEach((path, streamId) => {
      if (path.length < 2) return;
      
      // Create flowing stream effect
      const streamGradient = ctx.createLinearGradient(
        path[0].x, path[0].y,
        path[path.length - 1].x, path[path.length - 1].y
      );
      streamGradient.addColorStop(0, '#4ECDC4');
      streamGradient.addColorStop(0.5, '#45B7B8');
      streamGradient.addColorStop(1, '#26A0DA');
      
      ctx.strokeStyle = streamGradient;
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      // Draw flowing stream path
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      
      // Use quadratic curves for smooth flow
      for (let i = 1; i < path.length - 1; i++) {
        const current = path[i];
        const next = path[i + 1];
        const cpx = current.x + (next.x - current.x) * 0.5;
        const cpy = current.y + (next.y - current.y) * 0.5;
        ctx.quadraticCurveTo(current.x, current.y, cpx, cpy);
      }
      
      const lastPoint = path[path.length - 1];
      ctx.lineTo(lastPoint.x, lastPoint.y);
      ctx.stroke();
      
      // Add flow direction indicators (moving dots)
      const flowOffset = (timestamp * 0.002) % 1;
      for (let i = 0; i < 3; i++) {
        const t = (i / 3 + flowOffset) % 1;
        const pointIndex = Math.floor(t * (path.length - 1));
        const point = path[pointIndex];
        
        ctx.save();
        ctx.globalAlpha = 0.6 * (1 - Math.abs(t - 0.5) * 2); // Fade at ends
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
    ctx.restore();
    
    // Render particles (flowing organisms)
    if (enableParticleEffects) {
      particles.forEach((speciesParticles, speciesId) => {
        const speciesData = species.find(s => s.id === speciesId);
        if (!speciesData) return;
        
        speciesParticles.forEach(particle => {
          ctx.save();
          ctx.globalAlpha = particle.brightness * speciesData.opacity;
          
          // Species color with size-based variation
          const particleColor = ColorUtils.adjustBrightness(
            speciesData.primaryColor, 
            particle.brightness
          );
          
          // Create particle glow effect
          const glowGradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 8
          );
          glowGradient.addColorStop(0, particleColor);
          glowGradient.addColorStop(0.5, particleColor + '80'); // Semi-transparent
          glowGradient.addColorStop(1, 'transparent');
          
          ctx.fillStyle = glowGradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 8, 0, Math.PI * 2);
          ctx.fill();
          
          // Core particle
          ctx.fillStyle = particleColor;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
          ctx.fill();
          
          // Leader particles get special highlighting
          if (particle.isLeader) {
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size * 5, 0, Math.PI * 2);
            ctx.stroke();
          }
          
          ctx.restore();
        });
      });
    }
    
    // Render species positions (central hubs)
    species.forEach(s => {
      const position = layout.speciesPositions.get(s.id);
      if (!position) return;
      
      ctx.save();
      
      // Highlight selected/hovered species
      if (selectedSpeciesId === s.id || hoveredSpeciesId === s.id) {
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(position.x, position.y, s.size * 25 + 10, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Species hub circle
      const hubGradient = ctx.createRadialGradient(
        position.x, position.y, 0,
        position.x, position.y, s.size * 20
      );
      hubGradient.addColorStop(0, s.primaryColor);
      hubGradient.addColorStop(0.7, s.secondaryColor || s.primaryColor);
      hubGradient.addColorStop(1, ColorUtils.adjustBrightness(s.primaryColor, 0.5));
      
      ctx.globalAlpha = s.opacity;
      ctx.fillStyle = hubGradient;
      ctx.beginPath();
      ctx.arc(position.x, position.y, s.size * 20, 0, Math.PI * 2);
      ctx.fill();
      
      // Species name label
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(s.name, position.x, position.y - s.size * 25 - 15);
      
      // Turn indicator
      ctx.font = '10px Arial';
      ctx.fillText(`T${s.birthTurn}`, position.x, position.y - s.size * 25 - 2);
      
      // Population indicator (size-coded)
      ctx.font = '9px Arial';
      ctx.fillText(
        `Pop: ${(s.population / 1000).toFixed(0)}K`, 
        position.x, 
        position.y + s.size * 25 + 15
      );
      
      ctx.restore();
    });
  }, [layout, particles, species, selectedSpeciesId, hoveredSpeciesId, enableParticleEffects, width, height]);
  
  // Handle canvas interactions
  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!layout) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Find clicked species
    let clickedSpecies: Species | null = null;
    let minDistance = Infinity;
    
    species.forEach(s => {
      const position = layout.speciesPositions.get(s.id);
      if (position) {
        const distance = Math.sqrt((x - position.x) ** 2 + (y - position.y) ** 2);
        if (distance < s.size * 25 && distance < minDistance) {
          minDistance = distance;
          clickedSpecies = s;
        }
      }
    });
    
    if (clickedSpecies) {
      setSelectedSpeciesId(clickedSpecies.id);
      onSpeciesClick?.(clickedSpecies.id);
    } else {
      setSelectedSpeciesId(null);
    }
  }, [layout, species, onSpeciesClick]);
  
  const handleCanvasMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!layout) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Find hovered species
    let hoveredSpecies: Species | null = null;
    let minDistance = Infinity;
    
    species.forEach(s => {
      const position = layout.speciesPositions.get(s.id);
      if (position) {
        const distance = Math.sqrt((x - position.x) ** 2 + (y - position.y) ** 2);
        if (distance < s.size * 25 && distance < minDistance) {
          minDistance = distance;
          hoveredSpecies = s;
        }
      }
    });
    
    const newHoveredId = hoveredSpecies?.id || null;
    if (newHoveredId !== hoveredSpeciesId) {
      setHoveredSpeciesId(newHoveredId);
      onSpeciesHover?.(newHoveredId);
    }
  }, [layout, species, hoveredSpeciesId, onSpeciesHover]);
  
  // Control handlers
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };
  
  const handleReset = () => {
    // Reset particles
    if (layout) {
      const speciesMap = new Map(species.map(s => [s.id, s]));
      const resetParticles = new Map<string, FlowParticle[]>();
      
      species.forEach(s => {
        const position = layout.speciesPositions.get(s.id);
        if (position && enableParticleEffects) {
          const speciesParticles = createSpeciesParticles(s, position, layout);
          resetParticles.set(s.id, speciesParticles);
        }
      });
      
      setParticles(resetParticles);
    }
  };
  
  return (
    <div className="tree-view-sonnet-container" style={{ width, height, position: 'relative' }}>
      {/* Main Canvas */}
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        style={{
          border: '2px solid #2C3E50',
          borderRadius: '8px',
          background: 'linear-gradient(to bottom, #001122, #0088CC)',
          cursor: 'pointer'
        }}
      />
      
      {/* UI Overlay */}
      <div style={{
        position: 'absolute',
        top: 10,
        left: 10,
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '12px',
        fontFamily: 'monospace'
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#4ECDC4' }}>Living River Ecosystem</h4>
        <div>Species: {species.length}</div>
        <div>Turn: {currentTurn}</div>
        <div>FPS: {performance.fps}</div>
        <div>Particles: {performance.particleCount}</div>
        {selectedSpeciesId && (
          <div style={{ marginTop: '8px', borderTop: '1px solid #444', paddingTop: '8px' }}>
            <strong>Selected: {species.find(s => s.id === selectedSpeciesId)?.name}</strong>
          </div>
        )}
      </div>
      
      {/* Controls */}
      <div style={{
        position: 'absolute',
        top: 10,
        right: 10,
        background: 'rgba(0, 0, 0, 0.7)',
        padding: '12px',
        borderRadius: '8px',
        display: 'flex',
        gap: '8px'
      }}>
        <button
          onClick={handlePlayPause}
          style={{
            padding: '8px 16px',
            background: isPlaying ? '#E74C3C' : '#27AE60',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isPlaying ? '⏸️ Pause' : '▶️ Play'}
        </button>
        
        <button
          onClick={handleReset}
          style={{
            padding: '8px 16px',
            background: '#3498DB',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          🔄 Reset
        </button>
      </div>
      
      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: 10,
        left: 10,
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '12px',
        borderRadius: '8px',
        fontSize: '11px',
        maxWidth: '300px'
      }}>
        <h5 style={{ margin: '0 0 6px 0', color: '#4ECDC4' }}>🌊 Living River Legend</h5>
        <div>• Large hubs = Species locations</div>
        <div>• Flowing streams = Evolution paths</div>
        <div>• Moving particles = Individual organisms</div>
        <div>• Biome zones = Environmental areas</div>
        <div>• Click species to select, hover for details</div>
      </div>
      
      {/* Species Details Panel */}
      {selectedSpeciesId && (
        <SpeciesDetailsPanel 
          species={species.find(s => s.id === selectedSpeciesId)!}
          onClose={() => setSelectedSpeciesId(null)}
        />
      )}
    </div>
  );
}

// Species details panel component
interface SpeciesDetailsPanelProps {
  species: Species;
  onClose: () => void;
}

function SpeciesDetailsPanel({ species, onClose }: SpeciesDetailsPanelProps) {
  return (
    <div style={{
      position: 'absolute',
      top: '50%',
      right: 20,
      transform: 'translateY(-50%)',
      background: 'rgba(0, 30, 60, 0.95)',
      color: 'white',
      padding: '20px',
      borderRadius: '12px',
      border: `2px solid ${species.primaryColor}`,
      minWidth: '280px',
      maxWidth: '320px',
      fontSize: '13px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: species.primaryColor }}>{species.name}</h3>
        <button 
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          ×
        </button>
      </div>
      
      <div style={{ display: 'grid', gap: '8px' }}>
        <div><strong>Born:</strong> Turn {species.birthTurn}</div>
        <div><strong>Population:</strong> {species.population.toLocaleString()}</div>
        <div><strong>Biome:</strong> {species.biome.replace('-', ' ')}</div>
        <div><strong>Climate:</strong> {species.climate}</div>
        <div><strong>Depth:</strong> {species.depth}m</div>
        <div><strong>Mobility:</strong> {species.mobility.replace('-', ' ')}</div>
        <div><strong>Behavior:</strong> {species.groupBehavior.replace('-', ' ')}</div>
        
        <div style={{ borderTop: '1px solid #444', paddingTop: '8px', marginTop: '8px' }}>
          <strong>Traits:</strong>
          <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {species.traits.map((trait, i) => (
              <span key={i} style={{
                background: species.primaryColor,
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '10px'
              }}>
                {trait}
              </span>
            ))}
          </div>
        </div>
        
        {species.soundSignature && (
          <div style={{ borderTop: '1px solid #444', paddingTop: '8px', marginTop: '8px' }}>
            <strong>Sound:</strong> {species.soundSignature.frequency}Hz {species.soundSignature.timbre}
          </div>
        )}
      </div>
    </div>
  );
}

export default TreeViewSonnet;

// SOUND DESIGN IDEAS (for implementation later):
// - Each species has a unique frequency signature
// - Deeper species = lower frequencies (whale songs)
// - Shallow species = higher frequencies (dolphin clicks) 
// - Population size affects volume
// - Biome creates background soundscape
// - Evolution events trigger harmonic transitions
// - Particle movement creates subtle water sounds