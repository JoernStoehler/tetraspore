/**
 * Base executor with shared logic for all asset executors
 * 
 * Provides common functionality for caching, rate limiting, retry logic,
 * and error handling that all asset executors can inherit from.
 */

import {
  Action,
  AssetExecutor,
  AssetResult,
  ExecutionContext,
  ValidationResult,
  CostEstimate,
  AssetGenerationError,
  RateLimitError
} from './types';

export abstract class BaseExecutor<T extends Action, R extends AssetResult> 
  implements AssetExecutor<T, R> {

  protected maxRetries = 3;
  protected baseRetryDelay = 1000; // 1 second
  protected maxRetryDelay = 30000; // 30 seconds

  abstract execute(action: T, context: ExecutionContext): Promise<R>;
  abstract validate(action: T): ValidationResult;
  abstract estimateCost(action: T): CostEstimate;

  /**
   * Execute with automatic retry logic for transient failures
   */
  protected async executeWithRetry<TResult>(
    operation: () => Promise<TResult>,
    context: { action: T; operation: string }
  ): Promise<TResult> {
    let lastError: Error;

    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Don't retry non-retryable errors
        if (error instanceof AssetGenerationError && !error.retryable) {
          throw error;
        }

        // Don't retry validation errors
        if (error instanceof Error && error.name === 'ValidationError') {
          throw error;
        }

        // On final attempt, throw the error
        if (attempt === this.maxRetries) {
          throw new AssetGenerationError(
            `${context.operation} failed after ${this.maxRetries} attempts: ${lastError.message}`,
            context.action,
            false,
            { originalError: lastError, attempts: attempt }
          );
        }

        // Calculate exponential backoff delay
        const delay = Math.min(
          this.baseRetryDelay * Math.pow(2, attempt - 1),
          this.maxRetryDelay
        );

        console.warn(
          `${context.operation} attempt ${attempt} failed: ${lastError.message}. Retrying in ${delay}ms...`
        );

        await this.sleep(delay);
      }
    }

    // This should never be reached due to the throw in the loop
    throw lastError!;
  }

  /**
   * Generate deterministic cache key from action parameters
   *
   * Why normalization: Action objects may have properties in different orders
   * or contain functions that break cache key consistency.
   */
  protected getCacheKey(action: T): string {
    const normalized = this.normalizeAction(action);
    return this.hashObject(normalized);
  }

  /**
   * Normalize action object for deterministic hashing
   *
   * Why needed: Objects with identical content but different key ordering
   * would generate different cache keys without normalization.
   */
  protected normalizeAction(action: T): Record<string, unknown> {
    const copy = { ...action };
    return this.sortObjectKeys(copy) as Record<string, unknown>;
  }

  /**
   * Sort object keys recursively for consistent hashing
   */
  protected sortObjectKeys(obj: unknown): unknown {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sortObjectKeys(item));
    }

    const sorted: Record<string, unknown> = {};
    Object.keys(obj as Record<string, unknown>).sort().forEach(key => {
      sorted[key] = this.sortObjectKeys((obj as Record<string, unknown>)[key]);
    });

    return sorted;
  }

  /**
   * Simple hash function for cache keys
   */
  protected hashObject(obj: unknown): string {
    const str = JSON.stringify(obj);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Check cache for existing result
   */
  protected async checkCache(action: T, context: ExecutionContext): Promise<R | null> {
    try {
      const cacheKey = this.getCacheKey(action);
      const cached = await context.cache.get<R>(cacheKey);
      
      if (cached) {
        const actionId = 'id' in action ? action.id : 'unknown';
        console.log(`Cache hit for action ${actionId}`);
        return cached;
      }
      
      return null;
    } catch (error) {
      const actionId = 'id' in action ? action.id : 'unknown';
      console.warn(`Cache check failed for action ${actionId}:`, error);
      return null;
    }
  }

  /**
   * Store result in cache
   */
  protected async storeInCache(action: T, result: R, context: ExecutionContext): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(action);
      await context.cache.set(cacheKey, result);
      const actionId = 'id' in action ? action.id : 'unknown';
      console.log(`Cached result for action ${actionId}`);
    } catch (error) {
      const actionId = 'id' in action ? action.id : 'unknown';
      console.warn(`Failed to cache result for action ${actionId}:`, error);
      // Don't throw - caching failures shouldn't break execution
    }
  }

  /**
   * Apply rate limiting for the given resource
   */
  protected async applyRateLimit(
    resource: 'image_generation' | 'tts_generation',
    context: ExecutionContext
  ): Promise<void> {
    try {
      await context.rateLimiter.acquire(resource);
    } catch (error) {
      if (error instanceof RateLimitError) {
        console.warn(`Rate limit hit for ${resource}. Waiting ${error.retryAfter}ms...`);
        await this.sleep(error.retryAfter);
        // Try again after waiting
        await context.rateLimiter.acquire(resource);
      } else {
        throw error;
      }
    }
  }

  /**
   * Validate action and throw detailed errors
   */
  protected validateAction(action: T): void {
    const result = this.validate(action);
    if (!result.valid) {
      const errorMessages = result.errors.map(e => `${e.field}: ${e.message}`).join(', ');
      throw new AssetGenerationError(
        `Validation failed: ${errorMessages}`,
        action,
        false,
        { validationErrors: result.errors }
      );
    }
  }

  /**
   * Enhanced error handling with context
   */
  protected createError(
    message: string,
    action: T,
    retryable: boolean,
    details?: unknown
  ): AssetGenerationError {
    return new AssetGenerationError(message, action, retryable, details);
  }

  /**
   * Sleep utility for delays
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Safe JSON parsing with error handling
   */
  protected safeJsonParse<T>(str: string, fallback: T): T {
    try {
      return JSON.parse(str);
    } catch (error) {
      console.warn('Failed to parse JSON, using fallback:', error);
      return fallback;
    }
  }

  /**
   * Extract file extension from content type
   */
  protected getFileExtension(contentType: string): string {
    const typeMap: Record<string, string> = {
      'image/png': 'png',
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'audio/mp3': 'mp3'
    };

    return typeMap[contentType.toLowerCase()] || 'bin';
  }

  /**
   * Validate required API keys
   */
  protected validateApiKeys(required: string[], apiKeys: Record<string, string | undefined>): void {
    const missing = required.filter(key => !apiKeys[key]);
    if (missing.length > 0) {
      throw new Error(`Missing required API keys: ${missing.join(', ')}`);
    }
  }

  /**
   * Log execution metrics
   */
  protected logMetrics(action: T, startTime: number, result: R): void {
    const duration = Date.now() - startTime;
    const actionId = 'id' in action ? action.id : 'unknown';
    console.log(`Executed ${action.type} for ${actionId} in ${duration}ms, cost: $${result.cost}`);
  }

  /**
   * Create standard metadata for assets
   */
  protected createBaseMetadata(action: T, additionalData: Record<string, unknown> = {}): Record<string, unknown> {
    const actionId = 'id' in action ? action.id : 'unknown';
    return {
      actionId,
      actionType: action.type,
      createdAt: new Date().toISOString(),
      ...additionalData
    };
  }
}