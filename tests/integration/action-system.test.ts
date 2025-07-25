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

      // Log errors if test fails
      if (!result.success) {
        console.log('Errors:', result.errors.map(e => e.message));
      }
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
      expect(breakdown.audio.count).toBe(3); // 2 subtitles + 1 cutscene
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

      if (!result.success) {
        console.log('Evolution choice errors:', result.errors.map(e => e.message));
      }

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

      if (!result.success) {
        console.log('Catastrophe errors:', result.errors.map(e => e.message));
      }

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
      // Create a simple circular dependency: A depends on B, B depends on A
      const circularActions = {
        actions: [
          {
            type: 'asset_cutscene',
            id: 'cutscene_a',
            shots: [{
              image_id: 'cutscene_b', // References B
              subtitle_id: 'subtitle_a',
              duration: 5.0,
              animation: 'fade'
            }]
          },
          {
            type: 'asset_cutscene',
            id: 'cutscene_b',
            shots: [{
              image_id: 'cutscene_a', // References A - creates circular dependency
              subtitle_id: 'subtitle_b',
              duration: 5.0,
              animation: 'fade'
            }]
          },
          {
            type: 'asset_subtitle',
            id: 'subtitle_a',
            text: 'Test narration A',
            voice_tone: 'calm',
            voice_gender: 'neutral',
            voice_pace: 'normal',
            model: 'openai-tts'
          },
          {
            type: 'asset_subtitle',
            id: 'subtitle_b',
            text: 'Test narration B',
            voice_tone: 'calm',
            voice_gender: 'neutral',
            voice_pace: 'normal',
            model: 'openai-tts'
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
              animation: 'fade'
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
      // Process examples one by one (not in parallel to avoid conflicts)
      const planetResult = await processor.processActions(planetCreationExample);
      expect(planetResult.totalCost).toBeLessThan(0.10);
      
      const evolutionResult = await processor.processActions(evolutionChoiceExample);
      expect(evolutionResult.totalCost).toBeLessThan(0.10);
      
      const catastropheResult = await processor.processActions(catastropheExample);
      expect(catastropheResult.totalCost).toBeLessThan(0.10);
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
              { image_id: 'img1', subtitle_id: 'audio1', duration: 3.0, animation: 'fade' },
              { image_id: 'img2', subtitle_id: 'audio1', duration: 3.0, animation: 'fade' }
            ]
          }
        ]
      };

      const startTime = Date.now();
      const result = await processor.processActions(parallelActions);
      const endTime = Date.now();
      
      if (!result.success) {
        console.log('Parallel processing errors:', result.errors.map(e => e.message));
      }
      
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

  describe('Cost limit testing', () => {
    it('should track cumulative costs across multiple assets', async () => {
      const highCostScenario = {
        actions: [
          // Multiple SDXL images (more expensive)
          {
            type: 'asset_image',
            id: 'expensive1',
            prompt: 'High quality image 1',
            size: '1024x768',
            model: 'sdxl'
          },
          {
            type: 'asset_image',
            id: 'expensive2',
            prompt: 'High quality image 2',
            size: '1024x768',
            model: 'sdxl'
          },
          // Multiple TTS generations
          {
            type: 'asset_subtitle',
            id: 'long_audio1',
            text: 'This is a very long narration that will cost more to generate. '.repeat(10),
            voice_tone: 'epic',
            voice_gender: 'neutral',
            voice_pace: 'normal',
            model: 'openai-tts'
          }
        ]
      };

      const result = await processor.processActions(highCostScenario);
      
      expect(result.success).toBe(true);
      expect(result.totalCost).toBeGreaterThan(0.018); // 2 SDXL images at 0.009 each
      
      const breakdown = processor.getCostBreakdown();
      expect(breakdown.images.count).toBe(2);
      expect(breakdown.images.cost).toBeCloseTo(0.018, 3);
    });

    it('should reset cost tracking between processActions calls', async () => {
      const actions1 = {
        actions: [{
          type: 'asset_image',
          id: 'img1',
          prompt: 'First batch',
          size: '1024x768',
          model: 'sdxl'
        }]
      };

      const actions2 = {
        actions: [{
          type: 'asset_image',
          id: 'img2',
          prompt: 'Second batch',
          size: '1024x768',
          model: 'sdxl'
        }]
      };

      // First processing
      const result1 = await processor.processActions(actions1);
      expect(result1.totalCost).toBeCloseTo(0.009, 3);

      // Second processing should reset costs
      const result2 = await processor.processActions(actions2);
      expect(result2.totalCost).toBeCloseTo(0.009, 3); // Not 0.018

      // Current breakdown should only show second batch
      const breakdown = processor.getCostBreakdown();
      expect(breakdown.images.count).toBe(1);
      expect(breakdown.total).toBeCloseTo(0.009, 3);
    });
  });

  describe('Advanced error scenarios', () => {
    it('should handle executor initialization failures gracefully', async () => {
      // Create processor with null executor
      const brokenProcessor = new ActionProcessor({
        executors: {
          asset_image: null as any // Force a broken executor
        }
      });

      const actions = {
        actions: [{
          type: 'asset_image',
          id: 'will_fail',
          prompt: 'This should fail',
          size: '1024x768',
          model: 'flux-schnell'
        }]
      };

      const result = await brokenProcessor.processActions(actions);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      // The actual error will be about missing API keys since the default executor is used
      expect(result.errors[0].message).toBeDefined();
    });

    it('should handle mixed success/failure scenarios', async () => {
      // Create processor where only images fail
      const selectiveFailProcessor = new ActionProcessor({
        executors: {
          asset_image: {
            execute: async () => { throw new Error('Image API down'); },
            validate: () => ({ valid: true, errors: [] }),
            estimateCost: () => ({ min: 0, max: 0, currency: 'USD' })
          },
          asset_subtitle: new MockSubtitleAssetExecutor(),
          asset_cutscene: new MockCutsceneAssetExecutor()
        }
      });

      const mixedActions = {
        actions: [
          {
            type: 'asset_image',
            id: 'fail_img',
            prompt: 'Will fail',
            size: '1024x768',
            model: 'flux-schnell'
          },
          {
            type: 'asset_subtitle',
            id: 'success_audio',
            text: 'This should work',
            voice_tone: 'calm',
            voice_gender: 'neutral',
            voice_pace: 'normal',
            model: 'openai-tts'
          }
        ]
      };

      const result = await selectiveFailProcessor.processActions(mixedActions);
      
      expect(result.success).toBe(false); // Overall failure
      expect(result.errors).toHaveLength(1); // One error
      expect(result.assetsGenerated).toHaveLength(1); // But one success
      expect(result.assetsGenerated[0].type).toBe('audio');
      expect(result.actionsExecuted).toContain('success_audio'); // At least the successful one
    });

    it('should handle malformed JSON gracefully', async () => {
      const malformedJSON = '{"actions": [{"type": "invalid", bad json}]}';
      
      const result = await processor.processActions(malformedJSON);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.assetsGenerated).toHaveLength(0);
    });
  });

  describe('Real-world scenarios', () => {
    it('should handle complex game state conditions', async () => {
      const complexScenario = {
        actions: [
          {
            type: 'reason',
            id: 'analyze_state',
            ephemeral_reasoning: 'Checking multiple game conditions'
          },
          // Add the victory scene that's referenced
          {
            type: 'asset_image',
            id: 'victory_img',
            prompt: 'Victory celebration scene',
            size: '1024x768',
            model: 'flux-schnell'
          },
          {
            type: 'asset_subtitle',
            id: 'victory_audio',
            text: 'You have won!',
            voice_tone: 'triumphant',
            voice_gender: 'neutral',
            voice_pace: 'normal',
            model: 'openai-tts'
          },
          {
            type: 'asset_cutscene',
            id: 'victory_scene',
            shots: [{
              image_id: 'victory_img',
              subtitle_id: 'victory_audio',
              duration: 3.0,
              animation: 'fade'
            }]
          },
          {
            type: 'when_then',
            id: 'complex_condition',
            condition: 'game.player.has_key',
            action: {
              type: 'play_cutscene',
              cutscene_id: 'victory_scene'
            }
          },
          {
            type: 'add_player_choice',
            id: 'critical_choice',
            prompt: 'Which path will you take?',
            options: [
              { 
                label: 'Go left',
                description: 'Take the left path into the darkness',
                reactions: []
              },
              { 
                label: 'Go right',
                description: 'Take the right path towards the light',
                reactions: []
              }
            ]
          }
        ]
      };

      const result = await processor.processActions(complexScenario);
      
      // Log errors if any
      if (!result.success) {
        console.log('Complex scenario errors:', result.errors);
      }
      
      expect(result.success).toBe(true);
      expect(result.actionsExecuted).toContain('analyze_state');
      expect(result.actionsExecuted).toContain('complex_condition');
      expect(result.actionsExecuted).toContain('critical_choice');
      expect(result.actionsExecuted).toContain('victory_scene'); // The cutscene asset
    });
    
    it('should process a complete game chapter with all action types', async () => {
      const chapterActions = {
        actions: [
          // Opening reasoning
          {
            type: 'reason',
            id: 'chapter_start',
            ephemeral_reasoning: 'Player enters the crystal caves'
          },
          // Generate chapter assets
          {
            type: 'asset_image',
            id: 'cave_entrance',
            prompt: 'Crystal cave entrance, bioluminescent, alien architecture',
            size: '1024x768',
            model: 'flux-schnell'
          },
          {
            type: 'asset_subtitle',
            id: 'cave_narration',
            text: 'The crystal caves beckon with an otherworldly glow.',
            voice_tone: 'mysterious',
            voice_gender: 'neutral',
            voice_pace: 'slow',
            model: 'openai-tts'
          },
          {
            type: 'asset_cutscene',
            id: 'cave_intro',
            shots: [{
              image_id: 'cave_entrance',
              subtitle_id: 'cave_narration',
              duration: 5.0,
              animation: 'slow_zoom'
            }]
          },
          // Game actions
          {
            type: 'play_cutscene',
            id: 'show_cave_intro',
            cutscene_id: 'cave_intro'
          },
          {
            type: 'add_player_choice',
            id: 'cave_choice',
            prompt: 'Do you dare to explore the mysterious crystal caves?',
            options: [
              { 
                label: 'Enter the cave',
                description: 'Step into the glowing crystal caverns',
                reactions: []
              },
              { 
                label: 'Turn back',
                description: 'Return to the safety of the surface',
                reactions: []
              }
            ]
          },
          // Conditional outcomes
          {
            type: 'when_then',
            id: 'player_enters',
            condition: 'game.player_entered_cave',
            action: {
              type: 'play_cutscene',
              cutscene_id: 'cave_intro'
            }
          }
        ]
      };

      const result = await processor.processActions(chapterActions);
      
      // Log errors if any
      if (!result.success) {
        console.log('Chapter scenario errors:', result.errors);
      }
      
      expect(result.success).toBe(true);
      expect(result.assetsGenerated).toHaveLength(3); // image, audio, cutscene
      expect(result.actionsExecuted).toHaveLength(7); // All actions
      expect(result.totalCost).toBeGreaterThan(0);
      expect(result.totalCost).toBeLessThan(0.05); // Reasonable cost
      
      // Verify asset types
      const assetTypes = result.assetsGenerated.map(a => a.type);
      expect(assetTypes).toContain('image');
      expect(assetTypes).toContain('audio');
      expect(assetTypes).toContain('cutscene');
    });
  });
});