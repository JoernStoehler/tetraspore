// DSL Types - Game state and events

export interface Species {
  id: string;
  name: string;
  parentId: string | null;
  birthTurn: number;
  extinctionTurn?: number;
}

export interface GameState {
  turn: number;
  species: Species[];
}

export type GameEvent = 
  | { type: "turn_changed"; turn: number }
  | { type: "species_added"; name: string; parentSpecies?: string }
  | { type: "species_removed"; name: string }
  | { type: "turn_ended" };

// Action types - what the LLM returns (for future use)
export interface GameAction {
  type: string;
  [key: string]: unknown;
}

// Validation types
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  validActions: GameAction[];
}

export interface ValidationError {
  actionIndex: number;
  field: string;
  message: string;
  suggestion?: string;
}

export interface ValidationWarning {
  actionIndex: number;
  message: string;
}