// LLM Types

import type { GameState, GameAction } from '../dsl/types';

// LLM service interface
export interface LLMService {
  generateActions(prompt: string, state: GameState): Promise<GameAction[]>;
}

// Mock turn data for the mock LLM
export interface MockTurn {
  turn: number;
  events: GameAction[];
}