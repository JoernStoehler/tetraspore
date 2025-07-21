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
    });\n    ctx.restore();\n    \n    // Render particles (flowing organisms)\n    if (enableParticleEffects) {\n      particles.forEach((speciesParticles, speciesId) => {\n        const speciesData = species.find(s => s.id === speciesId);\n        if (!speciesData) return;\n        \n        speciesParticles.forEach(particle => {\n          ctx.save();\n          ctx.globalAlpha = particle.brightness * speciesData.opacity;\n          \n          // Species color with size-based variation\n          const particleColor = ColorUtils.adjustBrightness(\n            speciesData.primaryColor, \n            particle.brightness\n          );\n          \n          // Create particle glow effect\n          const glowGradient = ctx.createRadialGradient(\n            particle.x, particle.y, 0,\n            particle.x, particle.y, particle.size * 8\n          );\n          glowGradient.addColorStop(0, particleColor);\n          glowGradient.addColorStop(0.5, particleColor + '80'); // Semi-transparent\n          glowGradient.addColorStop(1, 'transparent');\n          \n          ctx.fillStyle = glowGradient;\n          ctx.beginPath();\n          ctx.arc(particle.x, particle.y, particle.size * 8, 0, Math.PI * 2);\n          ctx.fill();\n          \n          // Core particle\n          ctx.fillStyle = particleColor;\n          ctx.beginPath();\n          ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);\n          ctx.fill();\n          \n          // Leader particles get special highlighting\n          if (particle.isLeader) {\n            ctx.strokeStyle = '#FFFFFF';\n            ctx.lineWidth = 1;\n            ctx.beginPath();\n            ctx.arc(particle.x, particle.y, particle.size * 5, 0, Math.PI * 2);\n            ctx.stroke();\n          }\n          \n          ctx.restore();\n        });\n      });\n    }\n    \n    // Render species positions (central hubs)\n    species.forEach(s => {\n      const position = layout.speciesPositions.get(s.id);\n      if (!position) return;\n      \n      ctx.save();\n      \n      // Highlight selected/hovered species\n      if (selectedSpeciesId === s.id || hoveredSpeciesId === s.id) {\n        ctx.globalAlpha = 0.8;\n        ctx.fillStyle = '#FFFFFF';\n        ctx.beginPath();\n        ctx.arc(position.x, position.y, s.size * 25 + 10, 0, Math.PI * 2);\n        ctx.fill();\n      }\n      \n      // Species hub circle\n      const hubGradient = ctx.createRadialGradient(\n        position.x, position.y, 0,\n        position.x, position.y, s.size * 20\n      );\n      hubGradient.addColorStop(0, s.primaryColor);\n      hubGradient.addColorStop(0.7, s.secondaryColor || s.primaryColor);\n      hubGradient.addColorStop(1, ColorUtils.adjustBrightness(s.primaryColor, 0.5));\n      \n      ctx.globalAlpha = s.opacity;\n      ctx.fillStyle = hubGradient;\n      ctx.beginPath();\n      ctx.arc(position.x, position.y, s.size * 20, 0, Math.PI * 2);\n      ctx.fill();\n      \n      // Species name label\n      ctx.globalAlpha = 1;\n      ctx.fillStyle = '#FFFFFF';\n      ctx.font = '12px Arial';\n      ctx.textAlign = 'center';\n      ctx.fillText(s.name, position.x, position.y - s.size * 25 - 15);\n      \n      // Turn indicator\n      ctx.font = '10px Arial';\n      ctx.fillText(`T${s.birthTurn}`, position.x, position.y - s.size * 25 - 2);\n      \n      // Population indicator (size-coded)\n      ctx.font = '9px Arial';\n      ctx.fillText(\n        `Pop: ${(s.population / 1000).toFixed(0)}K`, \n        position.x, \n        position.y + s.size * 25 + 15\n      );\n      \n      ctx.restore();\n    });\n  }, [layout, particles, species, selectedSpeciesId, hoveredSpeciesId, enableParticleEffects, width, height]);\n  \n  // Handle canvas interactions\n  const handleCanvasClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {\n    if (!layout) return;\n    \n    const rect = canvasRef.current?.getBoundingClientRect();\n    if (!rect) return;\n    \n    const x = event.clientX - rect.left;\n    const y = event.clientY - rect.top;\n    \n    // Find clicked species\n    let clickedSpecies: Species | null = null;\n    let minDistance = Infinity;\n    \n    species.forEach(s => {\n      const position = layout.speciesPositions.get(s.id);\n      if (position) {\n        const distance = Math.sqrt((x - position.x) ** 2 + (y - position.y) ** 2);\n        if (distance < s.size * 25 && distance < minDistance) {\n          minDistance = distance;\n          clickedSpecies = s;\n        }\n      }\n    });\n    \n    if (clickedSpecies) {\n      setSelectedSpeciesId(clickedSpecies.id);\n      onSpeciesClick?.(clickedSpecies.id);\n    } else {\n      setSelectedSpeciesId(null);\n    }\n  }, [layout, species, onSpeciesClick]);\n  \n  const handleCanvasMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {\n    if (!layout) return;\n    \n    const rect = canvasRef.current?.getBoundingClientRect();\n    if (!rect) return;\n    \n    const x = event.clientX - rect.left;\n    const y = event.clientY - rect.top;\n    \n    // Find hovered species\n    let hoveredSpecies: Species | null = null;\n    let minDistance = Infinity;\n    \n    species.forEach(s => {\n      const position = layout.speciesPositions.get(s.id);\n      if (position) {\n        const distance = Math.sqrt((x - position.x) ** 2 + (y - position.y) ** 2);\n        if (distance < s.size * 25 && distance < minDistance) {\n          minDistance = distance;\n          hoveredSpecies = s;\n        }\n      }\n    });\n    \n    const newHoveredId = hoveredSpecies?.id || null;\n    if (newHoveredId !== hoveredSpeciesId) {\n      setHoveredSpeciesId(newHoveredId);\n      onSpeciesHover?.(newHoveredId);\n    }\n  }, [layout, species, hoveredSpeciesId, onSpeciesHover]);\n  \n  // Control handlers\n  const handlePlayPause = () => {\n    setIsPlaying(!isPlaying);\n  };\n  \n  const handleReset = () => {\n    // Reset particles\n    if (layout) {\n      const speciesMap = new Map(species.map(s => [s.id, s]));\n      const resetParticles = new Map<string, FlowParticle[]>();\n      \n      species.forEach(s => {\n        const position = layout.speciesPositions.get(s.id);\n        if (position && enableParticleEffects) {\n          const speciesParticles = createSpeciesParticles(s, position, layout);\n          resetParticles.set(s.id, speciesParticles);\n        }\n      });\n      \n      setParticles(resetParticles);\n    }\n  };\n  \n  return (\n    <div className=\"tree-view-sonnet-container\" style={{ width, height, position: 'relative' }}>\n      {/* Main Canvas */}\n      <canvas\n        ref={canvasRef}\n        width={width}\n        height={height}\n        onClick={handleCanvasClick}\n        onMouseMove={handleCanvasMouseMove}\n        style={{\n          border: '2px solid #2C3E50',\n          borderRadius: '8px',\n          background: 'linear-gradient(to bottom, #001122, #0088CC)',\n          cursor: 'pointer'\n        }}\n      />\n      \n      {/* UI Overlay */}\n      <div style={{\n        position: 'absolute',\n        top: 10,\n        left: 10,\n        background: 'rgba(0, 0, 0, 0.7)',\n        color: 'white',\n        padding: '12px',\n        borderRadius: '8px',\n        fontSize: '12px',\n        fontFamily: 'monospace'\n      }}>\n        <h4 style={{ margin: '0 0 8px 0', color: '#4ECDC4' }}>Living River Ecosystem</h4>\n        <div>Species: {species.length}</div>\n        <div>Turn: {currentTurn}</div>\n        <div>FPS: {performance.fps}</div>\n        <div>Particles: {performance.particleCount}</div>\n        {selectedSpeciesId && (\n          <div style={{ marginTop: '8px', borderTop: '1px solid #444', paddingTop: '8px' }}>\n            <strong>Selected: {species.find(s => s.id === selectedSpeciesId)?.name}</strong>\n          </div>\n        )}\n      </div>\n      \n      {/* Controls */}\n      <div style={{\n        position: 'absolute',\n        top: 10,\n        right: 10,\n        background: 'rgba(0, 0, 0, 0.7)',\n        padding: '12px',\n        borderRadius: '8px',\n        display: 'flex',\n        gap: '8px'\n      }}>\n        <button\n          onClick={handlePlayPause}\n          style={{\n            padding: '8px 16px',\n            background: isPlaying ? '#E74C3C' : '#27AE60',\n            color: 'white',\n            border: 'none',\n            borderRadius: '4px',\n            cursor: 'pointer'\n          }}\n        >\n          {isPlaying ? '⏸️ Pause' : '▶️ Play'}\n        </button>\n        \n        <button\n          onClick={handleReset}\n          style={{\n            padding: '8px 16px',\n            background: '#3498DB',\n            color: 'white',\n            border: 'none',\n            borderRadius: '4px',\n            cursor: 'pointer'\n          }}\n        >\n          🔄 Reset\n        </button>\n      </div>\n      \n      {/* Legend */}\n      <div style={{\n        position: 'absolute',\n        bottom: 10,\n        left: 10,\n        background: 'rgba(0, 0, 0, 0.7)',\n        color: 'white',\n        padding: '12px',\n        borderRadius: '8px',\n        fontSize: '11px',\n        maxWidth: '300px'\n      }}>\n        <h5 style={{ margin: '0 0 6px 0', color: '#4ECDC4' }}>🌊 Living River Legend</h5>\n        <div>• Large hubs = Species locations</div>\n        <div>• Flowing streams = Evolution paths</div>\n        <div>• Moving particles = Individual organisms</div>\n        <div>• Biome zones = Environmental areas</div>\n        <div>• Click species to select, hover for details</div>\n      </div>\n      \n      {/* Species Details Panel */}\n      {selectedSpeciesId && (\n        <SpeciesDetailsPanel \n          species={species.find(s => s.id === selectedSpeciesId)!}\n          onClose={() => setSelectedSpeciesId(null)}\n        />\n      )}\n    </div>\n  );\n}\n\n// Species details panel component\ninterface SpeciesDetailsPanelProps {\n  species: Species;\n  onClose: () => void;\n}\n\nfunction SpeciesDetailsPanel({ species, onClose }: SpeciesDetailsPanelProps) {\n  return (\n    <div style={{\n      position: 'absolute',\n      top: '50%',\n      right: 20,\n      transform: 'translateY(-50%)',\n      background: 'rgba(0, 30, 60, 0.95)',\n      color: 'white',\n      padding: '20px',\n      borderRadius: '12px',\n      border: `2px solid ${species.primaryColor}`,\n      minWidth: '280px',\n      maxWidth: '320px',\n      fontSize: '13px'\n    }}>\n      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>\n        <h3 style={{ margin: 0, color: species.primaryColor }}>{species.name}</h3>\n        <button \n          onClick={onClose}\n          style={{\n            background: 'transparent',\n            border: 'none',\n            color: 'white',\n            fontSize: '18px',\n            cursor: 'pointer',\n            padding: '4px'\n          }}\n        >\n          ×\n        </button>\n      </div>\n      \n      <div style={{ display: 'grid', gap: '8px' }}>\n        <div><strong>Born:</strong> Turn {species.birthTurn}</div>\n        <div><strong>Population:</strong> {species.population.toLocaleString()}</div>\n        <div><strong>Biome:</strong> {species.biome.replace('-', ' ')}</div>\n        <div><strong>Climate:</strong> {species.climate}</div>\n        <div><strong>Depth:</strong> {species.depth}m</div>\n        <div><strong>Mobility:</strong> {species.mobility.replace('-', ' ')}</div>\n        <div><strong>Behavior:</strong> {species.groupBehavior.replace('-', ' ')}</div>\n        \n        <div style={{ borderTop: '1px solid #444', paddingTop: '8px', marginTop: '8px' }}>\n          <strong>Traits:</strong>\n          <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>\n            {species.traits.map((trait, i) => (\n              <span key={i} style={{\n                background: species.primaryColor,\n                padding: '2px 6px',\n                borderRadius: '10px',\n                fontSize: '10px'\n              }}>\n                {trait}\n              </span>\n            ))}\n          </div>\n        </div>\n        \n        {species.soundSignature && (\n          <div style={{ borderTop: '1px solid #444', paddingTop: '8px', marginTop: '8px' }}>\n            <strong>Sound:</strong> {species.soundSignature.frequency}Hz {species.soundSignature.timbre}\n          </div>\n        )}\n      </div>\n    </div>\n  );\n}\n\nexport default TreeViewSonnet;\n\n// SOUND DESIGN IDEAS (for implementation later):\n// - Each species has a unique frequency signature\n// - Deeper species = lower frequencies (whale songs)\n// - Shallow species = higher frequencies (dolphin clicks) \n// - Population size affects volume\n// - Biome creates background soundscape\n// - Evolution events trigger harmonic transitions\n// - Particle movement creates subtle water sounds