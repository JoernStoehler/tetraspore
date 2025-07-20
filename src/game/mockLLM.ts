import type { DSLState, DSLActionTurn, Species } from '../dsl';
import type { LLMResponse } from './types';

// Helper to get alive species
const getAliveSpecies = (species: Species[]): Species[] => 
  species.filter(s => !s.extinction_turn);

// Mock LLM that generates deterministic but interesting game progression
export class MockLLM {
  // Generate deterministic but varied species names
  private readonly evolutionPaths = {
    moss: ['Shade Moss', 'Water Moss', 'Rock Moss', 'Glow Moss'],
    fern: ['Tree Fern', 'Climbing Fern', 'Aquatic Fern', 'Desert Fern'],
    flower: ['Night Bloom', 'Sun Seeker', 'Frost Flower', 'Fire Lily'],
    tree: ['Giant Redwood', 'Willow', 'Palm', 'Bonsai'],
    fungus: ['Mycelium Network', 'Spore Cloud', 'Symbiotic Fungus', 'Luminescent Mushroom']
  };

  private readonly descriptions = {
    'Shade Moss': 'Thrives in dark environments, developed ability to photosynthesize using minimal light',
    'Water Moss': 'Aquatic variant that filters nutrients from water, forms dense underwater carpets',
    'Rock Moss': 'Hardy species that breaks down rock into soil, pioneer of barren landscapes',
    'Glow Moss': 'Bioluminescent moss that attracts nocturnal pollinators with soft blue light',
    'Tree Fern': 'Tall fern with woody trunk, reaches for canopy light in dense forests',
    'Climbing Fern': 'Vine-like fern that uses other plants for support, highly adaptable',
    'Aquatic Fern': 'Free-floating fern that forms vast mats on water surfaces',
    'Desert Fern': 'Drought-resistant fern with waxy coating and deep root system',
    'Night Bloom': 'Flower that opens only at night, pollinated by moths and bats',
    'Sun Seeker': 'Heliotropic flower that tracks the sun throughout the day',
    'Frost Flower': 'Cold-adapted flower that blooms in winter, antifreeze in petals',
    'Fire Lily': 'Fire-resistant flower that requires heat to germinate seeds',
    'Giant Redwood': 'Massive tree that can live thousands of years, creates own ecosystem',
    'Willow': 'Graceful tree with drooping branches, thrives near water',
    'Palm': 'Tropical tree with large fronds, adapted to coastal conditions',
    'Bonsai': 'Miniaturized tree that allocates resources for longevity over growth',
    'Mycelium Network': 'Underground fungal network that connects and nourishes multiple plants',
    'Spore Cloud': 'Fungus that releases massive spore clouds for wind dispersal',
    'Symbiotic Fungus': 'Forms beneficial partnerships with plant roots, enhancing nutrient uptake',
    'Luminescent Mushroom': 'Glowing fungus that attracts insects for spore dispersal'
  };

  private readonly extinctionReasons = [
    'Climate change made habitat unsuitable',
    'Outcompeted by more efficient species',
    'Lost critical symbiotic partner',
    'Volcanic eruption destroyed last populations',
    'Disease swept through populations',
    'Couldn\'t adapt to changing atmospheric conditions'
  ];

  async generateTurn(state: DSLState): Promise<LLMResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

    const turn = state.turn;
    const aliveSpecies = getAliveSpecies(state);

    // Deterministic but interesting progression
    switch (turn) {
      case 1:
        return this.turn1_FirstLife();
      
      case 2:
        return this.turn2_MossRadiation(state);
      
      case 3:
        return this.turn3_FirstExtinction(state);
      
      case 4:
        return this.turn4_FernEvolution(state);
      
      case 5:
        return this.turn5_MassExtinction(state);
      
      default:
        // After turn 5, generate procedurally based on current species
        if (turn % 5 === 0) {
          return this.generateExtinctionEvent(state);
        } else {
          return this.generateEvolution(state);
        }
    }
  }

  private turn1_FirstLife(): LLMResponse {
    return {
      turn: {
        actions: [
          {
            type: 'SpeciesCreate',
            species: {
              id: 'primordial-moss',
              name: 'Primordial Moss',
              description: 'The first photosynthetic organism, converting sunlight into energy',
              creation_turn: 1
            }
          }
        ]
      },
      reasoning: 'Life begins with simple photosynthetic organisms in shallow pools'
    };
  }

  private turn2_MossRadiation(state: DSLState): LLMResponse {
    // Offer 3 different moss evolutions as choices
    return {
      turn: {
        actions: [
          {
            type: 'SpeciesCreateChoice',
            preview: {
              id: 'preview-shade-moss',
              name: 'Shade Moss',
              description: this.descriptions['Shade Moss'],
              parent_id: 'primordial-moss',
              creation_turn: 2
            }
          },
          {
            type: 'SpeciesCreateChoice',
            preview: {
              id: 'preview-water-moss',
              name: 'Water Moss',
              description: this.descriptions['Water Moss'],
              parent_id: 'primordial-moss',
              creation_turn: 2
            }
          },
          {
            type: 'SpeciesCreateChoice',
            preview: {
              id: 'preview-rock-moss',
              name: 'Rock Moss',
              description: this.descriptions['Rock Moss'],
              parent_id: 'primordial-moss',
              creation_turn: 2
            }
          }
        ]
      },
      reasoning: 'The primordial moss radiates into different ecological niches'
    };
  }

  private turn3_FirstExtinction(state: DSLState): LLMResponse {
    // Force extinction choice for dramatic effect
    const aliveSpecies = getAliveSpecies(state);
    const actions: DSLActionTurn['actions'] = [];

    // Add some invalid actions to test validation
    actions.push({
      type: 'SpeciesCreateChoice',
      preview: {
        id: 'invalid-preview',
        name: 'Invalid Species',
        description: 'This should fail validation',
        parent_id: 'non-existent-species', // Invalid parent
        creation_turn: 3
      }
    });

    // Valid extinction choices
    if (aliveSpecies.length > 1) {
      const target = aliveSpecies[0];
      actions.push({
        type: 'SpeciesExtinctChoice',
        preview: {
          species_id: target.id,
          extinction_turn: 3
        }
      });
    }

    // Also offer a new evolution
    if (aliveSpecies.length > 0) {
      const parent = aliveSpecies[aliveSpecies.length - 1];
      actions.push({
        type: 'SpeciesCreateChoice',
        preview: {
          id: 'preview-glow-moss',
          name: 'Glow Moss',
          description: this.descriptions['Glow Moss'],
          parent_id: parent.id,
          creation_turn: 3
        }
      });
    }

    return {
      turn: { actions },
      reasoning: 'Environmental pressure causes first extinction while new adaptations emerge'
    };
  }

  private turn4_FernEvolution(state: DSLState): LLMResponse {
    const aliveSpecies = getAliveSpecies(state);
    const actions: DSLActionTurn['actions'] = [];

    // Evolve ferns from moss
    const mossSpecies = aliveSpecies.find(s => s.name.includes('Moss'));
    if (mossSpecies) {
      actions.push({
        type: 'SpeciesCreate',
        species: {
          id: 'early-fern',
          name: 'Early Fern',
          description: 'First vascular plant with true leaves and root system',
          parent: mossSpecies.id,
          creation_turn: 4
        }
      });

      // Offer fern variations
      actions.push({
        type: 'SpeciesCreateChoice',
        preview: {
          id: 'preview-tree-fern',
          name: 'Tree Fern',
          description: this.descriptions['Tree Fern'],
          parent_id: 'early-fern',
          creation_turn: 4
        }
      });

      actions.push({
        type: 'SpeciesCreateChoice',
        preview: {
          id: 'preview-climbing-fern',
          name: 'Climbing Fern',
          description: this.descriptions['Climbing Fern'],
          parent_id: 'early-fern',
          creation_turn: 4
        }
      });
    }

    return {
      turn: { actions },
      reasoning: 'Vascular tissue evolution enables plants to grow taller and colonize land'
    };
  }

  private turn5_MassExtinction(state: DSLState): LLMResponse {
    const aliveSpecies = getAliveSpecies(state);
    const actions: DSLActionTurn['actions'] = [];

    // Mass extinction event - mark multiple species for extinction
    const extinctionTargets = aliveSpecies.slice(0, Math.floor(aliveSpecies.length / 2));
    
    extinctionTargets.forEach((species, index) => {
      actions.push({
        type: 'SpeciesExtinctChoice',
        preview: {
          species_id: species.id,
          extinction_turn: 5
        }
      });
    });

    // But also introduce fungi as decomposers
    actions.push({
      type: 'SpeciesCreate',
      species: {
        id: 'early-fungus',
        name: 'Early Fungus',
        description: 'First decomposer organisms, recycling nutrients from extinct species',
        creation_turn: 5
      }
    });

    return {
      turn: { actions },
      reasoning: 'Catastrophic event causes mass extinction, but creates opportunities for new life forms'
    };
  }

  private generateEvolution(state: DSLState): LLMResponse {
    const aliveSpecies = getAliveSpecies(state);
    const actions: DSLActionTurn['actions'] = [];

    // Pick 1-3 species to evolve
    const evolvingSpecies = aliveSpecies
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(3, aliveSpecies.length));

    evolvingSpecies.forEach(parent => {
      const evolutionOptions = this.getEvolutionOptions(parent.name);
      if (evolutionOptions.length > 0) {
        const evolution = evolutionOptions[Math.floor(state.turn * 7 % evolutionOptions.length)];
        actions.push({
          type: 'SpeciesCreateChoice',
          preview: {
            id: `preview-${evolution.toLowerCase().replace(' ', '-')}-${state.turn}`,
            name: evolution,
            description: this.descriptions[evolution] || `Evolved from ${parent.name}`,
            parent_id: parent.id,
            creation_turn: state.turn
          }
        });
      }
    });

    // Sometimes add direct creations
    if (state.turn % 3 === 0 && aliveSpecies.length > 0) {
      const parent = aliveSpecies[Math.floor(state.turn % aliveSpecies.length)];
      actions.push({
        type: 'SpeciesCreate',
        species: {
          id: `species-gen-${state.turn}`,
          name: `Generation ${state.turn} ${parent.name.split(' ')[1] || 'Variant'}`,
          description: `A remarkable adaptation of ${parent.name} to current conditions`,
          parent: parent.id,
          creation_turn: state.turn
        }
      });
    }

    return {
      turn: { actions },
      reasoning: `Turn ${state.turn}: Continuing evolution and adaptation of existing species`
    };
  }

  private generateExtinctionEvent(state: DSLState): LLMResponse {
    const aliveSpecies = getAliveSpecies(state);
    const actions: DSLActionTurn['actions'] = [];

    // Extinction event every 5 turns
    const extinctionCount = Math.min(
      Math.floor(aliveSpecies.length / 3),
      3
    );

    const reasons = [...this.extinctionReasons];
    const targets = aliveSpecies
      .sort(() => Math.random() - 0.5)
      .slice(0, extinctionCount);

    targets.forEach((species, index) => {
      actions.push({
        type: 'SpeciesExtinctChoice',
        preview: {
          species_id: species.id,
          extinction_turn: state.turn
        }
      });
    });

    // Also add some new opportunities
    if (aliveSpecies.length > extinctionCount) {
      const survivor = aliveSpecies.find(s => !targets.includes(s));
      if (survivor) {
        actions.push({
          type: 'SpeciesCreateChoice',
          preview: {
            id: `preview-survivor-evolution-${state.turn}`,
            name: `${survivor.name} Survivor Variant`,
            description: `Evolved traits that helped survive the extinction event`,
            parent_id: survivor.id,
            creation_turn: state.turn
          }
        });
      }
    }

    return {
      turn: { actions },
      reasoning: reasons[Math.floor(state.turn % reasons.length)]
    };
  }

  private getEvolutionOptions(speciesName: string): string[] {
    // Find evolution paths based on species type
    for (const [key, paths] of Object.entries(this.evolutionPaths)) {
      if (speciesName.toLowerCase().includes(key)) {
        return paths;
      }
    }

    // Default evolutions
    return ['Adapted Variant', 'Specialized Form', 'Hybrid Species'];
  }

  // Method to handle validation feedback
  async regenerateWithFeedback(
    state: DSLState, 
    feedback: string,
    previousAttempt: LLMResponse
  ): Promise<LLMResponse> {
    // Simulate processing feedback
    await new Promise(resolve => setTimeout(resolve, 500));

    // For the mock, we'll just filter out invalid actions
    const validActions = previousAttempt.turn.actions.filter(action => {
      // Remove actions that reference non-existent species
      if (action.type === 'SpeciesCreateChoice') {
        return state.species.some(s => s.id === action.preview.parent_id);
      }
      return true;
    });

    return {
      turn: { actions: validActions },
      reasoning: `${previousAttempt.reasoning} (Corrected based on validation feedback)`,
      metadata: {
        ...previousAttempt.metadata,
        attempt: (previousAttempt.metadata?.attempt || 1) + 1
      }
    };
  }
}

// Export singleton instance
export const mockLLM = new MockLLM();