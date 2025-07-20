// Mock LLM - Returns pre-defined events for testing

import type { GameState, GameAction } from '../dsl/types';
import type { LLMService, MockTurn } from './types';
import mockEventsData from './mock-events.json';

export class MockLLM implements LLMService {
  private mockTurns: MockTurn[];
  
  constructor() {
    this.mockTurns = mockEventsData.turns;
  }
  
  async generateActions(_prompt: string, state: GameState): Promise<GameAction[]> {
    // Simulate LLM processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const nextTurn = state.turn + 1;
    const turnData = this.mockTurns.find(t => t.turn === nextTurn);
    
    if (!turnData) {
      // No more events in the mock data
      return [];
    }
    
    // Return the pre-defined events for this turn
    return turnData.events;
  }
  
  // For debugging - shows what the LLM would see
  formatStateForLLM(state: GameState): string {
    return JSON.stringify({
      current_turn: state.turn,
      living_species: state.species
    }, null, 2);
  }
}