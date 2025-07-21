/**
 * Storybook stories for TreeViewSonnet - Living River Ecosystem
 */

import type { Meta, StoryObj } from '@storybook/react';
import { TreeViewSonnet } from './TreeViewSonnet';
import { Species } from './types';

const meta: Meta<typeof TreeViewSonnet> = {
  title: 'TreeView/Prototypes/Living River Ecosystem',
  component: TreeViewSonnet,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Living River Ecosystem - TreeViewSonnet

An innovative evolution visualization that represents species as flowing particles in a dynamic river ecosystem. Time flows downward like gravity, with species evolving along branching streams.

## Key Features:
- **Flowing Particles**: Individual organisms move as particles through the ecosystem
- **Dynamic Streams**: Evolution paths shown as flowing rivers with current indicators  
- **Rich Species Data**: Extended species model with biomes, behaviors, and traits
- **Ecosystem Zones**: Visual biome areas that influence species clustering
- **Interactive Selection**: Click species to see detailed information panels
- **Performance Optimized**: Smooth animation with 50+ species and hundreds of particles

## Design Philosophy:
Evolution as a living, flowing system where species naturally cluster by biome and behavior, creating an organic, immersive visualization that feels alive.
        `
      }
    }
  },
  argTypes: {
    currentTurn: {
      control: { type: 'number', min: 1, max: 10 },
      description: 'Current game turn'
    },
    enableParticleEffects: {
      control: 'boolean',
      description: 'Enable flowing particle animations'
    },
    maxParticlesPerSpecies: {
      control: { type: 'number', min: 5, max: 100 },
      description: 'Maximum particles per species (performance limit)'
    },
    width: {
      control: { type: 'number', min: 800, max: 1600 },
      description: 'Canvas width'
    },
    height: {
      control: { type: 'number', min: 600, max: 1000 },
      description: 'Canvas height'
    }
  }
};

export default meta;
type Story = StoryObj<typeof TreeViewSonnet>;

// Basic ecosystem data (5 species)
const basicEcosystemSpecies: Species[] = [
  {
    id: 'origin-cell',
    name: 'Origin Cell',
    parentId: null,
    birthTurn: 1,
    primaryColor: '#4ECDC4',
    secondaryColor: '#45B7B8',
    size: 1.0,
    opacity: 0.8,
    particleCount: 12,
    biome: 'deep-ocean',
    climate: 'abyssal',
    depth: 1000,
    mobility: 'slow-drifter',
    groupBehavior: 'colonial',
    flowPattern: 'meandering',
    population: 10000,
    traits: ['primordial', 'self-replicating'],
    territorySize: 50,
    soundSignature: {
      frequency: 60,
      rhythm: 'constant',
      volume: 0.3,
      timbre: 'bubbles'
    },
    birthAnimation: 'bubble-burst',
    extinctionAnimation: 'fade-away',
    temperatureTolerance: { min: 0, max: 10 },
    pressureTolerance: { min: 80, max: 120 },
    oxygenRequirement: 0.1
  },
  {
    id: 'photosynthetic-algae',
    name: 'Photosynthetic Algae',
    parentId: 'origin-cell',
    birthTurn: 2,
    primaryColor: '#2ECC71',
    secondaryColor: '#27AE60',
    size: 0.8,
    opacity: 0.9,
    particleCount: 18,
    biome: 'shallow-seas',
    climate: 'tropical',
    depth: 20,
    mobility: 'slow-drifter',
    groupBehavior: 'large-schools',
    flowPattern: 'straight',
    population: 50000,
    traits: ['photosynthetic', 'oxygen-producing', 'light-seeking'],
    territorySize: 40,
    soundSignature: {
      frequency: 150,
      rhythm: 'harmonic',
      volume: 0.2,
      timbre: 'current'
    },
    birthAnimation: 'gentle-emerge',
    extinctionAnimation: 'fade-away',
    temperatureTolerance: { min: 15, max: 35 },
    pressureTolerance: { min: 1, max: 3 },
    oxygenRequirement: 0.9
  },
  {
    id: 'filter-feeder',
    name: 'Filter Feeder',
    parentId: 'origin-cell',
    birthTurn: 3,
    primaryColor: '#E67E22',
    secondaryColor: '#D35400',
    size: 1.2,
    opacity: 0.7,
    particleCount: 15,
    biome: 'coral-reefs',
    climate: 'tropical',
    depth: 30,
    mobility: 'sessile',
    groupBehavior: 'colonial',
    flowPattern: 'straight',
    population: 30000,
    traits: ['filter-feeding', 'reef-building', 'calcium-secreting'],
    territorySize: 60,
    preySpecies: ['photosynthetic-algae'],
    soundSignature: {
      frequency: 80,
      rhythm: 'pulsing',
      volume: 0.25,
      timbre: 'current'
    },
    birthAnimation: 'gentle-emerge',
    extinctionAnimation: 'scatter',
    temperatureTolerance: { min: 20, max: 30 },
    pressureTolerance: { min: 2, max: 5 },
    oxygenRequirement: 0.7
  },
  {
    id: 'active-predator',
    name: 'Active Predator',
    parentId: 'photosynthetic-algae',
    birthTurn: 4,
    primaryColor: '#E74C3C',
    secondaryColor: '#C0392B',
    size: 0.9,
    opacity: 1.0,
    particleCount: 22,
    biome: 'shallow-seas',
    climate: 'temperate',
    depth: 50,
    mobility: 'rapid-hunter',
    groupBehavior: 'small-pods',
    flowPattern: 'chaotic',
    population: 15000,
    traits: ['predatory', 'fast-moving', 'group-hunting'],
    territorySize: 35,
    preySpecies: ['photosynthetic-algae', 'filter-feeder'],
    competitors: [],
    soundSignature: {
      frequency: 300,
      rhythm: 'irregular',
      volume: 0.4,
      timbre: 'dolphin-click'
    },
    birthAnimation: 'dramatic-splash',
    extinctionAnimation: 'scatter',
    temperatureTolerance: { min: 10, max: 25 },
    pressureTolerance: { min: 3, max: 8 },
    oxygenRequirement: 0.8
  },
  {
    id: 'symbiotic-partner',
    name: 'Symbiotic Partner',
    parentId: 'filter-feeder',
    birthTurn: 5,
    primaryColor: '#9B59B6',
    secondaryColor: '#8E44AD',
    size: 0.6,
    opacity: 0.8,
    particleCount: 20,
    biome: 'coral-reefs',
    climate: 'tropical',
    depth: 25,
    mobility: 'active-swimmer',
    groupBehavior: 'colonial',
    flowPattern: 'spiral',
    population: 25000,
    traits: ['symbiotic', 'cleaning', 'mutualistic'],
    territorySize: 30,
    symbioticPartners: ['filter-feeder'],
    soundSignature: {
      frequency: 200,
      rhythm: 'harmonic',
      volume: 0.15,
      timbre: 'whale-song'
    },
    birthAnimation: 'flow-split',
    extinctionAnimation: 'dissolve',
    temperatureTolerance: { min: 22, max: 32 },
    pressureTolerance: { min: 2, max: 4 },
    oxygenRequirement: 0.6
  }
];

// Generate complex ecosystem with 50+ species
function generateComplexEcosystem(): Species[] {
  const species: Species[] = [];
  
  // Basic root species
  const roots = [
    { name: 'Deep Ocean Pioneer', biome: 'deep-ocean' as const, color: '#1B4F72' },
    { name: 'Shallow Seas Drifter', biome: 'shallow-seas' as const, color: '#0B5345' },
    { name: 'Coral Reef Builder', biome: 'coral-reefs' as const, color: '#FF6B47' },
    { name: 'Kelp Forest Anchor', biome: 'kelp-forests' as const, color: '#2E7D32' },
    { name: 'Tidal Pool Survivor', biome: 'tidal-pools' as const, color: '#795548' },
    { name: 'River Current Rider', biome: 'freshwater-rivers' as const, color: '#0277BD' }
  ];

  // Create root species
  roots.forEach((root, i) => {
    species.push({
      id: `root-${i}`,
      name: root.name,
      parentId: null,
      birthTurn: 1,
      primaryColor: root.color,
      size: 1.0 + Math.random() * 0.5,
      opacity: 0.8,
      particleCount: 10 + Math.floor(Math.random() * 15),
      biome: root.biome,
      climate: 'temperate',
      depth: Math.random() * 1000,
      mobility: 'slow-drifter',
      groupBehavior: 'colonial',
      flowPattern: 'meandering',
      population: 5000 + Math.floor(Math.random() * 10000),
      traits: ['pioneer', 'adaptive'],
      territorySize: 40,
      birthAnimation: 'bubble-burst',
      extinctionAnimation: 'fade-away',
      temperatureTolerance: { min: 0, max: 30 },
      pressureTolerance: { min: 1, max: 100 },
      oxygenRequirement: 0.5
    });
  });

  // Generate evolved species (turns 2-8)
  for (let turn = 2; turn <= 8; turn++) {
    const parents = species.filter(s => s.birthTurn < turn);
    const newSpeciesCount = 6 + Math.floor(Math.random() * 8); // 6-13 per turn
    
    for (let i = 0; i < newSpeciesCount; i++) {
      const parent = parents[Math.floor(Math.random() * parents.length)];
      const mobilities = ['sessile', 'slow-drifter', 'active-swimmer', 'rapid-hunter'] as const;
      const patterns = ['straight', 'meandering', 'spiral', 'chaotic'] as const;
      const behaviors = ['solitary', 'small-pods', 'large-schools', 'colonial'] as const;
      const climates = ['tropical', 'temperate', 'arctic', 'volcanic', 'abyssal'] as const;
      
      species.push({
        id: `gen${turn}-${i}`,
        name: `${parent.name} Variant ${String.fromCharCode(65 + i)}`,
        parentId: parent.id,
        birthTurn: turn,
        primaryColor: adjustColor(parent.primaryColor),
        size: Math.max(0.3, parent.size + (Math.random() - 0.5) * 0.6),
        opacity: 0.6 + Math.random() * 0.4,
        particleCount: Math.max(5, parent.particleCount + Math.floor((Math.random() - 0.5) * 10)),
        biome: parent.biome, // Keep same biome for simplicity
        climate: climates[Math.floor(Math.random() * climates.length)],
        depth: Math.max(0, parent.depth + (Math.random() - 0.5) * 200),
        mobility: mobilities[Math.floor(Math.random() * mobilities.length)],
        groupBehavior: behaviors[Math.floor(Math.random() * behaviors.length)],
        flowPattern: patterns[Math.floor(Math.random() * patterns.length)],
        population: Math.max(1000, parent.population + Math.floor((Math.random() - 0.3) * 20000)),
        traits: generateRandomTraits(),
        territorySize: Math.max(15, parent.territorySize + (Math.random() - 0.5) * 20),
        birthAnimation: 'gentle-emerge',
        extinctionAnimation: 'fade-away',
        temperatureTolerance: {
          min: parent.temperatureTolerance.min + (Math.random() - 0.5) * 5,
          max: parent.temperatureTolerance.max + (Math.random() - 0.5) * 5
        },
        pressureTolerance: {
          min: Math.max(0, parent.pressureTolerance.min + (Math.random() - 0.5) * 10),
          max: parent.pressureTolerance.max + (Math.random() - 0.5) * 20
        },
        oxygenRequirement: Math.max(0, Math.min(1, parent.oxygenRequirement + (Math.random() - 0.5) * 0.3))
      });
    }
  }
  
  return species;
}

function adjustColor(baseColor: string): string {
  // Simple color adjustment - would be more sophisticated in real implementation
  const colors = ['#FF6B47', '#4ECDC4', '#45B7B8', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
  return colors[Math.floor(Math.random() * colors.length)];
}

function generateRandomTraits(): string[] {
  const allTraits = [
    'bioluminescent', 'filter-feeder', 'photosynthetic', 'predatory', 
    'symbiotic', 'fast-reproducing', 'social', 'territorial', 'adaptive'
  ];
  const count = 2 + Math.floor(Math.random() * 3);
  return allTraits.sort(() => Math.random() - 0.5).slice(0, count);
}

const complexEcosystemSpecies = generateComplexEcosystem();

// Story definitions
export const BasicEcosystem: Story = {
  args: {
    species: basicEcosystemSpecies,
    currentTurn: 5,
    width: 1200,
    height: 800,
    enableParticleEffects: true,
    maxParticlesPerSpecies: 25
  }
};

export const ComplexEcosystem: Story = {
  args: {
    species: complexEcosystemSpecies,
    currentTurn: 8,
    width: 1400,
    height: 900,
    enableParticleEffects: true,
    maxParticlesPerSpecies: 30
  }
};

export const StaticView: Story = {
  args: {
    species: basicEcosystemSpecies,
    currentTurn: 5,
    width: 1200,
    height: 800,
    enableParticleEffects: false,
    maxParticlesPerSpecies: 0
  }
};

export const HighPerformance: Story = {
  args: {
    species: complexEcosystemSpecies,
    currentTurn: 8,
    width: 1600,
    height: 1000,
    enableParticleEffects: true,
    maxParticlesPerSpecies: 50
  }
};