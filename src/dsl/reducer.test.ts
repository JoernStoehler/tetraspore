import { describe, it, expect } from 'vitest';
import { reducer, clearPreviews, incrementTurn, isSpeciesAlive, getAliveSpecies, getLineage } from './reducer';
import type { DSLState, Species, CreatePreview, ExtinctPreview } from './types';

describe('DSL Reducer', () => {
  const initialState: DSLState = {
    turn: 1,
    species: [],
    previewCreate: [],
    previewExtinct: []
  };

  describe('SpeciesCreate action', () => {
    it('should add new species to state', () => {
      const newSpecies: Species = {
        id: 'moss-1',
        name: 'Basic Moss',
        description: 'First photosynthetic organism',
        creation_turn: 1
      };

      const newState = reducer.reduce(initialState, {
        type: 'SpeciesCreate',
        species: newSpecies
      });

      expect(newState.species).toHaveLength(1);
      expect(newState.species[0]).toEqual(newSpecies);
    });

    it('should not mutate original state', () => {
      const newSpecies: Species = {
        id: 'moss-1',
        name: 'Basic Moss',
        description: 'First photosynthetic organism',
        creation_turn: 1
      };

      const newState = reducer.reduce(initialState, {
        type: 'SpeciesCreate',
        species: newSpecies
      });

      expect(initialState.species).toHaveLength(0);
      expect(newState).not.toBe(initialState);
    });
  });

  describe('SpeciesCreateChoice action', () => {
    it('should add preview to state', () => {
      const preview: CreatePreview = {
        id: 'preview-1',
        name: 'Water Moss',
        description: 'Aquatic moss variant',
        parent_id: 'moss-1',
        creation_turn: 2
      };

      const newState = reducer.reduce(initialState, {
        type: 'SpeciesCreateChoice',
        preview
      });

      expect(newState.previewCreate).toHaveLength(1);
      expect(newState.previewCreate[0]).toEqual(preview);
    });
  });

  describe('SpeciesExtinct action', () => {
    it('should mark species as extinct', () => {
      const stateWithSpecies: DSLState = {
        ...initialState,
        species: [{
          id: 'moss-1',
          name: 'Basic Moss',
          description: 'First photosynthetic organism',
          creation_turn: 1
        }]
      };

      const newState = reducer.reduce(stateWithSpecies, {
        type: 'SpeciesExtinct',
        species_id: 'moss-1',
        extinction_turn: 3
      });

      expect(newState.species[0].extinction_turn).toBe(3);
    });

    it('should not affect other species', () => {
      const stateWithSpecies: DSLState = {
        ...initialState,
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
            description: 'Second organism',
            creation_turn: 2
          }
        ]
      };

      const newState = reducer.reduce(stateWithSpecies, {
        type: 'SpeciesExtinct',
        species_id: 'moss-1',
        extinction_turn: 3
      });

      expect(newState.species[0].extinction_turn).toBe(3);
      expect(newState.species[1].extinction_turn).toBeUndefined();
    });
  });

  describe('SpeciesExtinctChoice action', () => {
    it('should add extinction preview', () => {
      const preview: ExtinctPreview = {
        species_id: 'moss-1',
        extinction_turn: 3
      };

      const newState = reducer.reduce(initialState, {
        type: 'SpeciesExtinctChoice',
        preview
      });

      expect(newState.previewExtinct).toHaveLength(1);
      expect(newState.previewExtinct[0]).toEqual(preview);
    });
  });

  describe('reduceTurn', () => {
    it('should apply multiple actions in sequence', () => {
      const turn = {
        actions: [
          {
            type: 'SpeciesCreate' as const,
            species: {
              id: 'moss-1',
              name: 'Basic Moss',
              description: 'First organism',
              creation_turn: 1
            }
          },
          {
            type: 'SpeciesCreateChoice' as const,
            preview: {
              id: 'preview-1',
              name: 'Water Moss',
              description: 'Aquatic variant',
              parent_id: 'moss-1',
              creation_turn: 2
            }
          }
        ]
      };

      const newState = reducer.reduceTurn(initialState, turn);

      expect(newState.species).toHaveLength(1);
      expect(newState.previewCreate).toHaveLength(1);
    });
  });
});

describe('Helper functions', () => {
  const stateWithPreviews: DSLState = {
    turn: 2,
    species: [],
    previewCreate: [{
      id: 'preview-1',
      name: 'Test',
      description: 'Test',
      parent_id: 'parent',
      creation_turn: 2
    }],
    previewExtinct: [{
      species_id: 'species-1',
      extinction_turn: 2
    }]
  };

  describe('clearPreviews', () => {
    it('should clear all previews', () => {
      const newState = clearPreviews(stateWithPreviews);
      
      expect(newState.previewCreate).toHaveLength(0);
      expect(newState.previewExtinct).toHaveLength(0);
      expect(newState.turn).toBe(2); // Turn unchanged
    });
  });

  describe('incrementTurn', () => {
    it('should increment turn number', () => {
      const newState = incrementTurn(stateWithPreviews);
      
      expect(newState.turn).toBe(3);
      expect(newState.previewCreate).toHaveLength(1); // Previews unchanged
    });
  });

  describe('isSpeciesAlive', () => {
    const state: DSLState = {
      turn: 3,
      species: [
        {
          id: 'alive-1',
          name: 'Alive Species',
          description: 'Still alive',
          creation_turn: 1
        },
        {
          id: 'extinct-1',
          name: 'Extinct Species',
          description: 'No longer alive',
          creation_turn: 1,
          extinction_turn: 2
        }
      ],
      previewCreate: [],
      previewExtinct: []
    };

    it('should return true for alive species', () => {
      expect(isSpeciesAlive(state, 'alive-1')).toBe(true);
    });

    it('should return false for extinct species', () => {
      expect(isSpeciesAlive(state, 'extinct-1')).toBe(false);
    });

    it('should return false for non-existent species', () => {
      expect(isSpeciesAlive(state, 'non-existent')).toBe(false);
    });
  });

  describe('getAliveSpecies', () => {
    it('should return only alive species', () => {
      const state: DSLState = {
        turn: 3,
        species: [
          {
            id: 'alive-1',
            name: 'Alive 1',
            description: 'Still alive',
            creation_turn: 1
          },
          {
            id: 'extinct-1',
            name: 'Extinct 1',
            description: 'No longer alive',
            creation_turn: 1,
            extinction_turn: 2
          },
          {
            id: 'alive-2',
            name: 'Alive 2',
            description: 'Also alive',
            creation_turn: 2
          }
        ],
        previewCreate: [],
        previewExtinct: []
      };

      const alive = getAliveSpecies(state);
      
      expect(alive).toHaveLength(2);
      expect(alive[0].id).toBe('alive-1');
      expect(alive[1].id).toBe('alive-2');
    });
  });

  describe('getLineage', () => {
    it('should return complete lineage from root to species', () => {
      const state: DSLState = {
        turn: 3,
        species: [
          {
            id: 'root',
            name: 'Root Species',
            description: 'The beginning',
            creation_turn: 1
          },
          {
            id: 'middle',
            name: 'Middle Species',
            description: 'The middle',
            parent: 'root',
            creation_turn: 2
          },
          {
            id: 'leaf',
            name: 'Leaf Species',
            description: 'The end',
            parent: 'middle',
            creation_turn: 3
          }
        ],
        previewCreate: [],
        previewExtinct: []
      };

      const lineage = getLineage(state, 'leaf');
      
      expect(lineage).toHaveLength(3);
      expect(lineage[0].id).toBe('root');
      expect(lineage[1].id).toBe('middle');
      expect(lineage[2].id).toBe('leaf');
    });

    it('should handle non-existent species', () => {
      const state: DSLState = {
        turn: 1,
        species: [],
        previewCreate: [],
        previewExtinct: []
      };

      const lineage = getLineage(state, 'non-existent');
      expect(lineage).toHaveLength(0);
    });
  });
});