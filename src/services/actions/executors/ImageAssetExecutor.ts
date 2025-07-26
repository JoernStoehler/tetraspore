/**
 * Image Asset Executor
 * 
 * Generates images via AI image generation APIs (Flux Schnell, SDXL).
 * Handles caching, rate limiting, and cost tracking.
 */

import { BaseExecutor } from './BaseExecutor';
import {
  AssetImageAction,
  ImageAssetResult,
  ExecutionContext,
  ValidationResult,
  ExecutorValidationError,
  CostEstimate,
  FluxAPIResponse,
  SDXLAPIResponse
} from './types';
import { toError } from '../../../utils/errors';

export class ImageAssetExecutor extends BaseExecutor<AssetImageAction, ImageAssetResult> {

  /**
   * Execute image generation with caching and error handling
   */
  async execute(action: AssetImageAction, context: ExecutionContext): Promise<ImageAssetResult> {
    const startTime = Date.now();

    // Validate action
    this.validateAction(action);

    // Check cache first
    const cached = await this.checkCache(action, context);
    if (cached) {
      return cached;
    }

    // Apply rate limiting
    await this.applyRateLimit('image_generation', context);

    // Generate image with retry logic
    const result = await this.executeWithRetry(
      () => this.generateImage(action, context),
      { action, operation: 'Image generation' }
    );

    // Store in cache
    await this.storeInCache(action, result, context);

    // Log metrics
    this.logMetrics(action, startTime, result);

    return result;
  }

  /**
   * Validate image action parameters
   */
  validate(action: AssetImageAction): ValidationResult {
    const errors: ExecutorValidationError[] = [];

    // Validate required fields
    if (!action.id?.trim()) {
      errors.push({
        field: 'id',
        message: 'ID is required and cannot be empty',
        code: 'REQUIRED'
      });
    }

    if (!action.prompt?.trim()) {
      errors.push({
        field: 'prompt',
        message: 'Prompt is required and cannot be empty',
        code: 'REQUIRED'
      });
    }

    // Validate size format
    const validSizes = ['1024x768', '768x1024', '1024x1024'];
    if (!validSizes.includes(action.size)) {
      errors.push({
        field: 'size',
        message: `Size must be one of: ${validSizes.join(', ')}`,
        code: 'INVALID_VALUE'
      });
    }

    // Validate model
    const validModels = ['flux-schnell', 'sdxl'];
    if (!validModels.includes(action.model)) {
      errors.push({
        field: 'model',
        message: `Model must be one of: ${validModels.join(', ')}`,
        code: 'INVALID_VALUE'
      });
    }

    // Validate prompt length (reasonable limits)
    if (action.prompt && action.prompt.length > 1000) {
      errors.push({
        field: 'prompt',
        message: 'Prompt must be 1000 characters or less',
        code: 'TOO_LONG'
      });
    }

    // Check for potentially problematic content
    if (action.prompt && this.containsProblematicContent(action.prompt)) {
      errors.push({
        field: 'prompt',
        message: 'Prompt contains potentially problematic content',
        code: 'CONTENT_VIOLATION'
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Estimate cost for image generation
   */
  estimateCost(action: AssetImageAction): CostEstimate {
    // Cost per image by model
    const modelCosts: Record<string, number> = {
      'flux-schnell': 0.0, // Currently free via Together AI
      'sdxl': 0.009 // $0.009 per image
    };

    const baseCost = modelCosts[action.model] ?? 0.009;

    return {
      min: baseCost,
      max: baseCost,
      currency: 'USD'
    };
  }

  /**
   * Generate image using appropriate API
   */
  private async generateImage(action: AssetImageAction, context: ExecutionContext): Promise<ImageAssetResult> {
    // Enhance prompt with style guidelines
    const enhancedPrompt = this.enhancePrompt(action.prompt);

    // Call appropriate API based on model
    const apiResponse = action.model === 'flux-schnell' 
      ? await this.callFluxAPI(enhancedPrompt, action.size, context)
      : await this.callSDXLAPI(enhancedPrompt, action.size, context);

    // Parse dimensions from size
    const [width, height] = action.size.split('x').map(Number);

    // Store the generated image
    const storedAsset = await context.storage.store(apiResponse.imageData, {
      id: action.id,
      type: 'image',
      format: 'png'
    });

    // Track cost
    context.costTracker.record('image', action.model, 1);

    // Create result
    const result: ImageAssetResult = {
      id: action.id,
      url: storedAsset.url,
      metadata: {
        format: 'png' as const,
        width,
        height,
        model: action.model,
        prompt: action.prompt,
        enhancedPrompt,
        ...this.createBaseMetadata(action)
      },
      cost: apiResponse.cost
    };

    return result;
  }

  /**
   * Enhance prompt with consistent style modifiers
   */
  private enhancePrompt(prompt: string): string {
    // Add consistent style modifiers for better results
    const styleModifiers = [
      'high quality',
      'detailed',
      'cinematic lighting',
      'professional photography'
    ];

    // Check if prompt already contains style modifiers to avoid duplication
    const hasStyleModifiers = styleModifiers.some(modifier => 
      prompt.toLowerCase().includes(modifier.toLowerCase())
    );

    if (hasStyleModifiers) {
      return prompt;
    }

    return `${prompt}, ${styleModifiers.join(', ')}`;
  }

  /**
   * Call Flux API via Together AI
   */
  private async callFluxAPI(prompt: string, size: string, context: ExecutionContext): Promise<FluxAPIResponse> {
    this.validateApiKeys(['fluxApiKey'], context.apiKeys);

    try {
      // Mock API call for now - would be replaced with actual Together AI API
      console.log(`[MOCK] Calling Flux API: ${prompt} (${size})`);
      
      // Simulate API delay
      await this.sleep(2000);

      // Create mock image data
      const imageData = Buffer.from(`Mock Flux image data for: ${prompt}`);

      return {
        imageData,
        cost: 0.0 // Currently free
      };

    } catch (error) {
      const errorObj = toError(error, 'Flux API call failed');
      throw this.createError(
        `Flux API call failed: ${errorObj.message}`,
        { type: 'asset_image', id: 'temp', prompt, size, model: 'flux-schnell' } as AssetImageAction,
        true, // Retryable
        { originalError: errorObj }
      );
    }
  }

  /**
   * Call SDXL API (Replicate or other provider)
   */
  private async callSDXLAPI(prompt: string, size: string, context: ExecutionContext): Promise<SDXLAPIResponse> {
    this.validateApiKeys(['replicateApiKey'], context.apiKeys);

    try {
      // Mock API call for now - would be replaced with actual Replicate API
      console.log(`[MOCK] Calling SDXL API: ${prompt} (${size})`);
      
      // Simulate API delay
      await this.sleep(3000);

      // Create mock image data
      const imageData = Buffer.from(`Mock SDXL image data for: ${prompt}`);

      return {
        imageData,
        cost: 0.009 // $0.009 per image
      };

    } catch (error) {
      const errorObj = toError(error, 'SDXL API call failed');
      throw this.createError(
        `SDXL API call failed: ${errorObj.message}`,
        { type: 'asset_image', id: 'temp', prompt, size, model: 'sdxl' } as AssetImageAction,
        true, // Retryable
        { originalError: errorObj }
      );
    }
  }

  /**
   * Check for potentially problematic content in prompts
   */
  private containsProblematicContent(prompt: string): boolean {
    // Basic content filtering - in production, would use more sophisticated filtering
    const problematicTerms = [
      'violence', 'violent', 'gore', 'blood',
      'nude', 'naked', 'nsfw', 'sexual',
      'hate', 'racist', 'discrimination'
    ];

    const lowerPrompt = prompt.toLowerCase();
    return problematicTerms.some(term => lowerPrompt.includes(term));
  }

  /**
   * Get recommended model based on use case
   */
  static getRecommendedModel(useCase: 'hero_shot' | 'background' | 'icon' | 'general'): 'flux-schnell' | 'sdxl' {
    // Hero shots benefit from SDXL quality, others can use free Flux
    return useCase === 'hero_shot' ? 'sdxl' : 'flux-schnell';
  }

  /**
   * Get recommended size based on use case
   */
  static getRecommendedSize(useCase: 'landscape' | 'portrait' | 'square'): '1024x768' | '768x1024' | '1024x1024' {
    const sizeMap = {
      landscape: '1024x768' as const,
      portrait: '768x1024' as const,
      square: '1024x1024' as const
    };

    return sizeMap[useCase];
  }

  /**
   * Create optimized prompt for sci-fi game content
   */
  static createSciFiPrompt(basePrompt: string, theme: 'alien' | 'space' | 'technology' | 'planet'): string {
    const themeModifiers = {
      alien: 'alien creatures, bioluminescent, otherworldly',
      space: 'cosmic, nebula, stars, deep space',
      technology: 'futuristic technology, advanced machinery, sci-fi interfaces',
      planet: 'alien planet, strange landscapes, exotic atmosphere'
    };

    return `${basePrompt}, ${themeModifiers[theme]}, sci-fi, futuristic`;
  }
}