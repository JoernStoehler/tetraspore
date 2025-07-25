/**
 * Common interfaces for asset creation executors
 * 
 * These interfaces define the contracts between executors, storage, and external services.
 */

// Core Action types (from DSL parser specification)
export type Action = 
  | ReasonAction
  | AssetImageAction
  | AssetSubtitleAction
  | AssetCutsceneAction
  | WhenThenAction
  | PlayCutsceneAction
  | ShowModalAction
  | AddFeatureAction
  | RemoveFeatureAction
  | AddPlayerChoiceAction;

// Asset-specific actions
export interface AssetImageAction {
  type: 'asset_image';
  id: string;
  prompt: string;
  size: '1024x768' | '768x1024' | '1024x1024';
  model: 'flux-schnell' | 'sdxl';
}

export interface AssetSubtitleAction {
  type: 'asset_subtitle';
  id: string;
  text: string;
  voice_gender: 'neutral' | 'feminine' | 'masculine';
  voice_tone: 'epic' | 'calm' | 'mysterious' | 'urgent';
  voice_pace: 'slow' | 'normal' | 'fast';
  model: 'openai-tts' | 'google-tts';
}

export interface AssetCutsceneAction {
  type: 'asset_cutscene';
  id: string;
  shots: CutsceneShot[];
}

export interface CutsceneShot {
  image_id: string;
  subtitle_id: string;
  duration: number;
  animation: 'fade_in' | 'zoom_in' | 'pan_left' | 'pan_right' | 'static';
}

// Other action types (for completeness)
export interface ReasonAction {
  type: 'reason';
  ephemeral_reasoning: string;
}

export interface WhenThenAction {
  type: 'when_then';
  condition: string;
  action: Action;
}

export interface PlayCutsceneAction {
  type: 'play_cutscene';
  cutscene_id: string;
}

export interface ShowModalAction {
  type: 'show_modal';
  title: string;
  content: string;
  actions: string[];
}

export interface AddFeatureAction {
  type: 'add_feature';
  feature_type: string;
  feature_data: Record<string, unknown>;
  target: string;
}

export interface RemoveFeatureAction {
  type: 'remove_feature';  
  feature_type: string;
  target: string;
}

export interface AddPlayerChoiceAction {
  type: 'add_player_choice';
  choice_id: string;
  title: string;
  description: string;
  actions: Action[];
}

// Core executor interfaces
export interface AssetExecutor<T extends Action, R extends AssetResult> {
  execute(action: T, context: ExecutionContext): Promise<R>;
  validate(action: T): ValidationResult;
  estimateCost(action: T): CostEstimate;
}

export interface ExecutionContext {
  apiKeys: APIKeys;
  storage: AssetStorage;
  cache: AssetCache;
  rateLimiter: RateLimiter;
  costTracker: CostTracker;
}

export interface AssetResult {
  id: string;
  url: string;
  metadata: Record<string, unknown>;
  cost: number;
  duration?: number; // For audio assets
}

export interface ImageAssetResult extends AssetResult {
  metadata: {
    format: 'png' | 'jpg';
    width: number;
    height: number;
    model: string;
    prompt: string;
    enhancedPrompt?: string;
    [key: string]: unknown;
  };
}

export interface AudioAssetResult extends AssetResult {
  duration: number;
  metadata: {
    format: 'mp3' | 'wav';
    model: string;
    voice: string;
    text: string;
    sampleRate: number;
    voiceGender?: string;
    voiceTone?: string;
    voicePace?: string;
    characterCount?: number;
    [key: string]: unknown;
  };
}

export interface CutsceneAssetResult extends AssetResult {
  metadata: {
    totalDuration: number;
    shotCount: number;
    shots: CutsceneDefinitionShot[];
    [key: string]: unknown;
  };
}

// API Keys interface
export interface APIKeys {
  fluxApiKey?: string;
  replicateApiKey?: string;
  openaiApiKey?: string;
  googleCloudApiKey?: string;
  [key: string]: string | undefined;
}

// Asset Storage interface
export interface AssetStorage {
  store(data: Buffer | Uint8Array, metadata: AssetMetadata): Promise<StoredAsset>;
  storeJSON(data: object, metadata: AssetMetadata): Promise<StoredAsset>;
  getUrl(id: string): Promise<string>;
  getDuration(id: string): Promise<number | undefined>;
  exists(id: string): Promise<boolean>;
}

export interface AssetMetadata {
  id: string;
  type: 'image' | 'audio' | 'cutscene';
  format?: string;
  duration?: number;
}

export interface StoredAsset {
  id: string;
  url: string;
  metadata: AssetMetadata;
}

// Caching interface
export interface AssetCache {
  get<T>(key: string | Action): Promise<T | null>;
  set<T>(key: string | Action, value: T, ttl?: number): Promise<void>;
  clear(): Promise<void>;
}

// Rate limiting interface
export interface RateLimiter {
  acquire(resource: 'image_generation' | 'tts_generation'): Promise<void>;
  reset(resource?: string): void;
}

// Cost tracking interfaces
export interface CostTracker {
  record(type: AssetType, model: string, units: number): void;
  getTotalCost(): number;
  getCostBreakdown(): CostBreakdown;
}

export type AssetType = 'image' | 'tts';

export interface CostRecord {
  timestamp: number;
  type: AssetType;
  model: string;
  units: number;
  cost: number;
}

export interface CostBreakdown {
  total: number;
  byType: Record<AssetType, number>;
  byModel: Record<string, number>;
}

export interface CostEstimate {
  min: number;
  max: number;
  currency: 'USD';
}

// Validation interface
export interface ValidationResult {
  valid: boolean;
  errors: ExecutorValidationError[];
}

export interface ExecutorValidationError {
  field: string;
  message: string;
  code: string;
}

// Cutscene definition interfaces
export interface CutsceneDefinition {
  id: string;
  shots: CutsceneDefinitionShot[];
}

export interface CutsceneDefinitionShot {
  imageUrl: string;
  audioUrl: string;
  duration: number;
  animation: CutsceneShot['animation'];
  audioDuration: number;
}

// Voice configuration interfaces
export interface VoiceConfig {
  voice: string;
  speed: number;
  pitch: number;
}

// API response interfaces
export interface FluxAPIResponse {
  imageData: Buffer;
  cost: number;
}

export interface SDXLAPIResponse {
  imageData: Buffer;
  cost: number;
}

export interface OpenAITTSResponse {
  audioData: Buffer;
  cost: number;
}

export interface GoogleTTSResponse {
  audioData: Buffer;
  cost: number;
}

// Error classes
export class AssetGenerationError extends Error {
  constructor(
    message: string,
    public readonly action: Action,
    public readonly retryable: boolean,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AssetGenerationError';
  }
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class StorageError extends Error {
  constructor(
    message: string,
    public readonly operation: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

export class RateLimitError extends Error {
  constructor(
    message: string,
    public readonly retryAfter: number
  ) {
    super(message);
    this.name = 'RateLimitError';
  }
}