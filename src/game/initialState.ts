import type { GameState } from './types';

export const initialGameState: GameState = {
  // DSL state
  turn: 1,
  species: [],
  previewCreate: [],
  previewExtinct: [],
  
  // Game flow state
  isProcessing: false,
  lastError: undefined,
  
  // LLM interaction state
  llmAttempts: 0,
  llmFeedback: undefined
};

// Helper to create a fresh game state
export function createInitialState(): GameState {
  return {
    ...initialGameState,
    species: [],
    previewCreate: [],
    previewExtinct: []
  };
}