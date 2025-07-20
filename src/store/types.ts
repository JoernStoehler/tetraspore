// Store Types

import type { GameState, GameEvent } from '../dsl/types';

export interface GameStore {
  // State
  gameState: GameState;
  isProcessing: boolean;
  
  // Actions
  applyEvent: (event: GameEvent) => void;
  applyEvents: (events: GameEvent[]) => void;
  endTurn: () => Promise<void>;
  reset: () => void;
}