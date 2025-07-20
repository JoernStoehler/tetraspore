/**
 * @agent-note Refactored MockLLM that loads scenarios from JSON files
 * @integration-point Uses ScenarioLoader to dynamically load game progressions
 * @design-rationale Scenarios externalized to JSON for easy modification and testing
 */

import type { DSLState, DSLActionTurn, Species } from '../dsl';
import type { LLMResponse } from './types';
import type { MockScenarioFile, TurnScenario } from './scenarios/types';
import { scenarioLoader } from './scenarios/loader';

// Helper to get alive species
const getAliveSpecies = (species: Species[]): Species[] => 
  species.filter(s => !s.extinction_turn);

export class MockLLM {
  private scenario: MockScenarioFile | null = null;
  private scenarioId: string = 'default';
  
  /**
   * Set the scenario to use
   * @agent-note Call this before generateTurn to use a different scenario
   */
  async setScenario(scenarioId: string): Promise<void> {
    this.scenarioId = scenarioId;
    this.scenario = await scenarioLoader.loadScenario(scenarioId);
  }
  
  /**
   * Ensure scenario is loaded
   */
  private async ensureScenario(): Promise<MockScenarioFile> {
    if (!this.scenario) {
      this.scenario = await scenarioLoader.loadScenario(this.scenarioId);
    }
    return this.scenario;
  }
  
  async generateTurn(state: DSLState): Promise<LLMResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
    
    const scenario = await this.ensureScenario();
    const turn = state.turn;
    
    // Check for fixed turn scenario
    const fixedTurn = scenario.fixedTurns.find(t => t.turn === turn);
    if (fixedTurn) {
      return this.processFixedTurn(fixedTurn, state);
    }
    
    // After fixed turns, generate procedurally
    if (turn % 5 === 0) {
      return this.generateExtinctionEvent(state, scenario);
    } else {
      return this.generateEvolution(state, scenario);
    }
  }
  
  /**
   * Process a fixed turn from the scenario
   */
  private processFixedTurn(turnScenario: TurnScenario, state: DSLState): LLMResponse {
    // Special handling for turns that need dynamic generation
    if (turnScenario.actions.length === 0) {
      // Turn 3: First extinction
      if (turnScenario.turn === 3) {
        return this.generateFirstExtinction(state, turnScenario.reasoning);
      }
      // Turn 4: Fern evolution
      if (turnScenario.turn === 4) {
        return this.generateFernEvolution(state, turnScenario.reasoning);
      }
    }
    
    return {
      turn: { actions: turnScenario.actions },
      reasoning: turnScenario.reasoning
    };
  }
  
  /**
   * Generate first extinction event (turn 3)
   */
  private generateFirstExtinction(state: DSLState, reasoning: string): LLMResponse {
    const aliveSpecies = getAliveSpecies(state.species);
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
          description: 'Bioluminescent moss that attracts nocturnal pollinators with soft blue light',
          parent_id: parent.id,
          creation_turn: 3
        }
      });
    }
    
    return { turn: { actions }, reasoning };
  }
  
  /**
   * Generate fern evolution (turn 4)
   */
  private generateFernEvolution(state: DSLState, reasoning: string): LLMResponse {
    const aliveSpecies = getAliveSpecies(state.species);
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
      
      // Find fern evolution path
      const fernPath = this.scenario!.evolutionPaths.find(p => p.from === 'fern');
      if (fernPath && fernPath.to.length >= 2) {
        actions.push({
          type: 'SpeciesCreateChoice',
          preview: {
            id: 'preview-tree-fern',
            name: fernPath.to[0],
            description: fernPath.descriptions[fernPath.to[0]],
            parent_id: 'early-fern',
            creation_turn: 4
          }
        });
        
        actions.push({
          type: 'SpeciesCreateChoice',
          preview: {
            id: 'preview-climbing-fern',
            name: fernPath.to[1],
            description: fernPath.descriptions[fernPath.to[1]],
            parent_id: 'early-fern',
            creation_turn: 4
          }
        });
      }
    }
    
    return { turn: { actions }, reasoning };
  }
  
  /**
   * Generate evolution event
   */
  private generateEvolution(state: DSLState, scenario: MockScenarioFile): LLMResponse {
    const aliveSpecies = getAliveSpecies(state.species);
    const actions: DSLActionTurn['actions'] = [];
    
    // Pick 1-3 species to evolve
    const evolvingSpecies = aliveSpecies
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(3, aliveSpecies.length));
    
    evolvingSpecies.forEach(parent => {
      const evolutionOptions = this.getEvolutionOptions(parent.name, scenario);
      if (evolutionOptions.length > 0) {
        const index = Math.floor(state.turn * 7 % evolutionOptions.length);
        const evolution = evolutionOptions[index];
        
        actions.push({
          type: 'SpeciesCreateChoice',
          preview: {
            id: `preview-${evolution.name.toLowerCase().replace(/ /g, '-')}-${state.turn}`,
            name: evolution.name,
            description: evolution.description,
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
  
  /**
   * Generate extinction event
   */
  private generateExtinctionEvent(state: DSLState, scenario: MockScenarioFile): LLMResponse {
    const aliveSpecies = getAliveSpecies(state.species);
    const actions: DSLActionTurn['actions'] = [];
    
    // Mass extinction on turn 5 specifically
    if (state.turn === 5) {
      const extinctionTargets = aliveSpecies.slice(0, Math.floor(aliveSpecies.length / 2));
      
      extinctionTargets.forEach((species) => {
        actions.push({
          type: 'SpeciesExtinctChoice',
          preview: {
            species_id: species.id,
            extinction_turn: 5
          }
        });
      });
      
      // Also add the fungus from the fixed scenario
      const fungusAction = scenario.fixedTurns.find(t => t.turn === 5)?.actions[0];
      if (fungusAction) {
        actions.push(fungusAction);
      }
      
      return {
        turn: { actions },
        reasoning: scenario.fixedTurns.find(t => t.turn === 5)?.reasoning || 'Mass extinction event'
      };
    }
    
    // Regular extinction event
    const extinctionCount = Math.min(
      Math.floor(aliveSpecies.length / 3),
      3
    );
    
    const targets = aliveSpecies
      .sort(() => Math.random() - 0.5)
      .slice(0, extinctionCount);
    
    targets.forEach((species) => {
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
    
    const reasonIndex = Math.floor(state.turn % scenario.extinctionReasons.length);
    return {
      turn: { actions },
      reasoning: scenario.extinctionReasons[reasonIndex]
    };
  }
  
  /**
   * Get evolution options for a species
   */
  private getEvolutionOptions(
    speciesName: string, 
    scenario: MockScenarioFile
  ): Array<{ name: string; description: string }> {
    // Find evolution paths based on species type
    for (const path of scenario.evolutionPaths) {
      if (speciesName.toLowerCase().includes(path.from)) {
        return path.to.map(name => ({
          name,
          description: path.descriptions[name] || `Evolved from ${speciesName}`
        }));
      }
    }
    
    // Default evolutions
    return [
      { name: 'Adapted Variant', description: `An adapted form of ${speciesName}` },
      { name: 'Specialized Form', description: `A specialized variant of ${speciesName}` },
      { name: 'Hybrid Species', description: `A hybrid descendant of ${speciesName}` }
    ];
  }
  
  /**
   * Method to handle validation feedback
   */
  async regenerateWithFeedback(
    state: DSLState, 
    _feedback: string,
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