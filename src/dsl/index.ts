// Public API for the DSL system

// Export all types
export type {
  Species,
  CreatePreview,
  ExtinctPreview,
  DSLState,
  DSLAction,
  DSLActionTurn,
  TreeNode,
  TreeViewProps,
  GameControlsProps,
  ValidationError,
  ValidationResult
} from './types';

// Export interfaces
export type {
  DSLParser,
  DSLReducer,
  ComponentRegistry,
  DSLValidator
} from './interfaces';

// Export singleton instances
export { parser } from './parser';
export { reducer, clearPreviews, incrementTurn, isSpeciesAlive, getAliveSpecies, getLineage } from './reducer';
export { validator } from './validate';
export { registry } from './registry';

// Re-export Parser, Reducer, Validator, Registry classes for advanced usage
export { Parser } from './parser';
export { Reducer } from './reducer';
export { Validator } from './validate';
export { Registry } from './registry';