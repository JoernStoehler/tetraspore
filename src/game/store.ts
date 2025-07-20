import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { DSLAction, DSLActionTurn, CreatePreview, Species } from '../dsl';
import { reducer, clearPreviews, incrementTurn } from '../dsl';
import type { GameState, GameSettings, SavedGame } from './types';
import { defaultSettings } from './types';
import { createInitialState } from './initialState';
import { mockLLM } from './mockLLM';
import { turnManager } from './turnManager';
import { saveToPersistence, loadFromPersistence } from './persistence';

interface GameStore {
  // State
  state: GameState;
  actionHistory: DSLAction[];
  settings: GameSettings;
  
  // Core actions
  applyAction: (action: DSLAction) => void;
  applyTurn: (turn: DSLActionTurn) => void;
  nextTurn: () => Promise<void>;
  
  // UI callbacks for choices
  acceptCreate: (previewId: string) => void;
  rejectCreate: (previewId: string) => void;
  acceptExtinct: (speciesId: string) => void;
  rejectExtinct: (speciesId: string) => void;
  
  // Game management
  saveGame: () => void;
  loadGame: (save?: SavedGame) => void;
  resetGame: () => void;
  
  // Utilities
  setProcessing: (isProcessing: boolean) => void;
  setError: (error?: string) => void;
}

export const useGameStore = create<GameStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial state
      state: createInitialState(),
      actionHistory: [],
      settings: defaultSettings,
      
      // Apply a single action
      applyAction: (action) => {
        const { state, actionHistory } = get();
        const newState = reducer.reduce(state, action);
        
        set({
          state: newState,
          actionHistory: [...actionHistory, action]
        });
        
        // Auto-save if enabled
        if (get().settings.autoSave) {
          get().saveGame();
        }
      },
      
      // Apply a full turn
      applyTurn: (turn) => {
        const { state, actionHistory } = get();
        const newState = reducer.reduceTurn(state, turn);
        
        set({
          state: newState,
          actionHistory: [...actionHistory, ...turn.actions]
        });
      },
      
      // Progress to next turn
      nextTurn: async () => {
        const { state, settings, applyTurn, setProcessing, setError } = get();
        
        if (state.isProcessing) return;
        
        try {
          setProcessing(true);
          setError(undefined);
          
          // Clear previous previews and increment turn
          let newState = clearPreviews(state);
          newState = incrementTurn(newState);
          
          set({ state: newState });
          
          // Get LLM response through turn manager
          const result = await turnManager.processTurn(
            newState,
            mockLLM,
            settings
          );
          
          if (result.success && result.turn) {
            applyTurn(result.turn);
          } else {
            setError(result.error || 'Failed to process turn');
          }
        } catch (error) {
          setError(error instanceof Error ? error.message : 'Unknown error');
        } finally {
          setProcessing(false);
        }
      },
      
      // Accept a species creation preview
      acceptCreate: (previewId) => {
        const { state, applyAction } = get();
        const preview = state.previewCreate.find(p => p.id === previewId);
        
        if (!preview) return;
        
        // Convert preview to actual species
        const species: Species = {
          id: preview.id.replace('preview-', ''),
          name: preview.name,
          description: preview.description,
          parent: preview.parent_id,
          creation_turn: preview.creation_turn
        };
        
        applyAction({
          type: 'SpeciesCreate',
          species
        });
        
        // Remove the preview
        set({
          state: {
            ...get().state,
            previewCreate: state.previewCreate.filter(p => p.id !== previewId)
          }
        });
      },
      
      // Reject a species creation preview
      rejectCreate: (previewId) => {
        const { state } = get();
        
        set({
          state: {
            ...state,
            previewCreate: state.previewCreate.filter(p => p.id !== previewId)
          }
        });
      },
      
      // Accept a species extinction
      acceptExtinct: (speciesId) => {
        const { state, applyAction } = get();
        const preview = state.previewExtinct.find(p => p.species_id === speciesId);
        
        if (!preview) return;
        
        applyAction({
          type: 'SpeciesExtinct',
          species_id: speciesId,
          extinction_turn: preview.extinction_turn
        });
        
        // Remove the preview
        set({
          state: {
            ...get().state,
            previewExtinct: state.previewExtinct.filter(p => p.species_id !== speciesId)
          }
        });
      },
      
      // Reject a species extinction
      rejectExtinct: (speciesId) => {
        const { state } = get();
        
        set({
          state: {
            ...state,
            previewExtinct: state.previewExtinct.filter(p => p.species_id !== speciesId)
          }
        });
      },
      
      // Save game
      saveGame: () => {
        const { state, actionHistory, settings } = get();
        const save: SavedGame = {
          state,
          actionHistory,
          settings,
          timestamp: Date.now(),
          version: '1.0.0'
        };
        
        saveToPersistence(save, settings.saveKey);
      },
      
      // Load game
      loadGame: (save) => {
        if (!save) {
          // Try to load from persistence
          save = loadFromPersistence(get().settings.saveKey);
          if (!save) return;
        }
        
        set({
          state: save.state,
          actionHistory: save.actionHistory,
          settings: save.settings || defaultSettings
        });
      },
      
      // Reset game
      resetGame: () => {
        set({
          state: createInitialState(),
          actionHistory: [],
          settings: defaultSettings
        });
        
        // Clear saved game
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem(get().settings.saveKey);
        }
      },
      
      // Utilities
      setProcessing: (isProcessing) => {
        set({
          state: {
            ...get().state,
            isProcessing
          }
        });
      },
      
      setError: (error) => {
        set({
          state: {
            ...get().state,
            lastError: error
          }
        });
      }
    })),
    {
      name: 'game-store'
    }
  )
);

// Selector hooks for common queries
export const useCurrentTurn = () => useGameStore(state => state.state.turn);
export const useIsProcessing = () => useGameStore(state => state.state.isProcessing);
export const useSpecies = () => useGameStore(state => state.state.species);
export const usePreviews = () => useGameStore(state => ({
  create: state.state.previewCreate,
  extinct: state.state.previewExtinct
}));
export const useActionHistory = () => useGameStore(state => state.actionHistory);