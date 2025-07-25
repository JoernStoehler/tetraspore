/**
 * Asset Creation Executors - Public API
 * 
 * This module provides the public interface for asset creation executors.
 * Use these executors to transform DSL asset actions into actual assets
 * via GenAI API calls.
 */

// Core Types and Interfaces
export type {
  // Action types
  Action,
  AssetImageAction,
  AssetSubtitleAction,
  AssetCutsceneAction,
  
  // Result types
  AssetResult,
  ImageAssetResult,
  AudioAssetResult,
  CutsceneAssetResult,
  
  // Execution context
  ExecutionContext,
  APIKeys,
  
  // Validation
  ValidationResult,
  ExecutorValidationError,
  CostEstimate,
  
  // Storage
  AssetStorage,
  AssetMetadata,
  StoredAsset,
  
  // Caching
  AssetCache,
  
  // Rate limiting
  RateLimiter,
  
  // Cost tracking
  CostTracker,
  CostRecord,
  CostBreakdown,
  AssetType,
  
  // Cutscene specific
  CutsceneDefinition,
  CutsceneDefinitionShot,
  CutsceneShot,
  
  // Voice configuration
  VoiceConfig,
  
  // API responses
  FluxAPIResponse,
  SDXLAPIResponse,
  OpenAITTSResponse,
  GoogleTTSResponse
} from './types';

// Error classes
export {
  AssetGenerationError,
  ValidationError,
  StorageError,
  RateLimitError
} from './types';

// Base executor
export { BaseExecutor } from './BaseExecutor';

// Concrete executors
export { ImageAssetExecutor } from './ImageAssetExecutor';
export { SubtitleAssetExecutor } from './SubtitleAssetExecutor';
export { CutsceneAssetExecutor } from './CutsceneAssetExecutor';

// Storage implementations
export { LocalAssetStorage } from '../storage/LocalAssetStorage';

// Mock implementations for testing
export {
  MockImageAssetExecutor,
  MockSubtitleAssetExecutor,
  MockCutsceneAssetExecutor,
  MockAssetStorage,
  MockAssetCache,
  MockRateLimiter,
  MockCostTracker,
  createMockExecutionContext,
  mockActions,
  testUtils
} from './mocks';

// NOTE: Utility functions are available in the individual executor classes
// For complex workflows, import the specific executors and types you need