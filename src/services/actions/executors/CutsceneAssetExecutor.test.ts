/**
 * Tests for CutsceneAssetExecutor
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CutsceneAssetExecutor } from './CutsceneAssetExecutor';
import { 
  createMockExecutionContext, 
  MockAssetStorage, 
  MockAssetCache,
  mockActions
} from './mocks';
import { CutsceneAssetResult, CutsceneDefinition } from './types';

describe('CutsceneAssetExecutor', () => {
  let executor: CutsceneAssetExecutor;
  let mockContext: ReturnType<typeof createMockExecutionContext>;
  let mockStorage: MockAssetStorage;
  let mockCache: MockAssetCache;

  beforeEach(async () => {
    executor = new CutsceneAssetExecutor();
    mockStorage = new MockAssetStorage();
    mockCache = new MockAssetCache();
    mockContext = createMockExecutionContext({
      storage: mockStorage,
      cache: mockCache
    });

    // Pre-populate storage with required assets
    await mockStorage.store(Buffer.from('mock image 1'), {
      id: 'test-image-1',
      type: 'image',
      format: 'png'
    });
    await mockStorage.store(Buffer.from('mock image 2'), {
      id: 'test-image-2', 
      type: 'image',
      format: 'png'
    });
    await mockStorage.store(Buffer.from('mock audio 1'), {
      id: 'test-subtitle-1',
      type: 'audio',
      format: 'mp3',
      duration: 4
    });
    await mockStorage.store(Buffer.from('mock audio 2'), {
      id: 'test-subtitle-2',
      type: 'audio', 
      format: 'mp3',
      duration: 3
    });
  });

  describe('validate', () => {
    it('should pass validation for valid action', () => {
      const action = mockActions.cutscene();
      const result = executor.validate(action);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for missing ID', () => {
      const action = mockActions.cutscene({ id: '' });
      const result = executor.validate(action);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'id',
        message: 'ID is required and cannot be empty',
        code: 'REQUIRED'
      });
    });

    it('should fail validation for missing shots array', () => {
      const action = mockActions.cutscene({ shots: undefined as never });
      const result = executor.validate(action);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'shots',
        message: 'Shots array is required',
        code: 'REQUIRED'
      });
    });

    it('should fail validation for empty shots array', () => {
      const action = mockActions.cutscene({ shots: [] });
      const result = executor.validate(action);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'shots',
        message: 'Cutscene must have at least one shot',
        code: 'REQUIRED'
      });
    });

    it('should fail validation for shot missing image_id', () => {
      const action = mockActions.cutscene({
        shots: [{
          image_id: '',
          subtitle_id: 'test-subtitle-1',
          duration: 5,
          animation: 'fade_in'
        }]
      });
      const result = executor.validate(action);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'shots[0].image_id',
        message: 'Image ID is required for each shot',
        code: 'REQUIRED'
      });
    });

    it('should fail validation for shot missing subtitle_id', () => {
      const action = mockActions.cutscene({
        shots: [{
          image_id: 'test-image-1',
          subtitle_id: '',
          duration: 5,
          animation: 'fade_in'
        }]
      });
      const result = executor.validate(action);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'shots[0].subtitle_id',
        message: 'Subtitle ID is required for each shot',
        code: 'REQUIRED'
      });
    });

    it('should fail validation for invalid duration', () => {
      const action = mockActions.cutscene({
        shots: [{
          image_id: 'test-image-1',
          subtitle_id: 'test-subtitle-1',
          duration: 0,
          animation: 'fade_in'
        }]
      });
      const result = executor.validate(action);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'shots[0].duration',
        message: 'Duration must be a positive number',
        code: 'INVALID_VALUE'
      });
    });

    it('should fail validation for duration too long', () => {
      const action = mockActions.cutscene({
        shots: [{
          image_id: 'test-image-1',
          subtitle_id: 'test-subtitle-1',
          duration: 35,
          animation: 'fade_in'
        }]
      });
      const result = executor.validate(action);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'shots[0].duration',
        message: 'Shot duration should not exceed 30 seconds',
        code: 'TOO_LONG'
      });
    });

    it('should fail validation for invalid animation', () => {
      const action = mockActions.cutscene({
        shots: [{
          image_id: 'test-image-1',
          subtitle_id: 'test-subtitle-1',
          duration: 5,
          animation: 'spin' as never
        }]
      });
      const result = executor.validate(action);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'shots[0].animation',
        message: 'Animation must be one of: fade_in, zoom_in, pan_left, pan_right, static',
        code: 'INVALID_VALUE'
      });
    });

    it('should fail validation for total duration too long', () => {
      const longShots = Array(10).fill(null).map((_, i) => ({
        image_id: `test-image-${i + 1}`,
        subtitle_id: `test-subtitle-${i + 1}`,
        duration: 35, // Each shot 35 seconds = 350 seconds total
        animation: 'fade_in' as const
      }));

      const action = mockActions.cutscene({ shots: longShots });
      const result = executor.validate(action);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'shots',
        message: 'Total cutscene duration should not exceed 300 seconds (5 minutes)',
        code: 'TOO_LONG'
      });
    });

    it('should fail validation for too many shots', () => {
      const manyShots = Array(51).fill(null).map((_, i) => ({
        image_id: `test-image-${i + 1}`,
        subtitle_id: `test-subtitle-${i + 1}`,
        duration: 2,
        animation: 'fade_in' as const
      }));

      const action = mockActions.cutscene({ shots: manyShots });
      const result = executor.validate(action);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'shots',
        message: 'Cutscene should not have more than 50 shots',
        code: 'TOO_MANY'
      });
    });
  });

  describe('estimateCost', () => {
    it('should return zero cost for cutscene assembly', () => {
      const estimate = executor.estimateCost();
      
      expect(estimate).toEqual({
        min: 0,
        max: 0,
        currency: 'USD'
      });
    });
  });

  describe('execute', () => {
    it('should assemble cutscene successfully', async () => {
      const action = mockActions.cutscene({
        id: 'test-cutscene',
        shots: [
          {
            image_id: 'test-image-1',
            subtitle_id: 'test-subtitle-1',
            duration: 5,
            animation: 'fade_in'
          },
          {
            image_id: 'test-image-2',
            subtitle_id: 'test-subtitle-2',
            duration: 4,
            animation: 'zoom_in'
          }
        ]
      });

      const result = await executor.execute(action, mockContext);

      expect(result).toMatchObject({
        id: 'test-cutscene',
        cost: 0,
        metadata: {
          totalDuration: 9, // 5 + 4
          shotCount: 2
        }
      });

      expect(result.url).toBeDefined();
      expect(result.metadata.shots).toHaveLength(2);
      
      // Verify shot structure
      expect(result.metadata.shots[0]).toMatchObject({
        imageUrl: expect.stringContaining('test-image-1'),
        audioUrl: expect.stringContaining('test-subtitle-1'),
        duration: 5,
        animation: 'fade_in',
        audioDuration: 4
      });
    });

    it('should return cached result if available', async () => {
      const action = mockActions.cutscene({ id: 'cached-cutscene' });
      
      // Pre-populate cache
      const cachedResult: CutsceneAssetResult = {
        id: 'cached-cutscene',
        url: '/cached/cutscene.json',
        metadata: {
          totalDuration: 10,
          shotCount: 2,
          shots: []
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

    it('should fail if referenced assets do not exist', async () => {
      const action = mockActions.cutscene({
        shots: [{
          image_id: 'nonexistent-image',
          subtitle_id: 'nonexistent-subtitle',
          duration: 5,
          animation: 'fade_in'
        }]
      });

      await expect(executor.execute(action, mockContext)).rejects.toThrow(
        'Missing referenced assets'
      );
    });

    it('should fail if only some referenced assets exist', async () => {
      const action = mockActions.cutscene({
        shots: [{
          image_id: 'test-image-1', // exists
          subtitle_id: 'nonexistent-subtitle', // doesn't exist
          duration: 5,
          animation: 'fade_in'
        }]
      });

      await expect(executor.execute(action, mockContext)).rejects.toThrow(
        'subtitle: nonexistent-subtitle'
      );
    });

    it('should store cutscene definition as JSON', async () => {
      const action = mockActions.cutscene();
      
      const storeJSONSpy = vi.spyOn(mockStorage, 'storeJSON');
      
      await executor.execute(action, mockContext);
      
      expect(storeJSONSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          id: action.id,
          shots: expect.any(Array)
        }),
        expect.objectContaining({
          id: action.id,
          type: 'cutscene'
        })
      );
    });

    it('should validate timing and log warnings', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Create action with audio longer than shot duration
      const action = mockActions.cutscene({
        shots: [{
          image_id: 'test-image-1',
          subtitle_id: 'test-subtitle-1', // has 4 second duration
          duration: 2, // shot only 2 seconds - audio will be cut off
          animation: 'fade_in'
        }]
      });

      await executor.execute(action, mockContext);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Audio duration (4s) exceeds shot duration (2s)')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('timing validation', () => {
    it('should warn about various timing issues', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const definition: CutsceneDefinition = {
        id: 'test',
        shots: [
          {
            imageUrl: '/test.png',
            audioUrl: '/test.mp3',
            duration: 1, // Very short
            animation: 'fade_in',
            audioDuration: 0.5
          },
          {
            imageUrl: '/test2.png',
            audioUrl: '/test2.mp3',
            duration: 25, // Very long
            animation: 'static',
            audioDuration: 5
          },
          {
            imageUrl: '/test3.png',
            audioUrl: '/test3.mp3',
            duration: 5,
            animation: 'zoom_in',
            audioDuration: 8 // Audio longer than shot
          }
        ]
      };

      executor['validateTiming'](definition);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Very short duration (1s)')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Long duration (25s)')
      );
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Audio duration (8s) exceeds shot duration (5s)')
      );
      
      consoleSpy.mockRestore();
    });

    it('should warn about overall pacing issues', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      // Fast pacing - average < 3s per shot
      const fastDefinition: CutsceneDefinition = {
        id: 'fast',
        shots: Array(5).fill(null).map((_, i) => ({
          imageUrl: `/test${i}.png`,
          audioUrl: `/test${i}.mp3`,
          duration: 1, // Very fast pacing
          animation: 'fade_in' as const,
          audioDuration: 1
        }))
      };

      executor['validateTiming'](fastDefinition);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('pacing might be too fast')
      );
      
      consoleSpy.mockClear();

      // Slow pacing - average > 10s per shot
      const slowDefinition: CutsceneDefinition = {
        id: 'slow',
        shots: [{
          imageUrl: '/test.png',
          audioUrl: '/test.mp3',
          duration: 15, // Very slow pacing
          animation: 'static',
          audioDuration: 5
        }]
      };

      executor['validateTiming'](slowDefinition);
      
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('pacing might be too slow')
      );
      
      consoleSpy.mockRestore();
    });
  });

  describe('static utility methods', () => {
    describe('analyzeCutscene', () => {
      it('should analyze cutscene correctly', () => {
        const definition: CutsceneDefinition = {
          id: 'test',
          shots: [
            {
              imageUrl: '/test1.png',
              audioUrl: '/test1.mp3',
              duration: 5,
              animation: 'fade_in',
              audioDuration: 4
            },
            {
              imageUrl: '/test2.png',
              audioUrl: '/test2.mp3',
              duration: 3,
              animation: 'fade_in',
              audioDuration: 2
            },
            {
              imageUrl: '/test3.png',
              audioUrl: '/test3.mp3',
              duration: 25, // Long shot
              animation: 'zoom_in',
              audioDuration: 6 // Audio longer than shot would be if shot was < 6s
            }
          ]
        };

        const analysis = CutsceneAssetExecutor.analyzeCutscene(definition);
        
        expect(analysis.totalDuration).toBe(33); // 5 + 3 + 25
        expect(analysis.shotCount).toBe(3);
        expect(analysis.averageShotDuration).toBe(11); // 33 / 3
        expect(analysis.animationBreakdown).toEqual({
          fade_in: 2,
          zoom_in: 1
        });
        expect(analysis.timingIssues).toContain('Shot 2: Very long duration (25s)');
      });
    });

    describe('optimizeCutscene', () => {
      it('should optimize shot durations', () => {
        const action = mockActions.cutscene({
          shots: [
            {
              image_id: 'test-1',
              subtitle_id: 'sub-1',
              duration: 1, // Too short
              animation: 'static'
            },
            {
              image_id: 'test-2',
              subtitle_id: 'sub-2',
              duration: 20, // Too long
              animation: 'fade_in'
            }
          ]
        });

        const optimized = CutsceneAssetExecutor.optimizeCutscene(action);
        
        expect(optimized.shots[0].duration).toBe(2); // Increased from 1
        expect(optimized.shots[0].animation).toBe('fade_in'); // Changed from static
        expect(optimized.shots[1].duration).toBe(15); // Decreased from 20
        expect(optimized.shots[1].animation).toBe('pan_left'); // Changed from fade_in for long shots
      });
    });

    describe('validateAccessibility', () => {
      it('should validate accessibility features', () => {
        const definition: CutsceneDefinition = {
          id: 'test',
          shots: [
            {
              imageUrl: '/test1.png',
              audioUrl: '/test1.mp3',
              duration: 5,
              animation: 'fade_in',
              audioDuration: 4
            },
            {
              imageUrl: '/test2.png',
              audioUrl: '/test2.mp3',
              duration: 3,
              animation: 'zoom_in',
              audioDuration: 2
            }
          ]
        };

        const accessibility = CutsceneAssetExecutor.validateAccessibility(definition);
        
        expect(accessibility.hasAudio).toBe(true);
        expect(accessibility.hasVisuals).toBe(true);
        expect(accessibility.averageReadingTime).toBe(4); // (5 + 3) / 2
        expect(accessibility.suggestions).toHaveLength(0); // No issues
      });

      it('should suggest improvements for accessibility', () => {
        const definitionNoAudio: CutsceneDefinition = {
          id: 'test',
          shots: [{
            imageUrl: '/test.png',
            audioUrl: '', // No audio
            duration: 2, // Too short for reading
            animation: 'fade_in',
            audioDuration: 0
          }]
        };

        const accessibility = CutsceneAssetExecutor.validateAccessibility(definitionNoAudio);
        
        expect(accessibility.hasAudio).toBe(false);
        expect(accessibility.suggestions).toContain(
          'Consider adding audio narration for visually impaired users'
        );
        expect(accessibility.suggestions).toContain(
          'Shot durations may be too short for comfortable reading'
        );
      });
    });
  });

  describe('error handling', () => {
    it('should throw error for invalid action', async () => {
      const action = mockActions.cutscene({ id: '', shots: [] });

      await expect(executor.execute(action, mockContext)).rejects.toThrow();
    });

    it('should handle storage errors gracefully', async () => {
      const action = mockActions.cutscene();
      
      // Mock storage to fail
      mockStorage.storeJSON = vi.fn().mockRejectedValue(new Error('Storage failure'));

      await expect(executor.execute(action, mockContext)).rejects.toThrow();
    });
  });
});