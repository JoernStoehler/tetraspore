/**
 * Public exports for the Action DSL Parser
 */

// Main parser classes and functions
export { DSLParser, parseActionDSL, parseActionObject } from './DSLParser';

// Type definitions
export type {
  Action,
  ActionNode,
  ActionGraph,
  ParserResult,
  ValidationError,
  ActionInput,
  ReasonAction,
  AssetImageAction,
  AssetSubtitleAction,
  AssetCutsceneAction,
  PlayCutsceneAction,
  ShowModalAction,
  AddFeatureAction,
  RemoveFeatureAction,
  WhenThenAction,
  AddPlayerChoiceAction,
  CutsceneShot,
  PlayerChoiceOption,
  AssetAction,
  GameAction
} from './types';

// Error classes
export {
  DSLParserError,
  SchemaValidationError,
  DuplicateIdError,
  UnknownReferenceError,
  CircularDependencyError,
  InvalidConditionError,
  InvalidTargetError,
  errorToValidationError,
  findSimilarString
} from './errors';

// Validation functions (useful for external validation)
export {
  validateUniqueIds,
  validateReferences,
  validateDependencies,
  validateConditions,
  validateTargets,
  categorizeActions
} from './validators';

// Schemas and utilities (useful for external schema validation)
export {
  ActionInputSchema,
  ActionSchema,
  ReasonActionSchema,
  AssetImageActionSchema,
  AssetSubtitleActionSchema,
  AssetCutsceneActionSchema,
  PlayCutsceneActionSchema,
  ShowModalActionSchema,
  AddFeatureActionSchema,
  RemoveFeatureActionSchema,
  WhenThenActionSchema,
  AddPlayerChoiceActionSchema,
  CutsceneShotSchema,
  PlayerChoiceOptionSchema,
  isAssetAction,
  isGameAction,
  hasId,
  extractActionIds,
  extractReferencedIds
} from './schemas';