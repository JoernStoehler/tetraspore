/**
 * @agent-note DSL (Domain Specific Language) System - Central integration point
 * @architecture-context The DSL system is the heart of Tetraspore's LLM-driven gameplay
 * @integration-flow LLM → DSL Actions → Reducer → State → React Components
 * 
 * Key concepts for agents:
 * 1. DSL Actions are the ONLY way to modify game state (event sourcing pattern)
 * 2. The LLM outputs DSL actions in JSON format
 * 3. Parser validates and extracts actions from LLM output
 * 4. Reducer applies actions to create new state (immutable)
 * 5. Components render based on DSL state
 * 
 * Common integration mistakes:
 * - Modifying state directly instead of through actions
 * - Not validating parent_id references before creating species
 * - Forgetting that extinction_turn must match current turn
 * 
 * Testing tips:
 * - Use mockLLM.setScenario() to test different game progressions
 * - Check src/game/scenarios/default.json for scenario structure
 */

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