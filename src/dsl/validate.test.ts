import { describe, it, expect } from 'vitest';
import { validateActions, filterValidActions } from './validate';

describe('DSL Validator', () => {
  describe('validateActions', () => {
    it('should accept empty array', () => {
      const result = validateActions([]);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.validActions).toHaveLength(0);
    });

    it('should reject non-array input', () => {
      const result = validateActions('not an array');
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Actions must be an array');
    });

    it('should reject non-object actions', () => {
      const result = validateActions(['string', 123, null]);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.errors[0].message).toContain('Action must be an object');
    });

    it('should reject actions without type', () => {
      const result = validateActions([{ name: 'Test' }]);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].field).toBe('type');
    });

    describe('species_added validation', () => {
      it('should accept valid species_added without parent', () => {
        const result = validateActions([
          { type: 'species_added', name: 'Test Species' }
        ]);
        expect(result.valid).toBe(true);
        expect(result.validActions).toHaveLength(1);
      });

      it('should accept valid species_added with parent', () => {
        const result = validateActions([
          { type: 'species_added', name: 'Child Species', parentSpecies: 'Parent Species' }
        ]);
        expect(result.valid).toBe(true);
        expect(result.validActions).toHaveLength(1);
      });

      it('should reject species_added without name', () => {
        const result = validateActions([
          { type: 'species_added' }
        ]);
        expect(result.valid).toBe(false);
        expect(result.errors[0].field).toBe('name');
      });

      it('should reject empty species name', () => {
        const result = validateActions([
          { type: 'species_added', name: '   ' }
        ]);
        expect(result.valid).toBe(false);
        expect(result.errors[0].message).toContain('Species name cannot be empty');
      });

      it('should reject non-string parentSpecies', () => {
        const result = validateActions([
          { type: 'species_added', name: 'Test', parentSpecies: 123 }
        ]);
        expect(result.valid).toBe(false);
        expect(result.errors[0].field).toBe('parentSpecies');
        expect(result.errors[0].message).toContain('parentSpecies must be a string');
      });

      it('should reject empty parentSpecies', () => {
        const result = validateActions([
          { type: 'species_added', name: 'Test', parentSpecies: '  ' }
        ]);
        expect(result.valid).toBe(false);
        expect(result.errors[0].field).toBe('parentSpecies');
        expect(result.errors[0].message).toContain('parentSpecies cannot be empty');
      });

      it('should warn about unexpected fields', () => {
        const result = validateActions([
          { type: 'species_added', name: 'Test', extraField: 'value' }
        ]);
        expect(result.valid).toBe(true);
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].message).toContain('Unexpected fields: extraField');
      });
    });

    describe('species_removed validation', () => {
      it('should accept valid species_removed', () => {
        const result = validateActions([
          { type: 'species_removed', name: 'Test Species' }
        ]);
        expect(result.valid).toBe(true);
        expect(result.validActions).toHaveLength(1);
      });

      it('should reject species_removed without name', () => {
        const result = validateActions([
          { type: 'species_removed' }
        ]);
        expect(result.valid).toBe(false);
        expect(result.errors[0].field).toBe('name');
      });
    });

    describe('turn_changed validation', () => {
      it('should accept valid turn_changed', () => {
        const result = validateActions([
          { type: 'turn_changed', turn: 5 }
        ]);
        expect(result.valid).toBe(true);
        expect(result.validActions).toHaveLength(1);
      });

      it('should reject turn_changed without turn', () => {
        const result = validateActions([
          { type: 'turn_changed' }
        ]);
        expect(result.valid).toBe(false);
        expect(result.errors[0].field).toBe('turn');
      });

      it('should reject negative turn', () => {
        const result = validateActions([
          { type: 'turn_changed', turn: -1 }
        ]);
        expect(result.valid).toBe(false);
        expect(result.errors[0].message).toContain('non-negative number');
      });
    });

    describe('turn_ended validation', () => {
      it('should accept valid turn_ended', () => {
        const result = validateActions([
          { type: 'turn_ended' }
        ]);
        expect(result.valid).toBe(true);
        expect(result.validActions).toHaveLength(1);
      });
    });

    describe('unknown action types', () => {
      it('should warn about unknown action types', () => {
        const result = validateActions([
          { type: 'unknown_action' }
        ]);
        expect(result.valid).toBe(true); // Still valid, just warns
        expect(result.warnings).toHaveLength(1);
        expect(result.warnings[0].message).toContain('Unknown action type');
        expect(result.validActions).toHaveLength(0); // But not included in valid actions
      });
    });

    describe('mixed actions', () => {
      it('should process multiple valid actions', () => {
        const actions = [
          { type: 'turn_changed', turn: 1 },
          { type: 'species_added', name: 'Species A' },
          { type: 'species_added', name: 'Species B', parentSpecies: 'Species A' },
          { type: 'species_removed', name: 'Species A' },
          { type: 'turn_ended' }
        ];
        
        const result = validateActions(actions);
        expect(result.valid).toBe(true);
        expect(result.validActions).toHaveLength(5);
      });

      it('should report all errors in mixed actions', () => {
        const actions = [
          { type: 'turn_changed' }, // Missing turn
          { type: 'species_added' }, // Missing name
          { type: 'species_added', name: 'Valid' }, // Valid
          { type: 'species_removed', name: '' }, // Empty name
        ];
        
        const result = validateActions(actions);
        expect(result.valid).toBe(false);
        expect(result.errors).toHaveLength(3);
        expect(result.validActions).toHaveLength(1);
      });
    });
  });

  describe('filterValidActions', () => {
    it('should return only valid actions', () => {
      const actions = [
        { type: 'turn_changed', turn: 1 },
        { type: 'species_added' }, // Invalid
        { type: 'species_added', name: 'Valid Species' },
        { notAnAction: true }, // Invalid
        { type: 'turn_ended' }
      ];
      
      const validActions = filterValidActions(actions);
      expect(validActions).toHaveLength(3);
      expect(validActions[0].type).toBe('turn_changed');
      expect(validActions[1].type).toBe('species_added');
      expect(validActions[2].type).toBe('turn_ended');
    });
  });
});