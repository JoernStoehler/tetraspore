import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ActionProcessor } from './ActionProcessor.js';
import type { ActionProcessorConfig } from './ActionProcessor.js';
import type { AssetExecutor, AssetStorage, AssetMetadata, StoredAsset, Action, AssetResult } from './executors/types.js';
import { MockImageAssetExecutor, MockSubtitleAssetExecutor, MockCutsceneAssetExecutor } from './executors/mocks.js';

// Mock storage implementation
class MockAssetStorage implements AssetStorage {
  private storage = new Map<string, { data: unknown; metadata: unknown }>();

  async store(data: Buffer | Uint8Array, metadata: AssetMetadata): Promise<StoredAsset> {
    const id = metadata.id || Math.random().toString(36);
    this.storage.set(id, { data, metadata });
    return { id, url: `/assets/${id}`, metadata };
  }

  async storeJSON(data: object, metadata: AssetMetadata): Promise<StoredAsset> {
    const id = metadata.id || Math.random().toString(36);
    this.storage.set(id, { data, metadata });
    return { id, url: `/assets/${id}`, metadata };
  }

  async getUrl(id: string) {
    return `/assets/${id}`;
  }

  async exists(id: string) {
    return this.storage.has(id);
  }

  async retrieve(id: string) {
    const item = this.storage.get(id);
    return item?.data;
  }

  async delete(id: string) {
    return this.storage.delete(id);
  }

  async list() {
    return Array.from(this.storage.keys());
  }

  async getMetadata(id: string) {
    const item = this.storage.get(id);
    return item?.metadata;
  }

  async getDuration() {
    return undefined;
  }
}

describe('ActionProcessor', () => {
  let processor: ActionProcessor;
  let mockStorage: MockAssetStorage;
  let config: ActionProcessorConfig;

  beforeEach(() => {
    mockStorage = new MockAssetStorage();
    config = {
      storage: mockStorage,
      executors: {
        asset_image: new MockImageAssetExecutor(),
        asset_subtitle: new MockSubtitleAssetExecutor(),
        asset_cutscene: new MockCutsceneAssetExecutor()
      },
      apiKeys: {
        fluxApiKey: 'test-flux-key',
        openaiApiKey: 'test-openai-key'
      }
    };
    processor = new ActionProcessor(config);
  });

  describe('processActions', () => {
    it('should process valid JSON string correctly', async () => {
      const json = JSON.stringify({
        actions: [
          {
            type: 'asset_image',
            id: 'test_image',
            prompt: 'A test image',
            size: '1024x768',
            model: 'flux-schnell'
          }
        ]
      });

      const result = await processor.processActions(json);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.assetsGenerated).toHaveLength(1);
      expect('type' in result.assetsGenerated[0] && (result.assetsGenerated[0] as AssetResult & { type: string }).type).toBe('image');
      expect(result.actionsExecuted).toContain('test_image');
    });

    it('should process object input correctly', async () => {
      const actions = {
        actions: [
          {
            type: 'asset_subtitle',
            id: 'test_subtitle',
            text: 'Test narration',
            voice_tone: 'calm',
            voice_gender: 'neutral',
            voice_pace: 'normal',
            model: 'openai-tts'
          }
        ]
      };

      const result = await processor.processActions(actions);

      expect(result.success).toBe(true);
      expect(result.assetsGenerated).toHaveLength(1);
      expect('type' in result.assetsGenerated[0] && (result.assetsGenerated[0] as AssetResult & { type: string }).type).toBe('audio');
    });

    it('should handle parser errors gracefully', async () => {
      const invalidJson = '{ invalid json }';
      
      const result = await processor.processActions(invalidJson);

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.assetsGenerated).toHaveLength(0);
    });

    it('should handle executor failures gracefully', async () => {
      // Create a failing executor
      const failingExecutor: AssetExecutor<Action, AssetResult> = {
        execute: vi.fn().mockRejectedValue(new Error('Executor failed')),
        validate: vi.fn().mockReturnValue({ valid: true }),
        estimateCost: vi.fn().mockResolvedValue({ estimated: 0.01, confidence: 1 })
      };

      const failConfig = {
        ...config,
        executors: {
          asset_image: failingExecutor
        }
      };

      const failProcessor = new ActionProcessor(failConfig);
      
      const result = await failProcessor.processActions({
        actions: [
          {
            type: 'asset_image',
            id: 'fail_image',
            prompt: 'This will fail',
            size: '1024x768',
            model: 'flux-schnell'
          }
        ]
      });

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Executor failed');
    });

    it('should execute actions in dependency order', async () => {
      const executedOrder: string[] = [];
      
      // Create executors that track execution order
      const trackingImageExecutor: AssetExecutor<Action, AssetResult> = {
        execute: vi.fn().mockImplementation(async (action) => {
          executedOrder.push(action.id);
          return { id: action.id, type: 'image', url: '/test.jpg', cost: 0.01 };
        }),
        validate: vi.fn().mockReturnValue({ valid: true }),
        estimateCost: vi.fn().mockResolvedValue({ estimated: 0.01, confidence: 1 })
      };

      const trackingSubtitleExecutor: AssetExecutor<Action, AssetResult> = {
        execute: vi.fn().mockImplementation(async (action) => {
          executedOrder.push(action.id);
          return { id: action.id, type: 'audio', url: '/test.mp3', duration: 3, cost: 0.006 };
        }),
        validate: vi.fn().mockReturnValue({ valid: true }),
        estimateCost: vi.fn().mockResolvedValue({ estimated: 0.006, confidence: 1 })
      };

      const trackingCutsceneExecutor: AssetExecutor<Action, AssetResult> = {
        execute: vi.fn().mockImplementation(async (action) => {
          executedOrder.push(action.id);
          return { id: action.id, type: 'cutscene', url: '/test.json', metadata: { shots: [] }, cost: 0 };
        }),
        validate: vi.fn().mockReturnValue({ valid: true }),
        estimateCost: vi.fn().mockResolvedValue({ estimated: 0, confidence: 1 })
      };

      const orderConfig = {
        ...config,
        executors: {
          asset_image: trackingImageExecutor,
          asset_subtitle: trackingSubtitleExecutor,
          asset_cutscene: trackingCutsceneExecutor
        }
      };

      const orderProcessor = new ActionProcessor(orderConfig);

      await orderProcessor.processActions({
        actions: [
          {
            type: 'asset_cutscene',
            id: 'cutscene_1',
            shots: [{
              image_id: 'image_1',
              subtitle_id: 'subtitle_1',
              duration: 5.0,
              animation: 'fade'
            }]
          },
          {
            type: 'asset_image',
            id: 'image_1',
            prompt: 'Test image',
            size: '1024x768',
            model: 'flux-schnell'
          },
          {
            type: 'asset_subtitle',
            id: 'subtitle_1',
            text: 'Test subtitle',
            voice_tone: 'calm',
            voice_gender: 'neutral',
            voice_pace: 'normal',
            model: 'openai-tts'
          }
        ]
      });

      // Image and subtitle should be executed before cutscene due to dependency
      expect(executedOrder).toEqual(['image_1', 'subtitle_1', 'cutscene_1']);
    });

    it('should track costs correctly', async () => {
      const result = await processor.processActions({
        actions: [
          {
            type: 'asset_image',
            id: 'image1',
            prompt: 'Test 1',
            size: '1024x768',
            model: 'flux-schnell'
          },
          {
            type: 'asset_subtitle',
            id: 'audio1',
            text: 'Test audio',
            voice_tone: 'calm',
            voice_gender: 'neutral',
            voice_pace: 'normal',
            model: 'openai-tts'
          }
        ]
      });

      expect(result.totalCost).toBeGreaterThan(0);
      
      const breakdown = processor.getCostBreakdown();
      expect(breakdown.images.cost).toBeGreaterThan(0);
      expect(breakdown.audio.cost).toBeGreaterThan(0);
      expect(breakdown.total).toBe(breakdown.images.cost + breakdown.audio.cost);
    });

    it('should update status during processing', async () => {
      // Check initial status
      let status = processor.getStatus();
      expect(status.isProcessing).toBe(false);
      expect(status.progress).toBe(0);

      // Start processing
      const promise = processor.processActions({
        actions: [
          {
            type: 'asset_image',
            id: 'status_test',
            prompt: 'Status test',
            size: '1024x768',
            model: 'flux-schnell'
          }
        ]
      });

      // Check status during processing (this might be flaky in tests)
      // In real usage, status would be polled from UI
      
      await promise;

      // Check final status
      status = processor.getStatus();
      expect(status.isProcessing).toBe(false);
      expect(status.progress).toBe(100);
    });

    it('should handle game actions appropriately', async () => {
      const result = await processor.processActions({
        actions: [
          // Create cutscenes first so references are valid
          {
            type: 'asset_cutscene',
            id: 'cutscene_1',
            shots: [{
              image_id: 'img1',
              subtitle_id: 'sub1',
              duration: 3.0,
              animation: 'fade'
            }]
          },
          {
            type: 'asset_cutscene',
            id: 'intro_cutscene',
            shots: [{
              image_id: 'img1',
              subtitle_id: 'sub1',
              duration: 3.0,
              animation: 'fade'
            }]
          },
          // Create referenced assets
          {
            type: 'asset_image',
            id: 'img1',
            prompt: 'Test image',
            size: '1024x768',
            model: 'flux-schnell'
          },
          {
            type: 'asset_subtitle',
            id: 'sub1',
            text: 'Test subtitle',
            voice_tone: 'calm',
            voice_gender: 'neutral',
            voice_pace: 'normal',
            model: 'openai-tts'
          },
          // Now test game actions
          {
            type: 'play_cutscene',
            cutscene_id: 'cutscene_1'
          },
          {
            type: 'when_then',
            condition: 'game.planet_created',
            action: {
              type: 'play_cutscene',
              cutscene_id: 'intro_cutscene'
            }
          },
          {
            type: 'reason',
            ephemeral_reasoning: 'This is for planning'
          }
        ]
      });

      expect(result.success).toBe(true);
      expect(result.actionsExecuted).toContain('play_cutscene_4');
      expect(result.actionsExecuted).toContain('when_then_5');
      // Should also execute the asset actions
      expect(result.assetsGenerated).toHaveLength(4); // 2 cutscenes, 1 image, 1 subtitle
    });

    it('should continue processing after individual action failures', async () => {
      // Create an executor that fails on specific IDs
      const conditionalFailExecutor: AssetExecutor<Action, AssetResult> = {
        execute: vi.fn().mockImplementation(async (action) => {
          if (action.id === 'fail_this') {
            throw new Error('Intentional failure');
          }
          return { id: action.id, type: 'image', url: '/test.jpg', cost: 0.01 };
        }),
        validate: vi.fn().mockReturnValue({ valid: true }),
        estimateCost: vi.fn().mockResolvedValue({ estimated: 0.01, confidence: 1 })
      };

      const partialFailConfig = {
        ...config,
        executors: {
          asset_image: conditionalFailExecutor
        }
      };

      const partialFailProcessor = new ActionProcessor(partialFailConfig);

      const result = await partialFailProcessor.processActions({
        actions: [
          {
            type: 'asset_image',
            id: 'success_1',
            prompt: 'This succeeds',
            size: '1024x768',
            model: 'flux-schnell'
          },
          {
            type: 'asset_image',
            id: 'fail_this',
            prompt: 'This fails',
            size: '1024x768',
            model: 'flux-schnell'
          },
          {
            type: 'asset_image',
            id: 'success_2',
            prompt: 'This also succeeds',
            size: '1024x768',
            model: 'flux-schnell'
          }
        ]
      });

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.actionsExecuted).toHaveLength(2);
      expect(result.actionsExecuted).toContain('success_1');
      expect(result.actionsExecuted).toContain('success_2');
      expect(result.assetsGenerated).toHaveLength(2);
    });

    it('should calculate execution time', async () => {
      const result = await processor.processActions({
        actions: [
          {
            type: 'asset_image',
            id: 'timing_test',
            prompt: 'Test image for timing',
            size: '1024x768',
            model: 'flux-schnell'
          }
        ]
      });

      expect(result.executionTime).toBeGreaterThan(0);
      expect(result.executionTime).toBeLessThan(5000); // Should be fast
    });
  });

  describe('getCostBreakdown', () => {
    it('should provide accurate cost breakdown', async () => {
      await processor.processActions({
        actions: [
          {
            type: 'asset_image',
            id: 'img1',
            prompt: 'Image 1',
            size: '1024x768',
            model: 'flux-schnell'
          },
          {
            type: 'asset_image',
            id: 'img2',
            prompt: 'Image 2',
            size: '1024x768',
            model: 'flux-schnell'
          },
          {
            type: 'asset_subtitle',
            id: 'audio1',
            text: 'Audio 1',
            voice_tone: 'calm',
            voice_gender: 'neutral',
            voice_pace: 'normal',
            model: 'openai-tts'
          }
        ]
      });

      const breakdown = processor.getCostBreakdown();
      
      expect(breakdown.images.count).toBeGreaterThan(0);
      expect(breakdown.images.cost).toBeGreaterThan(0);
      expect(breakdown.audio.count).toBeGreaterThan(0);
      expect(breakdown.audio.cost).toBeGreaterThan(0);
      expect(breakdown.total).toBeCloseTo(
        breakdown.images.cost + breakdown.audio.cost,
        5
      );
    });
  });
});