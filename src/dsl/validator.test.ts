import { describe, it, expect } from 'vitest';
import { validator } from './validate';
import type { DSLState, DSLAction, DSLActionTurn } from './types';

describe('DSL Validator', () => {
  const baseState: DSLState = {
    turn: 2,
    species: [
      {
        id: 'moss-1',
        name: 'Basic Moss',
        description: 'First organism',
        creation_turn: 1
      },
      {
        id: 'moss-2',
        name: 'Water Moss',
        description: 'Aquatic moss',
        parent: 'moss-1',
        creation_turn: 2
      },
      {
        id: 'extinct-moss',
        name: 'Ancient Moss',
        description: 'Extinct moss',
        creation_turn: 1,
        extinction_turn: 2
      }
    ],
    previewCreate: [],
    previewExtinct: []
  };

  describe('validateAction', () => {
    describe('SpeciesCreate validation', () => {
      it('should accept valid species creation', () => {
        const action: DSLAction = {
          type: 'SpeciesCreate',
          species: {
            id: 'moss-3',
            name: 'Rock Moss',
            description: 'Hardy moss',
            parent: 'moss-1',
            creation_turn: 2
          }
        };

        const result = validator.validateAction(action, baseState);
        expect(result.valid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      it('should reject duplicate species ID', () => {
        const action: DSLAction = {
          type: 'SpeciesCreate',
          species: {
            id: 'moss-1', // Already exists
            name: 'Duplicate',
            description: 'Should fail',
            creation_turn: 2
          }
        };

        const result = validator.validateAction(action, baseState);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            path: 'species.id',
            message: expect.stringContaining('already exists')
          })
        );
      });

      it('should reject invalid parent', () => {
        const action: DSLAction = {
          type: 'SpeciesCreate',
          species: {
            id: 'moss-3',
            name: 'Orphan Moss',
            description: 'No parent',
            parent: 'non-existent',
            creation_turn: 2
          }
        };

        const result = validator.validateAction(action, baseState);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            path: 'species.parent',
            message: expect.stringContaining('does not exist')
          })
        );
      });

      it('should reject wrong creation turn', () => {
        const action: DSLAction = {
          type: 'SpeciesCreate',
          species: {
            id: 'moss-3',
            name: 'Time Travel Moss',
            description: 'Wrong turn',
            creation_turn: 3 // Current turn is 2
          }
        };

        const result = validator.validateAction(action, baseState);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            path: 'species.creation_turn',
            message: expect.stringContaining('current turn')
          })
        );
      });
    });

    describe('SpeciesCreateChoice validation', () => {
      it('should accept valid preview', () => {
        const action: DSLAction = {
          type: 'SpeciesCreateChoice',
          preview: {
            id: 'preview-1',
            name: 'Shade Moss',
            description: 'Dark variant',
            parent_id: 'moss-1',
            creation_turn: 2
          }
        };

        const result = validator.validateAction(action, baseState);
        expect(result.valid).toBe(true);
      });

      it('should reject extinct parent', () => {
        const action: DSLAction = {
          type: 'SpeciesCreateChoice',
          preview: {
            id: 'preview-1',
            name: 'Ghost Moss',
            description: 'From extinct parent',
            parent_id: 'extinct-moss',
            creation_turn: 2
          }
        };

        const result = validator.validateAction(action, baseState);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            path: 'preview.parent_id',
            message: expect.stringContaining('extinct')
          })
        );
      });
    });

    describe('SpeciesExtinct validation', () => {
      it('should accept valid extinction', () => {
        const action: DSLAction = {
          type: 'SpeciesExtinct',
          species_id: 'moss-1',
          extinction_turn: 2
        };

        const result = validator.validateAction(action, baseState);
        expect(result.valid).toBe(true);
      });

      it('should reject extinct species', () => {
        const action: DSLAction = {
          type: 'SpeciesExtinct',
          species_id: 'extinct-moss',
          extinction_turn: 2
        };

        const result = validator.validateAction(action, baseState);
        expect(result.valid).toBe(false);
        expect(result.errors).toContainEqual(
          expect.objectContaining({
            path: 'species_id',
            message: expect.stringContaining('already extinct')
          })
        );
      });

      it('should reject non-existent species', () => {
        const action: DSLAction = {
          type: 'SpeciesExtinct',
          species_id: 'non-existent',
          extinction_turn: 2
        };

        const result = validator.validateAction(action, baseState);
        expect(result.valid).toBe(false);
      });
    });

    describe('SpeciesExtinctChoice validation', () => {
      it('should accept valid extinction preview', () => {
        const action: DSLAction = {
          type: 'SpeciesExtinctChoice',
          preview: {
            species_id: 'moss-2',
            extinction_turn: 2
          }
        };

        const result = validator.validateAction(action, baseState);
        expect(result.valid).toBe(true);
      });

      it('should reject duplicate extinction preview', () => {
        const stateWithPreview: DSLState = {
          ...baseState,
          previewExtinct: [{
            species_id: 'moss-2',
            extinction_turn: 2
          }]
        };

        const action: DSLAction = {
          type: 'SpeciesExtinctChoice',
          preview: {
            species_id: 'moss-2',
            extinction_turn: 2
          }
        };

        const result = validator.validateAction(action, stateWithPreview);
        expect(result.valid).toBe(false);
      });
    });
  });

  describe('validateTurn', () => {
    it('should accept valid turn with multiple actions', () => {
      const turn: DSLActionTurn = {
        actions: [
          {
            type: 'SpeciesCreate',
            species: {
              id: 'moss-3',
              name: 'Rock Moss',
              description: 'Hardy moss',
              parent: 'moss-1',
              creation_turn: 2
            }
          },
          {
            type: 'SpeciesCreateChoice',
            preview: {
              id: 'preview-1',
              name: 'Shade Moss',
              description: 'Dark variant',
              parent_id: 'moss-1',
              creation_turn: 2
            }
          }
        ]
      };

      const result = validator.validateTurn(turn, baseState);
      expect(result.valid).toBe(true);
    });

    it('should detect duplicate IDs within turn', () => {
      const turn: DSLActionTurn = {
        actions: [
          {
            type: 'SpeciesCreate',
            species: {
              id: 'moss-3',
              name: 'Rock Moss',
              description: 'First',
              creation_turn: 2
            }
          },
          {
            type: 'SpeciesCreate',
            species: {
              id: 'moss-3', // Same ID
              name: 'Another Moss',
              description: 'Duplicate',
              creation_turn: 2
            }
          }
        ]
      };

      const result = validator.validateTurn(turn, baseState);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('Duplicate species ID')
        })
      );
    });

    it('should detect multiple extinctions of same species', () => {
      const turn: DSLActionTurn = {
        actions: [
          {
            type: 'SpeciesExtinct',
            species_id: 'moss-1',
            extinction_turn: 2
          },
          {
            type: 'SpeciesExtinctChoice',
            preview: {
              species_id: 'moss-1', // Same species
              extinction_turn: 2
            }
          }
        ]
      };

      const result = validator.validateTurn(turn, baseState);
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual(
        expect.objectContaining({
          message: expect.stringContaining('already marked for extinction')
        })
      );
    });
  });

  describe('generateFeedback', () => {
    it('should generate helpful feedback for errors', () => {
      const result = {
        valid: false,
        errors: [
          { path: 'species.id', message: 'Species ID is required' },
          { path: 'species.parent', message: 'Parent species does not exist', value: 'fake-parent' }
        ]
      };

      const feedback = validator.generateFeedback(result);
      
      expect(feedback).toContain('Validation failed');
      expect(feedback).toContain('Species ID is required');
      expect(feedback).toContain('Parent species does not exist');
      expect(feedback).toContain('fake-parent');
    });

    it('should return empty string for valid result', () => {
      const result = { valid: true, errors: [] };
      const feedback = validator.generateFeedback(result);
      expect(feedback).toBe('');
    });
  });
});