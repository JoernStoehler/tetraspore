/**
 * Storybook stories for the Living Tapestry visualization
 */

import type { Meta, StoryObj } from '@storybook/react';
import { TreeViewOpus } from './TreeViewOpus';
import { TapestrySpecies } from './types/Species';
import { generateBasicSpecies, generateComplexEcosystem } from './utils/storyData';

const meta = {
  title: 'TreeView/Prototypes/Opus - Living Tapestry',
  component: TreeViewOpus,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Living Tapestry - Tree of Life Visualization

An innovative approach that visualizes evolution as an organic tapestry where species are threads that weave through time, creating a living fabric of interconnected life.

## Key Features

- **Organic Thread Visualization**: Species rendered as flowing threads with unique textures and patterns
- **Multi-layer Habitat System**: Four distinct layers (deep, middle, surface, aerial) creating depth
- **Rich Visual Styles**: Watercolor, neon, sketch, abstract, and realistic rendering modes
- **Dynamic Relationships**: Symbiotic, predatory, and competitive connections visualized as energy flows
- **Time Navigation**: Smooth timeline control with playback and speed adjustment
- **Environmental Effects**: Pressure zones, habitat layers, and cosmic/ocean backgrounds

## Interaction

- **Click** on threads to select and view detailed information
- **Hover** for quick species preview
- **Space** to play/pause time
- **Ctrl+R** to reset view
- Use timeline controls to navigate through evolutionary history
        `
      }
    }
  },
} satisfies Meta<typeof TreeViewOpus>;

export default meta;
type Story = StoryObj<typeof meta>;

// Basic story with simple evolution
export const Basic: Story = {
  args: {
    species: generateBasicSpecies(),
    width: 1600,
    height: 900,
    currentTurn: 10,
  },
  parameters: {
    docs: {
      description: {
        story: 'A simple evolutionary tree showing 5-10 species with basic relationships. Notice how threads weave and branch naturally.'
      }
    }
  }
};

// Complex ecosystem with many species
export const Complex: Story = {
  args: {
    species: generateComplexEcosystem(),
    width: 1600,
    height: 900,
    currentTurn: 50,
  },
  parameters: {
    docs: {
      description: {
        story: 'A rich ecosystem with 50+ species across multiple habitats. Demonstrates performance with complex relationships and environmental pressures.'
      }
    }
  }
};

// Extinction event scenario
export const ExtinctionEvent: Story = {
  args: {
    species: generateExtinctionScenario(),
    width: 1600,
    height: 900,
    currentTurn: 30,
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates a mass extinction event at turn 20. Notice how threads fade and unravel, leaving ghost traces.'
      }
    }
  }
};

// Symbiotic paradise
export const SymbioticNetwork: Story = {
  args: {
    species: generateSymbioticNetwork(),
    width: 1600,
    height: 900,
    currentTurn: 25,
  },
  parameters: {
    docs: {
      description: {
        story: 'A harmonious ecosystem with extensive symbiotic relationships. Energy flows between threads create a living web.'
      }
    }
  }
};

// Helper function for extinction scenario
function generateExtinctionScenario(): TapestrySpecies[] {
  const species: TapestrySpecies[] = [
    // Ancient root species
    {
      id: 'ancient-1',
      name: 'Primordial Essence',
      parentId: null,
      birthTurn: 0,
      extinctionTurn: 22,
      threadColor: {
        primary: '#4a90e2',
        secondary: '#357abd',
        luminosity: 0.8
      },
      threadTexture: 'ethereal',
      threadThickness: 15,
      weavingStyle: {
        pattern: 'spiral',
        frequency: 0.5,
        amplitude: 40
      },
      vitality: {
        current: 0.2,
        peak: 1.0,
        trend: 'declining'
      },
      habitat: {
        layer: 'deep',
        temperature: 'temperate',
        moisture: 'moderate'
      },
      traits: {
        mobility: 'slow',
        sociability: 'hive',
        metabolism: 'exotic',
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
        frequency: 100,
        volume: 0.6
      },
      pressure: {
        environmental: 0.9,
        predation: 0.1,
        competition: 0.8,
        disease: 0.7
      },
      effects: {
        sparkles: false,
        pulses: true,
        trails: false,
        aura: 'mist'
      },
      lore: {
        origin: 'First to emerge from the primordial soup',
        achievement: 'Survived the first billion years',
        challenge: 'The great cooling threatens its existence'
      }
    }
  ];

  // Add species that branch before extinction
  for (let i = 1; i <= 8; i++) {
    const survives = i % 3 === 0;
    species.push({
      id: `species-${i}`,
      name: `${survives ? 'Survivor' : 'Doomed'} Form ${i}`,
      parentId: i < 4 ? 'ancient-1' : `species-${Math.floor(i/2)}`,
      birthTurn: i * 2,
      extinctionTurn: survives ? undefined : 20 + Math.floor(Math.random() * 3),
      threadColor: {
        primary: survives ? '#2ecc71' : '#e74c3c',
        secondary: survives ? '#27ae60' : '#c0392b',
        luminosity: survives ? 0.7 : 0.5
      },
      threadTexture: survives ? 'smooth' : 'rough',
      threadThickness: 8 + Math.random() * 4,
      weavingStyle: {
        pattern: survives ? 'tight' : 'chaotic',
        frequency: 0.3 + Math.random() * 0.4,
        amplitude: 20 + Math.random() * 20
      },
      vitality: {
        current: survives ? 0.8 : 0.3,
        peak: 0.9,
        trend: survives ? 'stable' : 'declining'
      },
      habitat: {
        layer: ['deep', 'middle', 'surface'][i % 3] as any,
        temperature: ['arctic', 'temperate', 'tropical'][i % 3] as any,
        moisture: ['arid', 'moderate', 'humid'][i % 3] as any
      },
      traits: {
        mobility: ['stationary', 'slow', 'moderate', 'fast'][i % 4] as any,
        sociability: ['solitary', 'pairs', 'packs'][i % 3] as any,
        metabolism: ['herbivore', 'carnivore', 'omnivore'][i % 3] as any,
        reproduction: ['sexual', 'asexual', 'spores'][i % 3] as any
      },
      relationships: {
        symbioticPartners: [],
        predators: i > 4 ? [`species-${i-2}`] : [],
        prey: i < 6 ? [`species-${i+2}`] : [],
        competitors: [`species-${i % 2 === 0 ? i-1 : i+1}`].filter(id => id !== `species-${i}`)
      },
      audioSignature: {
        tone: ['harmonic', 'rhythmic', 'percussive'][i % 3] as any,
        frequency: 200 + i * 50,
        volume: 0.4 + Math.random() * 0.3
      },
      pressure: {
        environmental: survives ? 0.3 : 0.8,
        predation: 0.4,
        competition: 0.5,
        disease: survives ? 0.2 : 0.9
      },
      effects: {
        sparkles: survives,
        pulses: !survives,
        trails: false,
        aura: survives ? 'soft' : 'none'
      },
      lore: {
        origin: `Evolved during the ${i < 4 ? 'early' : 'late'} period`,
        achievement: survives ? 'Adapted to the crisis' : undefined,
        challenge: survives ? 'Must maintain genetic diversity' : 'Cannot adapt quickly enough',
        destiny: survives ? 'Will seed the new world' : undefined
      }
    });
  }

  return species;
}

// Helper function for symbiotic network
function generateSymbioticNetwork(): TapestrySpecies[] {
  const species: TapestrySpecies[] = [];
  const colors = [
    { primary: '#f39c12', secondary: '#e67e22' },
    { primary: '#9b59b6', secondary: '#8e44ad' },
    { primary: '#3498db', secondary: '#2980b9' },
    { primary: '#1abc9c', secondary: '#16a085' },
    { primary: '#e74c3c', secondary: '#c0392b' }
  ];

  // Create interconnected species
  for (let i = 0; i < 15; i++) {
    const colorSet = colors[i % colors.length];
    const layer = ['deep', 'middle', 'surface', 'aerial'][Math.floor(i / 4)] as any;
    
    species.push({
      id: `symbiont-${i}`,
      name: `Harmony Being ${i}`,
      parentId: i === 0 ? null : i < 5 ? 'symbiont-0' : `symbiont-${Math.floor(i/3)}`,
      birthTurn: Math.floor(i / 2),
      threadColor: {
        ...colorSet,
        luminosity: 0.8
      },
      threadTexture: 'silky',
      threadThickness: 10,
      weavingStyle: {
        pattern: 'branching',
        frequency: 0.4,
        amplitude: 30
      },
      vitality: {
        current: 0.9,
        peak: 0.95,
        trend: 'rising'
      },
      habitat: {
        layer,
        temperature: 'temperate',
        moisture: 'moderate'
      },
      traits: {
        mobility: 'moderate',
        sociability: 'swarms',
        metabolism: 'photosynthetic',
        reproduction: 'metamorphic'
      },
      relationships: {
        symbioticPartners: i > 2 ? 
          Array.from({ length: 2 + (i % 3) }, (_, j) => 
            `symbiont-${(i + j + 1) % 15}`
          ).filter(id => id !== `symbiont-${i}`) : [],
        predators: [],
        prey: [],
        competitors: []
      },
      audioSignature: {
        tone: 'harmonic',
        frequency: 440 + i * 20,
        volume: 0.7
      },
      pressure: {
        environmental: 0.1,
        predation: 0.0,
        competition: 0.1,
        disease: 0.1
      },
      effects: {
        sparkles: true,
        pulses: true,
        trails: true,
        aura: 'soft'
      },
      lore: {
        origin: 'Born from the great harmony',
        achievement: 'Perfect symbiotic balance achieved',
        challenge: 'Maintaining the delicate web of life'
      }
    });
  }

  return species;
}