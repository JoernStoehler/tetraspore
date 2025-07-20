// Zustand Store

import { create } from 'zustand';
import type { GameStore } from './types';
import type { GameEvent } from '../dsl/types';
import { initialState, reduceEvent } from '../dsl/reducer';
import { MockLLM } from '../llm/mock';
import { validateActions } from '../dsl/validate';

// Create mock LLM instance
const mockLLM = new MockLLM();

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: initialState,
  isProcessing: false,
  
  applyEvent: (event) => {
    set((state) => ({
      gameState: reduceEvent(state.gameState, event)
    }));
  },
  
  applyEvents: (events) => {
    set((state) => {
      let newState = state.gameState;
      for (const event of events) {
        newState = reduceEvent(newState, event);
      }
      return { gameState: newState };
    });
  },
  
  endTurn: async () => {
    const state = get();
    if (state.isProcessing) return;
    
    set({ isProcessing: true });
    
    try {
      // Get actions from mock LLM
      const actions = await mockLLM.generateActions('', state.gameState);
      
      // Validate actions
      const validationResult = validateActions(actions);
      
      if (!validationResult.valid) {
        console.error('Invalid actions from LLM:', validationResult.errors);
        // In a real app, we might show these errors to the user
      }
      
      // Log warnings if any
      if (validationResult.warnings.length > 0) {
        console.warn('Action warnings:', validationResult.warnings);
      }
      
      // Apply valid actions as events
      if (validationResult.validActions.length > 0) {
        // Apply events one by one with a small delay for visual effect
        for (const action of validationResult.validActions) {
          // Convert action to event (they're the same structure for now)
          get().applyEvent(action as GameEvent);
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
    } finally {
      set({ isProcessing: false });
    }
  },
  
  reset: () => {
    set({
      gameState: initialState,
      isProcessing: false
    });
  }
}));

// Convenience hooks
export const useGameState = () => useGameStore(state => state.gameState);
export const useIsProcessing = () => useGameStore(state => state.isProcessing);
export const useTurn = () => useGameStore(state => state.gameState.turn);
export const useSpecies = () => useGameStore(state => state.gameState.species);