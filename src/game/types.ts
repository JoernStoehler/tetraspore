import type { DSLState, DSLAction, DSLActionTurn } from '../dsl';

// Game-specific types that extend the DSL

export interface GameState extends DSLState {
  // Game flow state
  isProcessing: boolean;
  lastError?: string;
  
  // LLM interaction state
  llmAttempts: number;
  llmFeedback?: string;
}

export interface GameSettings {
  // LLM configuration
  maxLLMAttempts: number;
  llmResponseDelay: number; // Simulate API delay
  
  // Game rules
  maxSpeciesPerTurn: number;
  minExtinctionsPerEra: number; // Every N turns
  eraLength: number;
  
  // Persistence
  autoSave: boolean;
  saveKey: string;
}

export interface LLMResponse {
  turn: DSLActionTurn;
  reasoning?: string; // Optional explanation from LLM
  metadata?: {
    model?: string;
    temperature?: number;
    attempt?: number;
  };
}

export interface SavedGame {
  state: GameState;
  actionHistory: DSLAction[];
  settings: GameSettings;
  timestamp: number;
  version: string;
}

// Events for game flow
export type GameEvent = 
  | { type: 'TURN_START'; turn: number }
  | { type: 'LLM_REQUEST'; attempt: number }
  | { type: 'LLM_RESPONSE'; response: LLMResponse }
  | { type: 'VALIDATION_ERROR'; errors: string }
  | { type: 'TURN_COMPLETE'; actions: DSLAction[] }
  | { type: 'GAME_SAVED' }
  | { type: 'GAME_LOADED'; save: SavedGame };

// Store actions (user interactions)
export type StoreAction =
  | { type: 'ACCEPT_CREATE'; previewId: string }
  | { type: 'REJECT_CREATE'; previewId: string }
  | { type: 'ACCEPT_EXTINCT'; speciesId: string }
  | { type: 'REJECT_EXTINCT'; speciesId: string }
  | { type: 'NEXT_TURN' }
  | { type: 'SAVE_GAME' }
  | { type: 'LOAD_GAME'; save: SavedGame }
  | { type: 'RESET_GAME' };

// Default settings
export const defaultSettings: GameSettings = {
  maxLLMAttempts: 2,
  llmResponseDelay: 800, // Feels responsive but not instant
  maxSpeciesPerTurn: 5,
  minExtinctionsPerEra: 1,
  eraLength: 5,
  autoSave: true,
  saveKey: 'tetraspore-game-save'
};