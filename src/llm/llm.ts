// LLM Service - Main LLM interface

import type { GameState, GameAction } from '../dsl/types';
import type { LLMService } from './types';

export class LLM implements LLMService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async generateActions(_prompt: string, _state: GameState): Promise<GameAction[]> {
    // For MVP, this is not implemented - we use the mock
    // In the future, this would:
    // 1. Format the prompt with the game state
    // 2. Call the actual LLM API
    // 3. Parse the response
    // 4. Return the actions (without validation - that happens elsewhere)
    
    throw new Error('Real LLM not implemented yet - use MockLLM instead');
  }

  // Helper to format state for the LLM
  formatStateForPrompt(state: GameState): string {
    return JSON.stringify({
      current_turn: state.turn,
      living_species: state.species
    }, null, 2);
  }

  // Helper to build the full prompt
  buildPrompt(basePrompt: string, state: GameState): string {
    return `${basePrompt}

Current game state:
${this.formatStateForPrompt(state)}

Please respond with a JSON array of actions.`;
  }
}