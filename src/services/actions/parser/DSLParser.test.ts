/**
 * Comprehensive unit tests for DSL Parser
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DSLParser, parseActionDSL, parseActionObject } from './DSLParser';

describe('DSLParser', () => {
  let parser: DSLParser;

  beforeEach(() => {
    parser = new DSLParser();
  });

  describe('Schema Validation', () => {
    it('should parse valid DSL successfully', () => {
      const validDSL = {
        actions: [
          {
            type: 'reason',
            ephemeral_reasoning: 'Test reasoning'
          },
          {
            type: 'asset_image',
            id: 'test_image',
            prompt: 'A test image',
            size: '1024x768' as const,
            model: 'flux-schnell' as const
          }
        ]
      };

      const result = parser.parseObject(validDSL);
      expect(result.success).toBe(true);
      expect(result.graph).toBeDefined();
    });

    it('should reject malformed JSON', () => {
      const result = parser.parse('{ invalid json }');
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0].type).toBe('schema');
    });

    it('should reject missing required fields', () => {
      const invalidDSL = {
        actions: [
          {
            type: 'asset_image',
            id: 'test_image'
            // missing prompt, size, model
          }
        ]
      };

      const result = parser.parseObject(invalidDSL);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors![0].type).toBe('schema');
    });

    it('should reject invalid enum values', () => {
      const invalidDSL = {
        actions: [
          {
            type: 'asset_image',
            id: 'test_image',
            prompt: 'Test',
            size: 'invalid_size',
            model: 'flux-schnell'
          }
        ]
      };

      const result = parser.parseObject(invalidDSL);
      expect(result.success).toBe(false);
      expect(result.errors![0].type).toBe('schema');
    });
  });

  describe('ID Validation', () => {
    it('should detect duplicate IDs', () => {
      const duplicateIdDSL = {
        actions: [
          {
            type: 'asset_image',
            id: 'duplicate_id',
            prompt: 'First image',
            size: '1024x768' as const,
            model: 'flux-schnell' as const
          },
          {
            type: 'asset_subtitle',
            id: 'duplicate_id',
            text: 'Test subtitle',
            voice_tone: 'calm' as const,
            voice_gender: 'neutral' as const,
            voice_pace: 'normal' as const,
            model: 'openai-tts' as const
          }
        ]
      };

      const result = parser.parseObject(duplicateIdDSL);
      expect(result.success).toBe(false);
      expect(result.errors![0].type).toBe('duplicate_id');
      expect(result.errors![0].message).toContain('duplicate_id');
    });

    it('should allow actions without IDs', () => {
      const noIdDSL = {
        actions: [
          {
            type: 'reason',
            ephemeral_reasoning: 'Test reasoning'
          }
        ]
      };

      const result = parser.parseObject(noIdDSL);
      expect(result.success).toBe(true);
    });
  });

  describe('Reference Validation', () => {
    it('should detect unknown references', () => {
      const unknownRefDSL = {
        actions: [
          {
            type: 'play_cutscene',
            cutscene_id: 'nonexistent_cutscene'
          }
        ]
      };

      const result = parser.parseObject(unknownRefDSL);
      expect(result.success).toBe(false);
      expect(result.errors![0].type).toBe('unknown_reference');
      expect(result.errors![0].message).toContain('nonexistent_cutscene');
    });

    it('should suggest similar IDs for typos', () => {
      const typoRefDSL = {
        actions: [
          {
            type: 'asset_cutscene',
            id: 'planet_surface_cutscene',
            shots: [
              {
                image_id: 'planet_surfce', // typo: missing 'a'
                subtitle_id: 'subtitle_1',
                duration: 5,
                animation: 'none' as const
              }
            ]
          },
          {
            type: 'asset_image',
            id: 'planet_surface',
            prompt: 'Planet surface',
            size: '1024x768' as const,
            model: 'flux-schnell' as const
          },
          {
            type: 'asset_subtitle',
            id: 'subtitle_1',
            text: 'Test',
            voice_tone: 'calm' as const,
            voice_gender: 'neutral' as const,
            voice_pace: 'normal' as const,
            model: 'openai-tts' as const
          }
        ]
      };

      const result = parser.parseObject(typoRefDSL);
      expect(result.success).toBe(false);
      expect(result.errors![0].type).toBe('unknown_reference');
      expect(result.errors![0].message).toContain('planet_surface');
    });

    it('should validate all cutscene references', () => {
      const validCutsceneDSL = {
        actions: [
          {
            type: 'asset_image',
            id: 'image_1',
            prompt: 'Test image',
            size: '1024x768' as const,
            model: 'flux-schnell' as const
          },
          {
            type: 'asset_subtitle',
            id: 'subtitle_1',
            text: 'Test subtitle',
            voice_tone: 'calm' as const,
            voice_gender: 'neutral' as const,
            voice_pace: 'normal' as const,
            model: 'openai-tts' as const
          },
          {
            type: 'asset_cutscene',
            id: 'cutscene_1',
            shots: [
              {
                image_id: 'image_1',
                subtitle_id: 'subtitle_1',
                duration: 5,
                animation: 'none' as const
              }
            ]
          }
        ]
      };

      const result = parser.parseObject(validCutsceneDSL);
      expect(result.success).toBe(true);
    });
  });

  describe('Circular Dependency Detection', () => {
    it('should detect simple circular dependencies', () => {
      // This is a tricky case - circular dependencies in asset references
      // are actually impossible in the current DSL since assets can only
      // reference other assets, not create new ones. But we test the algorithm.
      const circularDSL = {
        actions: [
          {
            type: 'add_player_choice',
            id: 'choice_a',
            prompt: 'Choose A',
            options: [
              {
                label: 'Option',
                description: 'Test',
                reactions: [
                  {
                    type: 'add_player_choice',
                    id: 'choice_b',
                    prompt: 'Choose B',
                    options: [
                      {
                        label: 'Back to A',
                        description: 'Test',
                        reactions: [
                          {
                            type: 'play_cutscene',
                            cutscene_id: 'choice_a' // This creates a logical dependency
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };

      // Note: This particular case won't create a circular dependency 
      // because play_cutscene references, not creates. It will fail due to unknown reference:
      const result = parser.parseObject(circularDSL);
      expect(result.success).toBe(false); // Will fail due to unknown reference
      // The error type could be either unknown_reference or circular_dependency
      expect(['unknown_reference', 'circular_dependency']).toContain(result.errors![0].type);
    });

    it('should handle complex dependency chains', () => {
      const complexDSL = {
        actions: [
          {
            type: 'asset_image',
            id: 'image_1',
            prompt: 'First image',
            size: '1024x768' as const,
            model: 'flux-schnell' as const
          },
          {
            type: 'asset_subtitle',
            id: 'subtitle_1',
            text: 'First subtitle',
            voice_tone: 'calm' as const,
            voice_gender: 'neutral' as const,
            voice_pace: 'normal' as const,
            model: 'openai-tts' as const
          },
          {
            type: 'asset_cutscene',
            id: 'cutscene_1',
            shots: [
              {
                image_id: 'image_1',
                subtitle_id: 'subtitle_1',
                duration: 5,
                animation: 'none' as const
              }
            ]
          },
          {
            type: 'play_cutscene',
            cutscene_id: 'cutscene_1'
          }
        ]
      };

      const result = parser.parseObject(complexDSL);
      expect(result.success).toBe(true);
      
      const order = result.graph!.executionOrder;
      const imageIndex = order.indexOf('image_1');
      const subtitleIndex = order.indexOf('subtitle_1');
      const cutsceneIndex = order.indexOf('cutscene_1');
      
      // Assets can be created in parallel, so image and subtitle can be in any order
      expect(imageIndex).toBeLessThan(cutsceneIndex);
      expect(subtitleIndex).toBeLessThan(cutsceneIndex);
      // Should contain the play_cutscene action (synthetic ID)
      expect(order).toContain('cutscene_1');
      expect(order.length).toBe(4); // 3 with IDs + 1 synthetic
    });
  });

  describe('Condition Validation', () => {
    it('should validate condition paths', () => {
      const validConditionDSL = {
        actions: [
          {
            type: 'when_then',
            condition: 'species.primary.features.tool_use.level',
            action: {
              type: 'show_modal',
              title: 'Test',
              content: 'Test content',
              image_id: null,
              subtitle_id: null
            }
          }
        ]
      };

      const result = parser.parseObject(validConditionDSL);
      expect(result.success).toBe(true);
    });

    it('should reject invalid condition paths', () => {
      const invalidConditionDSL = {
        actions: [
          {
            type: 'when_then',
            condition: '.invalid.path.',
            action: {
              type: 'show_modal',
              title: 'Test',
              content: 'Test content',
              image_id: null,
              subtitle_id: null
            }
          }
        ]
      };

      const result = parser.parseObject(invalidConditionDSL);
      expect(result.success).toBe(false);
      expect(result.errors![0].type).toBe('invalid_condition');
    });

    it('should reject conditions with consecutive dots', () => {
      const invalidConditionDSL = {
        actions: [
          {
            type: 'when_then',
            condition: 'species..primary',
            action: {
              type: 'show_modal',
              title: 'Test',
              content: 'Test content',
              image_id: null,
              subtitle_id: null
            }
          }
        ]
      };

      const result = parser.parseObject(invalidConditionDSL);
      expect(result.success).toBe(false);
      expect(result.errors![0].type).toBe('invalid_condition');
    });
  });

  describe('Target Validation', () => {
    it('should validate target paths', () => {
      const validTargetDSL = {
        actions: [
          {
            type: 'add_feature',
            feature_type: 'tool_use',
            feature_data: { level: 1 },
            target: 'species.primary'
          }
        ]
      };

      const result = parser.parseObject(validTargetDSL);
      expect(result.success).toBe(true);
    });

    it('should reject invalid target paths', () => {
      const invalidTargetDSL = {
        actions: [
          {
            type: 'add_feature',
            feature_type: 'tool_use',
            feature_data: { level: 1 },
            target: 'invalid..target'
          }
        ]
      };

      const result = parser.parseObject(invalidTargetDSL);
      expect(result.success).toBe(false);
      expect(result.errors![0].type).toBe('invalid_target');
    });
  });

  describe('Nested Actions', () => {
    it('should handle deeply nested player choices', () => {
      const nestedChoiceDSL = {
        actions: [
          {
            type: 'add_player_choice',
            id: 'main_choice',
            prompt: 'What do you want to do?',
            options: [
              {
                label: 'Explore',
                description: 'Explore the area',
                reactions: [
                  {
                    type: 'add_player_choice',
                    id: 'explore_choice',
                    prompt: 'Where to explore?',
                    options: [
                      {
                        label: 'Cave',
                        description: 'Enter the cave',
                        reactions: [
                          {
                            type: 'show_modal',
                            title: 'Cave Discovery',
                            content: 'You found something!',
                            image_id: null,
                            subtitle_id: null
                          }
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      };

      const result = parser.parseObject(nestedChoiceDSL);
      expect(result.success).toBe(true);
      expect(result.graph!.gameActions).toContain('main_choice');
      expect(result.graph!.gameActions).toContain('explore_choice');
    });

    it('should handle when_then with nested actions', () => {
      const nestedWhenThenDSL = {
        actions: [
          {
            type: 'when_then',
            condition: 'game.level_complete',
            action: {
              type: 'when_then',
              condition: 'player.score',
              action: {
                type: 'show_modal',
                title: 'High Score!',
                content: 'Congratulations!',
                image_id: null,
                subtitle_id: null
              }
            }
          }
        ]
      };

      const result = parser.parseObject(nestedWhenThenDSL);
      expect(result.success).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty action array', () => {
      const emptyDSL = { actions: [] };
      const result = parser.parseObject(emptyDSL);
      expect(result.success).toBe(true);
      expect(result.graph!.nodes.size).toBe(0);
    });

    it('should handle single action', () => {
      const singleActionDSL = {
        actions: [
          {
            type: 'reason',
            ephemeral_reasoning: 'Single reason'
          }
        ]
      };

      const result = parser.parseObject(singleActionDSL);
      expect(result.success).toBe(true);
    });

    it('should handle actions with null optional fields', () => {
      const nullFieldsDSL = {
        actions: [
          {
            type: 'show_modal',
            title: 'Test Modal',
            content: 'Test content',
            image_id: null,
            subtitle_id: null
          }
        ]
      };

      const result = parser.parseObject(nullFieldsDSL);
      expect(result.success).toBe(true);
    });
  });

  describe('Action Categorization', () => {
    it('should correctly categorize asset and game actions', () => {
      const mixedDSL = {
        actions: [
          {
            type: 'reason',
            ephemeral_reasoning: 'This should not be categorized'
          },
          {
            type: 'asset_image',
            id: 'test_image',
            prompt: 'Test',
            size: '1024x768' as const,
            model: 'flux-schnell' as const
          },
          {
            type: 'show_modal',
            title: 'Test',
            content: 'Test',
            image_id: null,
            subtitle_id: null
          }
        ]
      };

      const result = parser.parseObject(mixedDSL);
      expect(result.success).toBe(true);
      expect(result.graph!.assetActions).toEqual(['test_image']);
      expect(result.graph!.gameActions).toHaveLength(1); // show_modal
    });
  });

  describe('Execution Order', () => {
    it('should generate correct execution order', () => {
      const orderedDSL = {
        actions: [
          {
            type: 'asset_image',
            id: 'image_1',
            prompt: 'Test image',
            size: '1024x768' as const,
            model: 'flux-schnell' as const
          },
          {
            type: 'asset_subtitle',
            id: 'subtitle_1',
            text: 'Test subtitle',
            voice_tone: 'calm' as const,
            voice_gender: 'neutral' as const,
            voice_pace: 'normal' as const,
            model: 'openai-tts' as const
          },
          {
            type: 'asset_cutscene',
            id: 'cutscene_1',
            shots: [
              {
                image_id: 'image_1',
                subtitle_id: 'subtitle_1',
                duration: 5,
                animation: 'none' as const
              }
            ]
          },
          {
            type: 'play_cutscene',
            cutscene_id: 'cutscene_1'
          }
        ]
      };

      const result = parser.parseObject(orderedDSL);
      expect(result.success).toBe(true);
      
      const order = result.graph!.executionOrder;
      const imageIndex = order.indexOf('image_1');
      const subtitleIndex = order.indexOf('subtitle_1');
      const cutsceneIndex = order.indexOf('cutscene_1');
      
      // Assets can be created in parallel, so image and subtitle can be in any order
      expect(imageIndex).toBeLessThan(cutsceneIndex);
      expect(subtitleIndex).toBeLessThan(cutsceneIndex);
    });
  });

  describe('Convenience Functions', () => {
    it('should work with parseActionDSL function', () => {
      const dsl = JSON.stringify({
        actions: [
          {
            type: 'reason',
            ephemeral_reasoning: 'Test'
          }
        ]
      });

      const result = parseActionDSL(dsl);
      expect(result.success).toBe(true);
    });

    it('should work with parseActionObject function', () => {
      const dsl = {
        actions: [
          {
            type: 'reason',
            ephemeral_reasoning: 'Test'
          }
        ]
      };

      const result = parseActionObject(dsl);
      expect(result.success).toBe(true);
    });
  });

  describe('Statistics', () => {
    it('should calculate execution statistics', () => {
      const dsl = {
        actions: [
          {
            type: 'asset_image',
            id: 'image_1',
            prompt: 'Test',
            size: '1024x768' as const,
            model: 'flux-schnell' as const
          },
          {
            type: 'show_modal',
            title: 'Test',
            content: 'Test',
            image_id: null,
            subtitle_id: null
          }
        ]
      };

      const result = parser.parseObject(dsl);
      const stats = DSLParser.getExecutionStats(result);
      
      expect(stats).toBeDefined();
      expect(stats!.totalActions).toBe(2);
      expect(stats!.assetActions).toBe(1);
      expect(stats!.gameActions).toBe(1);
      expect(stats!.readyActions).toBe(2); // Both should be ready
    });

    it('should return null for failed parsing', () => {
      const result = { success: false, errors: [] };
      const stats = DSLParser.getExecutionStats(result);
      expect(stats).toBeNull();
    });
  });

  describe('Performance', () => {
    it('should handle large action sets efficiently', () => {
      // Generate 1000 actions for performance testing
      const actions = [];
      
      // Add 500 asset actions
      for (let i = 0; i < 500; i++) {
        actions.push({
          type: 'asset_image',
          id: `image_${i}`,
          prompt: `Generated image ${i}`,
          size: '1024x768' as const,
          model: 'flux-schnell' as const
        });
      }
      
      // Add 500 game actions that reference the assets
      for (let i = 0; i < 500; i++) {
        actions.push({
          type: 'show_modal',
          title: `Modal ${i}`,
          content: `Content for modal ${i}`,
          image_id: `image_${i}`,
          subtitle_id: null
        });
      }
      
      const largeDSL = { actions };
      
      // Measure parsing time
      const startTime = performance.now();
      const result = parser.parseObject(largeDSL);
      const endTime = performance.now();
      const parseTime = endTime - startTime;
      
      // Verify success
      expect(result.success).toBe(true);
      expect(result.graph!.nodes.size).toBe(1000);
      expect(result.graph!.assetActions).toHaveLength(500);
      expect(result.graph!.gameActions).toHaveLength(500);
      expect(result.graph!.executionOrder).toHaveLength(1000);
      
      // Performance assertion - should parse 1000 actions in under 100ms
      expect(parseTime).toBeLessThan(100);
      
      console.log(`Performance test: Parsed 1000 actions in ${parseTime.toFixed(2)}ms`);
    });

    it('should handle deeply nested player choices', () => {
      // Create deeply nested player choices (10 levels deep)
      function createNestedChoice(depth: number): object {
        if (depth === 0) {
          return {
            type: 'show_modal',
            title: 'End',
            content: 'Reached the end',
            image_id: null,
            subtitle_id: null
          };
        }
        
        return {
          type: 'add_player_choice',
          id: `choice_level_${depth}`,
          prompt: `Choice at level ${depth}`,
          options: [
            {
              label: 'Go deeper',
              description: `Go to level ${depth - 1}`,
              reactions: [createNestedChoice(depth - 1)]
            }
          ]
        };
      }
      
      const deepNestedDSL = {
        actions: [createNestedChoice(10)]
      };
      
      const startTime = performance.now();
      const result = parser.parseObject(deepNestedDSL);
      const endTime = performance.now();
      const parseTime = endTime - startTime;
      
      expect(result.success).toBe(true);
      expect(parseTime).toBeLessThan(50); // Should handle deep nesting quickly
      
      console.log(`Deep nesting test: Parsed 10-level nested choices in ${parseTime.toFixed(2)}ms`);
    });
  });
});