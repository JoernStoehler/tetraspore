import { describe, it, expect, beforeEach } from 'vitest';
import { ActionProcessor } from '../../src/services/actions/ActionProcessor.js';
import { LocalAssetStorage } from '../../src/services/actions/storage/LocalAssetStorage.js';
import { MockImageAssetExecutor, MockSubtitleAssetExecutor, MockCutsceneAssetExecutor } from '../../src/services/actions/executors/mocks.js';
import planetCreationExample from '../../src/services/actions/examples/planet-creation.json';
import evolutionChoiceExample from '../../src/services/actions/examples/evolution-choice.json';
import catastropheExample from '../../src/services/actions/examples/catastrophe.json';

describe('Action System Integration Tests', () => {
  let processor: ActionProcessor;

  beforeEach(() => {
    // Use mock executors for integration tests
    processor = new ActionProcessor({
      executors: {
        asset_image: new MockImageAssetExecutor(),
        asset_subtitle: new MockSubtitleAssetExecutor(),
        asset_cutscene: new MockCutsceneAssetExecutor()
      },
      storage: new LocalAssetStorage(),
      apiKeys: {
        fluxApiKey: 'test-key',
        openaiApiKey: 'test-key'
      }
    });
  });

  describe('Complete planet creation flow', () => {
    it('should process planet creation scenario successfully', async () => {
      const result = await processor.processActions(planetCreationExample);

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      
      // Should generate 2 images, 2 subtitles, and 1 cutscene
      const imageAssets = result.assetsGenerated.filter(a => a.type === 'image');
      const audioAssets = result.assetsGenerated.filter(a => a.type === 'audio');
      const cutsceneAssets = result.assetsGenerated.filter(a => a.type === 'cutscene');
      
      expect(imageAssets).toHaveLength(2);
      expect(audioAssets).toHaveLength(2);
      expect(cutsceneAssets).toHaveLength(1);

      // Check specific asset IDs
      expect(imageAssets.map(a => a.id)).toContain('planet_space');
      expect(imageAssets.map(a => a.id)).toContain('planet_surface');
      expect(audioAssets.map(a => a.id)).toContain('intro_narration');
      expect(audioAssets.map(a => a.id)).toContain('surface_narration');
      expect(cutsceneAssets[0].id).toBe('planet_intro');

      // Should execute all actions including conditionals
      expect(result.actionsExecuted).toContain('planning');
      expect(result.actionsExecuted).toContain('play_on_creation');
    });

    it('should track costs accurately', async () => {
      const result = await processor.processActions(planetCreationExample);
      
      expect(result.totalCost).toBeGreaterThan(0);
      expect(result.totalCost).toBeLessThan(0.10); // Under budget
      
      const breakdown = processor.getCostBreakdown();
      expect(breakdown.images.count).toBe(2);
      expect(breakdown.audio.count).toBe(2);
      expect(breakdown.total).toBe(result.totalCost);
    });

    it('should complete within performance targets', async () => {
      const startTime = Date.now();
      const result = await processor.processActions(planetCreationExample);
      const endTime = Date.now();
      
      const totalTime = endTime - startTime;
      expect(totalTime).toBeLessThan(10000); // Under 10 seconds
      expect(result.executionTime).toBeLessThan(10000);
    });
  });

  describe('Player choice with reactions', () => {
    it('should process evolution choice scenario correctly', async () => {
      const result = await processor.processActions(evolutionChoiceExample);

      expect(result.success).toBe(true);
      
      // Should generate 3 images, 3 subtitles, and 3 cutscenes
      const imageAssets = result.assetsGenerated.filter(a => a.type === 'image');
      const audioAssets = result.assetsGenerated.filter(a => a.type === 'audio');
      const cutsceneAssets = result.assetsGenerated.filter(a => a.type === 'cutscene');
      
      expect(imageAssets).toHaveLength(3);
      expect(audioAssets).toHaveLength(3);
      expect(cutsceneAssets).toHaveLength(3);

      // Verify player choice action was processed
      expect(result.actionsExecuted).toContain('evolution_decision');
    });

    it('should create cutscenes for each choice path', async () => {
      const result = await processor.processActions(evolutionChoiceExample);
      
      const cutsceneAssets = result.assetsGenerated.filter(a => a.type === 'cutscene');
      const cutsceneIds = cutsceneAssets.map(a => a.id);
      
      expect(cutsceneIds).toContain('evolution_choice_intro');
      expect(cutsceneIds).toContain('predator_path_preview');
      expect(cutsceneIds).toContain('symbiont_path_preview');
    });
  });

  describe('Conditional actions', () => {
    it('should process catastrophe scenario with conditionals', async () => {
      const result = await processor.processActions(catastropheExample);

      expect(result.success).toBe(true);
      
      // Should generate all assets regardless of conditions
      const imageAssets = result.assetsGenerated.filter(a => a.type === 'image');
      const audioAssets = result.assetsGenerated.filter(a => a.type === 'audio');
      const cutsceneAssets = result.assetsGenerated.filter(a => a.type === 'cutscene');
      
      expect(imageAssets).toHaveLength(4);
      expect(audioAssets).toHaveLength(4);
      expect(cutsceneAssets).toHaveLength(4);

      // All conditional actions should be registered
      const conditionalActions = result.actionsExecuted.filter(id => 
        id.includes('trigger') || id.includes('outcome') || id.includes('show')
      );
      expect(conditionalActions).toHaveLength(4);
    });

    it('should create all outcome cutscenes', async () => {
      const result = await processor.processActions(catastropheExample);
      
      const cutsceneAssets = result.assetsGenerated.filter(a => a.type === 'cutscene');
      const cutsceneIds = cutsceneAssets.map(a => a.id);
      
      expect(cutsceneIds).toContain('asteroid_warning');
      expect(cutsceneIds).toContain('impact_scene');
      expect(cutsceneIds).toContain('survival_ending');
      expect(cutsceneIds).toContain('extinction_ending');
    });
  });

  describe('Error handling', () => {
    it('should handle parser errors gracefully', async () => {
      const invalidActions = {
        actions: [
          {
            type: 'invalid_action_type',
            id: 'bad_action'
          }
        ]
      };

      const result = await processor.processActions(invalidActions);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.assetsGenerated).toHaveLength(0);
    });

    it('should handle circular dependencies', async () => {
      const circularActions = {
        actions: [
          {
            type: 'asset_cutscene',
            id: 'cutscene_a',
            shots: [{
              image_id: 'image_b',
              duration: 5.0
            }]
          },
          {
            type: 'asset_image',
            id: 'image_b',
            prompt: 'Test image',
            size: '1024x768',
            model: 'flux-schnell',
            depends_on: ['cutscene_a'] // This creates a circular dependency
          }
        ]
      };

      const result = await processor.processActions(circularActions);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Circular dependency');
    });

    it('should continue processing after individual action failures', async () => {
      // Create a processor with one executor that fails
      const failingImageExecutor = new MockImageAssetExecutor();
      failingImageExecutor.execute = async () => {
        throw new Error('Image generation failed');
      };

      const partialFailProcessor = new ActionProcessor({
        executors: {
          asset_image: failingImageExecutor,
          asset_subtitle: new MockSubtitleAssetExecutor(),
          asset_cutscene: new MockCutsceneAssetExecutor()
        }
      });

      const mixedActions = {
        actions: [
          {
            type: 'asset_image',
            id: 'fail_image',
            prompt: 'This will fail',
            size: '1024x768',
            model: 'flux-schnell'
          },
          {
            type: 'asset_subtitle',
            id: 'success_audio',
            text: 'This will succeed',
            voice_tone: 'calm',
            voice_gender: 'neutral',
            voice_pace: 'normal',
            model: 'openai-tts'
          }
        ]
      };

      const result = await partialFailProcessor.processActions(mixedActions);
      
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.assetsGenerated).toHaveLength(1);
      expect(result.assetsGenerated[0].type).toBe('audio');
    });
  });

  describe('Asset generation to cutscene playback', () => {
    it('should generate assets that can be used by cutscene player', async () => {
      const simpleScenario = {
        actions: [
          {
            type: 'asset_image',
            id: 'test_img',
            prompt: 'Test image',
            size: '1024x768',
            model: 'flux-schnell'
          },
          {
            type: 'asset_subtitle',
            id: 'test_audio',
            text: 'Test narration',
            voice_tone: 'calm',
            voice_gender: 'neutral',
            voice_pace: 'normal',
            model: 'openai-tts'
          },
          {
            type: 'asset_cutscene',
            id: 'test_cutscene',
            shots: [{
              image_id: 'test_img',
              subtitle_id: 'test_audio',
              duration: 5.0,
              animation: 'fade_in'
            }]
          }
        ]
      };

      const result = await processor.processActions(simpleScenario);
      
      expect(result.success).toBe(true);
      
      const cutsceneAsset = result.assetsGenerated.find(a => a.id === 'test_cutscene');
      expect(cutsceneAsset).toBeDefined();
      expect(cutsceneAsset?.type).toBe('cutscene');
      
      // The cutscene should have valid references to generated assets
      if (cutsceneAsset && 'definition' in cutsceneAsset) {
        const definition = cutsceneAsset.definition;
        expect(definition.id).toBe('test_cutscene');
        expect(definition.shots).toHaveLength(1);
        expect(definition.shots[0].imageUrl).toBeDefined();
        expect(definition.shots[0].audioUrl).toBeDefined();
      }
    });
  });

  describe('Performance and cost constraints', () => {
    it('should stay under cost budget for typical cutscene', async () => {
      // Process all examples
      const results = await Promise.all([
        processor.processActions(planetCreationExample),
        processor.processActions(evolutionChoiceExample),
        processor.processActions(catastropheExample)
      ]);

      for (const result of results) {
        expect(result.totalCost).toBeLessThan(0.10); // Under $0.10 per cutscene
      }
    });

    it('should process actions in parallel where possible', async () => {
      const parallelActions = {
        actions: [
          // These should execute in parallel
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
          },
          // This depends on img1 and img2, so executes after
          {
            type: 'asset_cutscene',
            id: 'cutscene1',
            shots: [
              { image_id: 'img1', duration: 3.0 },
              { image_id: 'img2', duration: 3.0 }
            ]
          }
        ]
      };

      const startTime = Date.now();
      const result = await processor.processActions(parallelActions);
      const endTime = Date.now();
      
      expect(result.success).toBe(true);
      // With parallelization, this should be faster than sequential
      expect(endTime - startTime).toBeLessThan(5000);
    });
  });

  describe('Empty and edge cases', () => {
    it('should handle empty action array', async () => {
      const result = await processor.processActions({ actions: [] });
      
      expect(result.success).toBe(true);
      expect(result.assetsGenerated).toHaveLength(0);
      expect(result.actionsExecuted).toHaveLength(0);
      expect(result.totalCost).toBe(0);
    });

    it('should handle actions with no dependencies', async () => {
      const independentActions = {
        actions: [
          {
            type: 'reason',
            id: 'reason1',
            ephemeral_reasoning: 'First reasoning'
          },
          {
            type: 'reason',
            id: 'reason2',
            ephemeral_reasoning: 'Second reasoning'
          }
        ]
      };

      const result = await processor.processActions(independentActions);
      
      expect(result.success).toBe(true);
      expect(result.actionsExecuted).toHaveLength(2);
    });
  });
});