/**
 * Mock Executors for Testing
 * 
 * Provides mock implementations of all asset executors for testing purposes.
 * These executors simulate API calls without making actual requests.
 */

import {
  AssetImageAction,
  AssetSubtitleAction,
  AssetCutsceneAction,
  ImageAssetResult,
  AudioAssetResult,
  CutsceneAssetResult,
  ExecutionContext,
  ValidationResult,
  ExecutorValidationError,
  CostEstimate,
  AssetExecutor,
  AssetStorage,
  AssetCache,
  RateLimiter,
  CostTracker,
  StoredAsset,
  AssetMetadata,
  AssetResult
} from './types';

/**
 * Mock Image Asset Executor
 */
export class MockImageAssetExecutor implements AssetExecutor<AssetImageAction, ImageAssetResult> {
  private delay: number;
  private shouldFail: boolean;

  constructor(delay = 100, shouldFail = false) {
    this.delay = delay;
    this.shouldFail = shouldFail;
  }

  async execute(action: AssetImageAction, _context?: ExecutionContext): Promise<ImageAssetResult> {
    void _context;
    if (this.shouldFail) {
      throw new Error(`Mock image generation failed for ${action.id}`);
    }

    // Simulate API delay
    await this.sleep(this.delay);

    // Parse dimensions
    const [width, height] = action.size.split('x').map(Number);

    // Create mock result
    const result: ImageAssetResult = {
      id: action.id,
      url: `/mock/images/${action.id}.png`,
      metadata: {
        format: 'png' as const,
        width,
        height,
        model: action.model,
        prompt: action.prompt,
        mockGenerated: true,
        generatedAt: new Date().toISOString()
      },
      cost: action.model === 'flux-schnell' ? 0.01 : 0.009
    };

    return result;
  }

  validate(action: AssetImageAction): ValidationResult {
    const errors: Array<{ field: string; message: string; code: string }> = [];

    if (!action.id) {
      errors.push({ field: 'id', message: 'ID is required', code: 'REQUIRED' });
    }
    if (!action.prompt) {
      errors.push({ field: 'prompt', message: 'Prompt is required', code: 'REQUIRED' });
    }

    return { valid: errors.length === 0, errors: errors as ExecutorValidationError[] };
  }

  estimateCost(action: AssetImageAction): CostEstimate {
    const cost = action.model === 'flux-schnell' ? 0.01 : 0.009;
    return { min: cost, max: cost, currency: 'USD' };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Mock Subtitle Asset Executor
 */
export class MockSubtitleAssetExecutor implements AssetExecutor<AssetSubtitleAction, AudioAssetResult> {
  private delay: number;
  private shouldFail: boolean;

  constructor(delay = 150, shouldFail = false) {
    this.delay = delay;
    this.shouldFail = shouldFail;
  }

  async execute(action: AssetSubtitleAction, _context?: ExecutionContext): Promise<AudioAssetResult> {
    void _context;
    if (this.shouldFail) {
      throw new Error(`Mock TTS generation failed for ${action.id}`);
    }

    // Simulate API delay
    await this.sleep(this.delay);

    // Estimate duration based on text length
    const estimatedDuration = Math.max(1, Math.round(action.text.length / 10));

    // Calculate cost
    const costPerChar = action.model === 'openai-tts' ? 15 / 1_000_000 : 4 / 1_000_000;
    const cost = action.text.length * costPerChar;

    // Create mock result
    const result: AudioAssetResult = {
      id: action.id,
      url: `/mock/audio/${action.id}.mp3`,
      duration: estimatedDuration,
      metadata: {
        format: 'mp3' as const,
        model: action.model,
        voice: `mock-${action.voice_gender}-${action.voice_tone}`,
        text: action.text,
        sampleRate: 22050,
        mockGenerated: true,
        generatedAt: new Date().toISOString()
      },
      cost
    };

    return result;
  }

  validate(action: AssetSubtitleAction): ValidationResult {
    const errors: Array<{ field: string; message: string; code: string }> = [];

    if (!action.id) {
      errors.push({ field: 'id', message: 'ID is required', code: 'REQUIRED' });
    }
    if (!action.text) {
      errors.push({ field: 'text', message: 'Text is required', code: 'REQUIRED' });
    }

    return { valid: errors.length === 0, errors: errors as ExecutorValidationError[] };
  }

  estimateCost(action: AssetSubtitleAction): CostEstimate {
    const costPerChar = action.model === 'openai-tts' ? 15 / 1_000_000 : 4 / 1_000_000;
    const cost = action.text.length * costPerChar;
    return { min: cost, max: cost, currency: 'USD' };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Mock Cutscene Asset Executor
 */
export class MockCutsceneAssetExecutor implements AssetExecutor<AssetCutsceneAction, CutsceneAssetResult> {
  private delay: number;
  private shouldFail: boolean;

  constructor(delay = 50, shouldFail = false) {
    this.delay = delay;
    this.shouldFail = shouldFail;
  }

  async execute(action: AssetCutsceneAction, _context?: ExecutionContext): Promise<CutsceneAssetResult> {
    void _context;
    if (this.shouldFail) {
      throw new Error(`Mock cutscene assembly failed for ${action.id}`);
    }

    // Simulate processing delay
    await this.sleep(this.delay);

    // Calculate total duration
    const totalDuration = action.shots.reduce((sum, shot) => sum + shot.duration, 0);

    // Create mock shots
    const mockShots = action.shots.map(shot => ({
      imageUrl: `/mock/images/${shot.image_id}.png`,
      audioUrl: `/mock/audio/${shot.subtitle_id}.mp3`,
      duration: shot.duration,
      animation: shot.animation,
      audioDuration: Math.max(1, shot.duration - 1) // Mock audio slightly shorter
    }));

    // Create mock result
    const result: CutsceneAssetResult = {
      id: action.id,
      url: `/mock/cutscenes/${action.id}.json`,
      metadata: {
        totalDuration,
        shotCount: action.shots.length,
        shots: mockShots,
        mockGenerated: true,
        generatedAt: new Date().toISOString()
      },
      cost: 0 // No cost for assembly
    };

    return result;
  }

  validate(action: AssetCutsceneAction): ValidationResult {
    const errors: Array<{ field: string; message: string; code: string }> = [];

    if (!action.id) {
      errors.push({ field: 'id', message: 'ID is required', code: 'REQUIRED' });
    }
    if (!action.shots || action.shots.length === 0) {
      errors.push({ field: 'shots', message: 'At least one shot is required', code: 'REQUIRED' });
    }

    return { valid: errors.length === 0, errors: errors as ExecutorValidationError[] };
  }

  estimateCost(): CostEstimate {
    return { min: 0, max: 0, currency: 'USD' };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Mock Asset Storage
 */
export class MockAssetStorage implements AssetStorage {
  private assets = new Map<string, { data: Buffer | object; metadata: AssetMetadata }>();

  async store(data: Buffer | Uint8Array, metadata: AssetMetadata): Promise<StoredAsset> {
    const buffer = data instanceof Buffer ? data : Buffer.from(data);
    this.assets.set(metadata.id, { data: buffer, metadata });

    return {
      id: metadata.id,
      url: `/mock/${metadata.type}s/${metadata.id}.${metadata.format || 'bin'}`,
      metadata
    };
  }

  async storeJSON(data: object, metadata: AssetMetadata): Promise<StoredAsset> {
    this.assets.set(metadata.id, { data, metadata });

    return {
      id: metadata.id,
      url: `/mock/${metadata.type}s/${metadata.id}.json`,
      metadata
    };
  }

  async getUrl(id: string): Promise<string> {
    const asset = this.assets.get(id);
    if (!asset) {
      throw new Error(`Asset not found: ${id}`);
    }

    const extension = asset.metadata.format || 'bin';
    return `/mock/${asset.metadata.type}s/${id}.${extension}`;
  }

  async getDuration(id: string): Promise<number | undefined> {
    const asset = this.assets.get(id);
    return asset?.metadata.duration;
  }

  async exists(id: string): Promise<boolean> {
    return this.assets.has(id);
  }

  async delete(id: string): Promise<void> {
    this.assets.delete(id);
  }

  async list(): Promise<StoredAsset[]> {
    const results: StoredAsset[] = [];
    for (const [id, { metadata }] of this.assets) {
      const extension = metadata.format || 'bin';
      results.push({
        id,
        url: `/mock/${metadata.type}s/${id}.${extension}`,
        metadata
      });
    }
    return results;
  }

  // Test helper methods
  clear(): void {
    this.assets.clear();
  }

  getStoredData(id: string): Buffer | object | undefined {
    return this.assets.get(id)?.data;
  }
}

/**
 * Mock Asset Cache
 */
export class MockAssetCache implements AssetCache {
  private cache = new Map<string, { value: unknown; expires: number }>();

  async get<T>(key: string | object): Promise<T | null> {
    const cacheKey = typeof key === 'string' ? key : JSON.stringify(key);
    const entry = this.cache.get(cacheKey);

    if (!entry || entry.expires < Date.now()) {
      return null;
    }

    return entry.value as T;
  }

  async set<T>(key: string | object, value: T, ttl = 3600000): Promise<void> {
    const cacheKey = typeof key === 'string' ? key : JSON.stringify(key);
    this.cache.set(cacheKey, {
      value,
      expires: Date.now() + ttl
    });
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  // Test helper methods
  size(): number {
    return this.cache.size;
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }
}

/**
 * Mock Rate Limiter
 */
export class MockRateLimiter implements RateLimiter {
  private limits = new Map<string, { count: number; resetTime: number }>();
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests = 100, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async acquire(resource: 'image_generation' | 'tts_generation'): Promise<void> {
    const now = Date.now();
    const limit = this.limits.get(resource);

    if (!limit || limit.resetTime < now) {
      // Reset or initialize limit
      this.limits.set(resource, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return;
    }

    if (limit.count >= this.maxRequests) {
      throw new Error(`Rate limit exceeded for ${resource}`);
    }

    limit.count++;
  }

  reset(resource?: string): void {
    if (resource) {
      this.limits.delete(resource);
    } else {
      this.limits.clear();
    }
  }

  // Test helper methods
  getCount(resource: string): number {
    return this.limits.get(resource)?.count || 0;
  }

  setLimit(maxRequests: number, windowMs?: number): void {
    this.maxRequests = maxRequests;
    if (windowMs !== undefined) {
      this.windowMs = windowMs;
    }
  }
}

/**
 * Mock Cost Tracker
 */
export class MockCostTracker implements CostTracker {
  private costs: Array<{
    timestamp: number;
    type: 'image' | 'tts';
    model: string;
    units: number;
    cost: number;
  }> = [];

  record(type: 'image' | 'tts', model: string, units: number): void {
    const costMap = {
      'flux-schnell': 0,
      'sdxl': 0.009,
      'openai-tts': 15 / 1_000_000,
      'google-tts': 4 / 1_000_000
    };

    const unitCost = costMap[model as keyof typeof costMap] || 0;
    const cost = type === 'image' ? unitCost : unitCost * units;

    this.costs.push({
      timestamp: Date.now(),
      type,
      model,
      units,
      cost
    });
  }

  getTotalCost(): number {
    return this.costs.reduce((sum, record) => sum + record.cost, 0);
  }

  getCostBreakdown(): {
    total: number;
    byType: Record<'image' | 'tts', number>;
    byModel: Record<string, number>;
  } {
    const byType: Record<'image' | 'tts', number> = { image: 0, tts: 0 };
    const byModel: Record<string, number> = {};

    for (const record of this.costs) {
      byType[record.type] += record.cost;
      byModel[record.model] = (byModel[record.model] || 0) + record.cost;
    }

    return {
      total: this.getTotalCost(),
      byType,
      byModel
    };
  }

  // Test helper methods
  clear(): void {
    this.costs = [];
  }

  getRecords(): Array<{
    timestamp: number;
    type: 'image' | 'tts';
    model: string;
    units: number;
    cost: number;
  }> {
    return [...this.costs];
  }
}

/**
 * Create mock execution context for testing
 */
export function createMockExecutionContext(overrides: Partial<ExecutionContext> = {}): ExecutionContext {
  return {
    apiKeys: {
      fluxApiKey: 'mock-flux-key',
      replicateApiKey: 'mock-replicate-key',
      openaiApiKey: 'mock-openai-key',
      googleCloudApiKey: 'mock-google-key',
      ...overrides.apiKeys
    },
    storage: overrides.storage || new MockAssetStorage(),
    cache: overrides.cache || new MockAssetCache(),
    rateLimiter: overrides.rateLimiter || new MockRateLimiter(),
    costTracker: overrides.costTracker || new MockCostTracker()
  };
}

/**
 * Create mock actions for testing
 */
export const mockActions = {
  image: (overrides: Partial<AssetImageAction> = {}): AssetImageAction => ({
    type: 'asset_image',
    id: 'test-image',
    prompt: 'A test image of an alien landscape',
    size: '1024x768',
    model: 'flux-schnell',
    ...overrides
  }),

  subtitle: (overrides: Partial<AssetSubtitleAction> = {}): AssetSubtitleAction => ({
    type: 'asset_subtitle',
    id: 'test-subtitle',
    text: 'This is a test narration for the game.',
    voice_gender: 'neutral',
    voice_tone: 'epic',
    voice_pace: 'normal',
    model: 'openai-tts',
    ...overrides
  }),

  cutscene: (overrides: Partial<AssetCutsceneAction> = {}): AssetCutsceneAction => ({
    type: 'asset_cutscene',
    id: 'test-cutscene',
    shots: [
      {
        image_id: 'test-image-1',
        subtitle_id: 'test-subtitle-1',
        duration: 5,
        animation: 'fade'
      },
      {
        image_id: 'test-image-2',
        subtitle_id: 'test-subtitle-2',
        duration: 4,
        animation: 'slow_zoom'
      }
    ],
    ...overrides
  })
};

/**
 * Test utilities
 */
export const testUtils = {
  /**
   * Wait for a condition to be true
   */
  async waitFor(condition: () => boolean | Promise<boolean>, timeout = 5000): Promise<void> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await condition()) {
        return;
      }
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    throw new Error(`Condition not met within ${timeout}ms`);
  },

  /**
   * Create a failing mock executor
   */
  createFailingExecutor<T extends AssetImageAction | AssetSubtitleAction | AssetCutsceneAction, R extends AssetResult>(
    error: string
  ): AssetExecutor<T, R> {
    return {
      async execute(): Promise<R> {
        throw new Error(error);
      },
      validate(): ValidationResult {
        return { valid: true, errors: [] };
      },
      estimateCost(): CostEstimate {
        return { min: 0, max: 0, currency: 'USD' };
      }
    };
  }
};