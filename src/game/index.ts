// Public API for the game system

// Export types
export type {
  GameState,
  GameSettings,
  LLMResponse,
  SavedGame,
  GameEvent,
  StoreAction
} from './types';

// Export store and hooks
export {
  useGameStore,
  useCurrentTurn,
  useIsProcessing,
  useSpecies,
  usePreviews,
  useActionHistory
} from './store';

// Export utilities
export { createInitialState } from './initialState';
export { mockLLM } from './mockLLM';
export { turnManager } from './turnManager';
export {
  saveToPersistence,
  loadFromPersistence,
  listSaves,
  deleteSave,
  exportSave,
  importSave,
  getSaveStats
} from './persistence';

// Export default settings
export { defaultSettings } from './types';

// Re-export DSL types for convenience
export type {
  Species,
  CreatePreview,
  ExtinctPreview,
  DSLState,
  DSLAction,
  DSLActionTurn,
  TreeNode,
  TreeViewProps,
  GameControlsProps
} from '../dsl';