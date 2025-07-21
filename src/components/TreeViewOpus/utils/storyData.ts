/**
 * Example data generators for Storybook stories
 */

import { TapestrySpecies } from '../types/Species';

// Generate basic species for simple demo
export function generateBasicSpecies(): TapestrySpecies[] {
  return [
    {
      id: 'root-1',
      name: 'Primordial Weaver',
      parentId: null,
      birthTurn: 0,
      threadColor: {
        primary: '#00a8cc',
        secondary: '#0e7490',
        luminosity: 0.9
      },
      threadTexture: 'ethereal',
      threadThickness: 12,
      weavingStyle: {
        pattern: 'loose',
        frequency: 0.3,
        amplitude: 30
      },
      vitality: {
        current: 0.8,
        peak: 1.0,
        trend: 'stable'
      },
      habitat: {
        layer: 'middle',
        temperature: 'temperate',
        moisture: 'moderate'
      },
      traits: {
        mobility: 'slow',
        sociability: 'solitary',
        metabolism: 'photosynthetic',
        reproduction: 'budding'
      },
      relationships: {
        symbioticPartners: [],
        predators: [],
        prey: [],
        competitors: []
      },
      audioSignature: {
        tone: 'ambient',
        frequency: 200,
        volume: 0.5
      },
      pressure: {
        environmental: 0.2,
        predation: 0,
        competition: 0.1,
        disease: 0.1
      },
      effects: {
        sparkles: true,
        pulses: true,
        trails: false,
        aura: 'soft'
      },
      lore: {
        origin: 'The first thread in the tapestry of life',
        achievement: 'Discovered photosynthesis',
        challenge: 'Adapting to changing light conditions'
      }
    },
    {
      id: 'branch-1',
      name: 'Crystal Spinner',
      parentId: 'root-1',
      birthTurn: 3,
      threadColor: {
        primary: '#a78bfa',
        secondary: '#7c3aed',
        luminosity: 0.7
      },
      threadTexture: 'metallic',
      threadThickness: 8,
      weavingStyle: {
        pattern: 'spiral',
        frequency: 0.6,
        amplitude: 20
      },
      vitality: {
        current: 0.7,
        peak: 0.8,
        trend: 'rising'
      },
      habitat: {
        layer: 'surface',
        temperature: 'temperate',
        moisture: 'humid'
      },
      traits: {
        mobility: 'moderate',
        sociability: 'pairs',
        metabolism: 'herbivore',
        reproduction: 'sexual'
      },
      relationships: {
        symbioticPartners: [],
        predators: [],
        prey: [],
        competitors: ['branch-2']
      },
      audioSignature: {
        tone: 'harmonic',
        frequency: 440,
        volume: 0.6
      },
      pressure: {
        environmental: 0.3,
        predation: 0.2,
        competition: 0.4,
        disease: 0.2
      },
      effects: {
        sparkles: true,
        pulses: false,
        trails: true,
        aura: 'electric'
      },
      lore: {
        origin: 'Evolved from mineral-rich pools',
        achievement: 'Developed crystalline exoskeleton',
        challenge: 'Competition for surface minerals'
      }
    },
    {
      id: 'branch-2',
      name: 'Mist Dancer',
      parentId: 'root-1',
      birthTurn: 4,
      threadColor: {
        primary: '#10b981',
        secondary: '#059669',
        luminosity: 0.6
      },
      threadTexture: 'silky',
      threadThickness: 10,
      weavingStyle: {
        pattern: 'branching',
        frequency: 0.4,
        amplitude: 35
      },
      vitality: {
        current: 0.9,
        peak: 0.9,
        trend: 'stable'
      },
      habitat: {
        layer: 'aerial',
        temperature: 'temperate',
        moisture: 'humid'
      },
      traits: {
        mobility: 'fast',
        sociability: 'swarms',
        metabolism: 'omnivore',
        reproduction: 'spores'
      },
      relationships: {
        symbioticPartners: ['branch-3'],
        predators: [],
        prey: [],
        competitors: ['branch-1']
      },
      audioSignature: {
        tone: 'rhythmic',
        frequency: 600,
        volume: 0.4
      },
      pressure: {
        environmental: 0.1,
        predation: 0.1,
        competition: 0.4,
        disease: 0.1
      },
      effects: {
        sparkles: false,
        pulses: true,
        trails: true,
        aura: 'mist'
      },
      lore: {
        origin: 'Born in the morning mists',
        achievement: 'Mastered aerial navigation',
        challenge: 'Maintaining moisture in dry seasons'
      }
    },
    {
      id: 'branch-3',
      name: 'Deep Current',
      parentId: 'root-1',
      birthTurn: 5,
      extinctionTurn: 9,
      threadColor: {
        primary: '#3b82f6',
        secondary: '#1e40af',
        luminosity: 0.5
      },
      threadTexture: 'smooth',
      threadThickness: 14,
      weavingStyle: {
        pattern: 'tight',
        frequency: 0.2,
        amplitude: 15
      },
      vitality: {
        current: 0.3,
        peak: 0.7,
        trend: 'declining'
      },
      habitat: {
        layer: 'deep',
        temperature: 'arctic',
        moisture: 'aquatic'
      },
      traits: {
        mobility: 'slow',
        sociability: 'solitary',
        metabolism: 'exotic',
        reproduction: 'asexual'
      },
      relationships: {
        symbioticPartners: ['branch-2'],
        predators: ['predator-1'],
        prey: [],
        competitors: []
      },
      audioSignature: {
        tone: 'ambient',
        frequency: 80,
        volume: 0.8
      },
      pressure: {
        environmental: 0.7,
        predation: 0.8,
        competition: 0.2,
        disease: 0.5
      },
      effects: {
        sparkles: false,
        pulses: true,
        trails: false,
        aura: 'none'
      },
      lore: {
        origin: 'Descended to the deep waters',
        achievement: 'Survived in extreme pressure',
        challenge: 'Could not escape rising predators',
        destiny: 'Became extinct but left genetic legacy'
      }
    },
    {
      id: 'predator-1',
      name: 'Shadow Hunter',
      parentId: 'branch-1',
      birthTurn: 7,
      threadColor: {
        primary: '#ef4444',
        secondary: '#dc2626',
        luminosity: 0.4
      },
      threadTexture: 'rough',
      threadThickness: 9,
      weavingStyle: {
        pattern: 'chaotic',
        frequency: 0.8,
        amplitude: 25
      },
      vitality: {
        current: 0.9,
        peak: 0.9,
        trend: 'rising'
      },
      habitat: {
        layer: 'deep',
        temperature: 'temperate',
        moisture: 'moderate'
      },
      traits: {
        mobility: 'fast',
        sociability: 'packs',
        metabolism: 'carnivore',
        reproduction: 'sexual'
      },
      relationships: {
        symbioticPartners: [],
        predators: [],
        prey: ['branch-3'],
        competitors: []
      },
      audioSignature: {
        tone: 'percussive',
        frequency: 300,
        volume: 0.7
      },
      pressure: {
        environmental: 0.2,
        predation: 0.1,
        competition: 0.3,
        disease: 0.2
      },
      effects: {
        sparkles: false,
        pulses: false,
        trails: true,
        aura: 'flame'
      },
      lore: {
        origin: 'Evolved to hunt in darkness',
        achievement: 'Perfect predator adaptation',
        challenge: 'Finding new prey sources'
      }
    }
  ];
}

// Generate complex ecosystem
export function generateComplexEcosystem(): TapestrySpecies[] {
  const species: TapestrySpecies[] = [];
  const layers = ['deep', 'middle', 'surface', 'aerial'] as const;
  const textures = ['smooth', 'rough', 'silky', 'metallic', 'ethereal'] as const;
  const patterns = ['tight', 'loose', 'spiral', 'branching', 'chaotic'] as const;
  const colors = [
    '#e11d48', '#db2777', '#c026d3', '#9333ea', '#7c3aed',
    '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#14b8a6',
    '#10b981', '#22c55e', '#84cc16', '#eab308', '#f59e0b',
    '#f97316', '#ef4444', '#dc2626', '#b91c1c', '#991b1b'
  ];

  // Create root species for each layer
  for (let i = 0; i < 4; i++) {
    species.push({
      id: `root-${i}`,
      name: `${layers[i]} Origin`,
      parentId: null,
      birthTurn: i,
      threadColor: {
        primary: colors[i * 5],
        secondary: colors[i * 5 + 1],
        luminosity: 0.8
      },
      threadTexture: textures[i],
      threadThickness: 15 - i * 2,
      weavingStyle: {
        pattern: patterns[i],
        frequency: 0.3 + i * 0.1,
        amplitude: 30 - i * 5
      },
      vitality: {
        current: 0.7 + Math.random() * 0.3,
        peak: 1.0,
        trend: ['rising', 'stable', 'declining'][i % 3] as any
      },
      habitat: {
        layer: layers[i],
        temperature: ['arctic', 'temperate', 'tropical', 'volcanic'][i] as any,
        moisture: ['arid', 'moderate', 'humid', 'aquatic'][i] as any
      },
      traits: {
        mobility: ['stationary', 'slow', 'moderate', 'fast'][i] as any,
        sociability: ['solitary', 'pairs', 'packs', 'swarms'][i] as any,
        metabolism: ['photosynthetic', 'herbivore', 'carnivore', 'exotic'][i] as any,
        reproduction: ['asexual', 'sexual', 'spores', 'budding'][i] as any
      },
      relationships: {
        symbioticPartners: [],
        predators: [],
        prey: [],
        competitors: []
      },
      audioSignature: {
        tone: ['ambient', 'harmonic', 'rhythmic', 'percussive'][i] as any,
        frequency: 100 + i * 150,
        volume: 0.5 + i * 0.1
      },
      pressure: {
        environmental: Math.random() * 0.5,
        predation: 0,
        competition: Math.random() * 0.3,
        disease: Math.random() * 0.2
      },
      effects: {
        sparkles: i % 2 === 0,
        pulses: i % 2 === 1,
        trails: i > 1,
        aura: ['soft', 'none', 'electric', 'mist'][i] as any
      },
      lore: {
        origin: `First to colonize the ${layers[i]} layer`,
        achievement: `Established the ${layers[i]} ecosystem`,
        challenge: 'Maintaining dominance in their niche'
      }
    });
  }

  // Generate branching species
  for (let turn = 5; turn <= 50; turn += 2) {
    const numNewSpecies = Math.floor(Math.random() * 3) + 1;
    
    for (let j = 0; j < numNewSpecies; j++) {
      const parentOptions = species.filter(s => 
        s.birthTurn < turn && (!s.extinctionTurn || s.extinctionTurn > turn)
      );
      
      if (parentOptions.length === 0) continue;
      
      const parent = parentOptions[Math.floor(Math.random() * parentOptions.length)];
      const id = `species-${turn}-${j}`;
      const willExtinct = Math.random() < 0.3;
      const layerShift = Math.random() < 0.2;
      const newLayer = layerShift ? 
        layers[(layers.indexOf(parent.habitat.layer) + 1) % 4] : 
        parent.habitat.layer;
      
      species.push({
        id,
        name: `${newLayer} Dweller ${turn}-${j}`,
        parentId: parent.id,
        birthTurn: turn,
        extinctionTurn: willExtinct ? turn + Math.floor(Math.random() * 15) + 5 : undefined,
        threadColor: {
          primary: colors[Math.floor(Math.random() * colors.length)],
          secondary: colors[Math.floor(Math.random() * colors.length)],
          luminosity: 0.3 + Math.random() * 0.7
        },
        threadTexture: textures[Math.floor(Math.random() * textures.length)],
        threadThickness: 5 + Math.random() * 10,
        weavingStyle: {
          pattern: patterns[Math.floor(Math.random() * patterns.length)],
          frequency: 0.2 + Math.random() * 0.8,
          amplitude: 10 + Math.random() * 40
        },
        vitality: {
          current: willExtinct ? 0.3 + Math.random() * 0.4 : 0.6 + Math.random() * 0.4,
          peak: 0.8 + Math.random() * 0.2,
          trend: willExtinct ? 'declining' : ['rising', 'stable', 'volatile'][Math.floor(Math.random() * 3)] as any
        },
        habitat: {
          layer: newLayer,
          temperature: ['arctic', 'temperate', 'tropical', 'volcanic'][Math.floor(Math.random() * 4)] as any,
          moisture: ['arid', 'moderate', 'humid', 'aquatic'][Math.floor(Math.random() * 4)] as any
        },
        traits: {
          mobility: ['stationary', 'slow', 'moderate', 'fast', 'teleporting'][Math.floor(Math.random() * 5)] as any,
          sociability: ['solitary', 'pairs', 'packs', 'swarms', 'hive'][Math.floor(Math.random() * 5)] as any,
          metabolism: ['photosynthetic', 'herbivore', 'carnivore', 'omnivore', 'exotic'][Math.floor(Math.random() * 5)] as any,
          reproduction: ['asexual', 'sexual', 'spores', 'budding', 'metamorphic'][Math.floor(Math.random() * 5)] as any
        },
        relationships: {
          symbioticPartners: [],
          predators: [],
          prey: [],
          competitors: []
        },
        audioSignature: {
          tone: ['harmonic', 'rhythmic', 'ambient', 'percussive', 'dissonant'][Math.floor(Math.random() * 5)] as any,
          frequency: 50 + Math.random() * 950,
          volume: 0.2 + Math.random() * 0.8
        },
        pressure: {
          environmental: Math.random(),
          predation: Math.random(),
          competition: Math.random(),
          disease: Math.random()
        },
        effects: {
          sparkles: Math.random() < 0.3,
          pulses: Math.random() < 0.3,
          trails: Math.random() < 0.3,
          aura: ['none', 'soft', 'electric', 'flame', 'mist'][Math.floor(Math.random() * 5)] as any
        },
        lore: {
          origin: `Diverged from ${parent.name} in turn ${turn}`,
          achievement: layerShift ? `First to migrate to ${newLayer} layer` : undefined,
          challenge: willExtinct ? 'Struggling to adapt to rapid changes' : 'Carving out a new ecological niche',
          destiny: willExtinct ? 'Doomed to extinction' : undefined
        }
      });
    }
  }

  // Add relationships
  for (const sp of species) {
    const others = species.filter(s => s.id !== sp.id);
    
    // Symbiotic partners (same layer, compatible)
    const potentialPartners = others.filter(s => 
      s.habitat.layer === sp.habitat.layer &&
      Math.abs(s.birthTurn - sp.birthTurn) < 10 &&
      !s.extinctionTurn
    );
    if (potentialPartners.length > 0 && Math.random() < 0.3) {
      sp.relationships.symbioticPartners = potentialPartners
        .slice(0, Math.floor(Math.random() * 3) + 1)
        .map(s => s.id);
    }
    
    // Predator/prey (carnivores hunt herbivores)
    if (sp.traits.metabolism === 'carnivore') {
      const potentialPrey = others.filter(s =>
        s.traits.metabolism === 'herbivore' &&
        Math.abs(layers.indexOf(s.habitat.layer) - layers.indexOf(sp.habitat.layer)) <= 1
      );
      if (potentialPrey.length > 0) {
        sp.relationships.prey = potentialPrey
          .slice(0, Math.floor(Math.random() * 2) + 1)
          .map(s => s.id);
        
        // Add this species as predator to prey
        sp.relationships.prey.forEach(preyId => {
          const prey = species.find(s => s.id === preyId);
          if (prey) {
            prey.relationships.predators.push(sp.id);
          }
        });
      }
    }
    
    // Competitors (same resources)
    const competitors = others.filter(s =>
      s.habitat.layer === sp.habitat.layer &&
      s.traits.metabolism === sp.traits.metabolism &&
      Math.abs(s.birthTurn - sp.birthTurn) < 15
    );
    if (competitors.length > 0) {
      sp.relationships.competitors = competitors
        .slice(0, Math.floor(Math.random() * 3) + 1)
        .map(s => s.id);
    }
  }

  return species;
}