/**
 * Tests for ImageAssetExecutor
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ImageAssetExecutor } from './ImageAssetExecutor';
import { 
  createMockExecutionContext, 
  MockAssetStorage, 
  MockAssetCache,
  mockActions
} from './mocks';
import { ImageAssetResult } from './types';

describe('ImageAssetExecutor', () => {
  let executor: ImageAssetExecutor;
  let mockContext: ReturnType<typeof createMockExecutionContext>;
  let mockStorage: MockAssetStorage;
  let mockCache: MockAssetCache;

  beforeEach(() => {
    executor = new ImageAssetExecutor();
    mockStorage = new MockAssetStorage();
    mockCache = new MockAssetCache();
    mockContext = createMockExecutionContext({
      storage: mockStorage,
      cache: mockCache
    });
  });

  describe('validate', () => {
    it('should pass validation for valid action', () => {
      const action = mockActions.image();
      const result = executor.validate(action);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for missing ID', () => {
      const action = mockActions.image({ id: '' });
      const result = executor.validate(action);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'id',
        message: 'ID is required and cannot be empty',
        code: 'REQUIRED'
      });
    });

    it('should fail validation for missing prompt', () => {
      const action = mockActions.image({ prompt: '' });
      const result = executor.validate(action);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'prompt',
        message: 'Prompt is required and cannot be empty',
        code: 'REQUIRED'
      });
    });

    it('should fail validation for invalid size', () => {
      const action = mockActions.image({ size: '512x512' as never });
      const result = executor.validate(action);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'size',
        message: 'Size must be one of: 1024x768, 768x1024, 1024x1024',
        code: 'INVALID_VALUE'
      });
    });

    it('should fail validation for invalid model', () => {
      const action = mockActions.image({ model: 'dalle' as never });
      const result = executor.validate(action);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'model',
        message: 'Model must be one of: flux-schnell, sdxl',
        code: 'INVALID_VALUE'
      });
    });

    it('should fail validation for too long prompt', () => {
      const action = mockActions.image({ prompt: 'a'.repeat(1001) });
      const result = executor.validate(action);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'prompt',
        message: 'Prompt must be 1000 characters or less',
        code: 'TOO_LONG'
      });
    });

    it('should fail validation for problematic content', () => {
      const action = mockActions.image({ prompt: 'violent scene with blood' });
      const result = executor.validate(action);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'prompt',
        message: 'Prompt contains potentially problematic content',
        code: 'CONTENT_VIOLATION'
      });
    });
  });

  describe('estimateCost', () => {
    it('should return zero cost for flux-schnell', () => {
      const action = mockActions.image({ model: 'flux-schnell' });
      const estimate = executor.estimateCost(action);
      
      expect(estimate).toEqual({
        min: 0,
        max: 0,
        currency: 'USD'
      });
    });

    it('should return correct cost for SDXL', () => {
      const action = mockActions.image({ model: 'sdxl' });
      const estimate = executor.estimateCost(action);
      
      expect(estimate).toEqual({
        min: 0.009,
        max: 0.009,
        currency: 'USD'
      });
    });
  });

  describe('execute', () => {
    it('should generate image successfully', async () => {
      const action = mockActions.image({
        id: 'test-image',
        prompt: 'alien landscape',
        size: '1024x768',
        model: 'flux-schnell'
      });

      const result = await executor.execute(action, mockContext);

      expect(result).toMatchObject({
        id: 'test-image',
        cost: 0,
        metadata: {
          format: 'png',
          width: 1024,
          height: 768,
          model: 'flux-schnell',
          prompt: 'alien landscape'
        }
      });

      expect(result.url).toBeDefined();
      expect(result.metadata.enhancedPrompt).toContain('alien landscape');
      expect(result.metadata.enhancedPrompt).toContain('high quality');
    });

    it('should return cached result if available', async () => {
      const action = mockActions.image({ id: 'cached-image' });
      
      // Pre-populate cache
      const cachedResult: ImageAssetResult = {
        id: 'cached-image',
        url: '/cached/image.png',
        metadata: {
          format: 'png',
          width: 1024,
          height: 768,
          model: 'flux-schnell',
          prompt: 'cached prompt'
        },
        cost: 0
      };
      
      await mockCache.set('mock-cache-key', cachedResult);
      
      // Mock getCacheKey to return our known key
      const originalGetCacheKey = executor['getCacheKey'];
      executor['getCacheKey'] = () => 'mock-cache-key';

      const result = await executor.execute(action, mockContext);
      
      expect(result).toEqual(cachedResult);
      
      // Restore original method
      executor['getCacheKey'] = originalGetCacheKey;
    });

    it('should handle different image sizes correctly', async () => {
      const sizes: Array<'1024x768' | '768x1024' | '1024x1024'> = [
        '1024x768',
        '768x1024', 
        '1024x1024'
      ];

      for (const size of sizes) {
        const action = mockActions.image({ 
          id: `test-${size}`,
          size 
        });

        const result = await executor.execute(action, mockContext);
        const [expectedWidth, expectedHeight] = size.split('x').map(Number);

        expect(result.metadata.width).toBe(expectedWidth);
        expect(result.metadata.height).toBe(expectedHeight);
      }
    }, 10000); // 10 second timeout

    it('should handle SDXL model with correct cost', async () => {
      const action = mockActions.image({ 
        id: 'sdxl-test',
        model: 'sdxl' 
      });

      const result = await executor.execute(action, mockContext);

      expect(result.metadata.model).toBe('sdxl');
      expect(result.cost).toBe(0.009);
    });

    it('should throw error for invalid action', async () => {
      const action = mockActions.image({ id: '', prompt: '' });

      await expect(executor.execute(action, mockContext)).rejects.toThrow();
    });

    it('should apply rate limiting', async () => {
      const action = mockActions.image();
      
      // Mock rate limiter to track calls
      const acquireSpy = vi.spyOn(mockContext.rateLimiter, 'acquire');
      
      await executor.execute(action, mockContext);
      
      expect(acquireSpy).toHaveBeenCalledWith('image_generation');
    });

    it('should track costs correctly', async () => {
      const action = mockActions.image({ model: 'sdxl' });
      
      const recordSpy = vi.spyOn(mockContext.costTracker, 'record');
      
      await executor.execute(action, mockContext);
      
      expect(recordSpy).toHaveBeenCalledWith('image', 'sdxl', 1);
    });

    it('should store result in cache after generation', async () => {
      const action = mockActions.image({ id: 'cache-test' });
      
      const setSpy = vi.spyOn(mockCache, 'set');
      
      await executor.execute(action, mockContext);
      
      expect(setSpy).toHaveBeenCalled();
    });
  });

  describe('static utility methods', () => {
    describe('getRecommendedModel', () => {
      it('should recommend SDXL for hero shots', () => {
        const model = ImageAssetExecutor.getRecommendedModel('hero_shot');
        expect(model).toBe('sdxl');
      });

      it('should recommend Flux for other use cases', () => {
        const useCases: Array<'background' | 'icon' | 'general'> = [
          'background', 'icon', 'general'
        ];

        useCases.forEach(useCase => {
          const model = ImageAssetExecutor.getRecommendedModel(useCase);
          expect(model).toBe('flux-schnell');
        });
      });
    });

    describe('getRecommendedSize', () => {
      it('should return correct sizes for use cases', () => {
        expect(ImageAssetExecutor.getRecommendedSize('landscape')).toBe('1024x768');
        expect(ImageAssetExecutor.getRecommendedSize('portrait')).toBe('768x1024');
        expect(ImageAssetExecutor.getRecommendedSize('square')).toBe('1024x1024');
      });
    });

    describe('createSciFiPrompt', () => {
      it('should enhance prompts with sci-fi themes', () => {
        const basePrompt = 'mysterious structure';
        
        const alienPrompt = ImageAssetExecutor.createSciFiPrompt(basePrompt, 'alien');
        expect(alienPrompt).toContain('mysterious structure');
        expect(alienPrompt).toContain('alien creatures');
        expect(alienPrompt).toContain('sci-fi');

        const spacePrompt = ImageAssetExecutor.createSciFiPrompt(basePrompt, 'space');
        expect(spacePrompt).toContain('cosmic');
        expect(spacePrompt).toContain('nebula');

        const techPrompt = ImageAssetExecutor.createSciFiPrompt(basePrompt, 'technology');
        expect(techPrompt).toContain('futuristic technology');

        const planetPrompt = ImageAssetExecutor.createSciFiPrompt(basePrompt, 'planet');
        expect(planetPrompt).toContain('alien planet');
      });
    });
  });

  describe('error handling', () => {
    it('should handle API failures with retry', async () => {
      const action = mockActions.image();
      
      // Mock API to fail initially then succeed
      let callCount = 0;
      const originalCallFluxAPI = executor['callFluxAPI'];
      executor['callFluxAPI'] = async (...args) => {
        callCount++;
        if (callCount === 1) {
          throw new Error('API temporary failure');
        }
        return originalCallFluxAPI.apply(executor, args);
      };

      const result = await executor.execute(action, mockContext);
      
      expect(result).toBeDefined();
      expect(callCount).toBe(2); // Failed once, then succeeded
    });

    it('should fail after max retries', async () => {
      const action = mockActions.image();
      
      // Mock API to always fail
      executor['callFluxAPI'] = async () => {
        throw new Error('Persistent API failure');
      };
      executor['callSDXLAPI'] = async () => {
        throw new Error('Persistent API failure');
      };

      await expect(executor.execute(action, mockContext)).rejects.toThrow(
        'Image generation failed after 3 attempts'
      );
    });
  });

  describe('prompt enhancement', () => {
    it('should enhance basic prompts', () => {
      const basicPrompt = 'alien landscape';
      const enhanced = executor['enhancePrompt'](basicPrompt);
      
      expect(enhanced).toContain(basicPrompt);
      expect(enhanced).toContain('high quality');
      expect(enhanced).toContain('detailed');
      expect(enhanced).toContain('cinematic lighting');
    });

    it('should not duplicate existing style modifiers', () => {
      const styledPrompt = 'alien landscape, high quality, detailed';
      const enhanced = executor['enhancePrompt'](styledPrompt);
      
      expect(enhanced).toBe(styledPrompt); // Should remain unchanged
    });
  });

  describe('content filtering', () => {
    it('should detect problematic content', () => {
      const problematicTerms = [
        'violence', 'violent', 'gore', 'blood',
        'nude', 'naked', 'nsfw', 'sexual',
        'hate', 'racist', 'discrimination'
      ];

      problematicTerms.forEach(term => {
        const hasProblematic = executor['containsProblematicContent'](`test ${term} content`);
        expect(hasProblematic).toBe(true);
      });

      const cleanContent = executor['containsProblematicContent']('beautiful alien landscape');
      expect(cleanContent).toBe(false);
    });
  });
});