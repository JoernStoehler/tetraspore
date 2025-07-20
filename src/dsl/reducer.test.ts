import { describe, it, expect } from 'vitest';
import { reduceEvent, initialState, applyEvents } from './reducer';
import type { GameState, GameEvent } from './types';

describe('DSL Reducer', () => {
  describe('initialState', () => {
    it('should have correct initial state', () => {
      expect(initialState).toEqual({
        turn: 0,
        species: []
      });
    });
  });

  describe('turn_changed event', () => {
    it('should update the turn number', () => {
      const event: GameEvent = { type: 'turn_changed', turn: 5 };
      const newState = reduceEvent(initialState, event);
      
      expect(newState.turn).toBe(5);
      expect(newState.species).toEqual([]);
    });
  });

  describe('species_added event', () => {
    it('should add a new species without parent', () => {
      const event: GameEvent = { type: 'species_added', name: 'Primordial Algae' };
      const newState = reduceEvent(initialState, event);
      
      expect(newState.species).toHaveLength(1);
      expect(newState.species[0]).toMatchObject({
        name: 'Primordial Algae',
        parentId: null,
        birthTurn: 0
      });
      expect(newState.species[0].id).toBeTruthy();
      expect(newState.species[0].extinctionTurn).toBeUndefined();
    });

    it('should add a new species with parent', () => {
      const state: GameState = {
        turn: 2,
        species: [{
          id: 'species-1',
          name: 'Primordial Algae',
          parentId: null,
          birthTurn: 1
        }]
      };
      
      const event: GameEvent = { 
        type: 'species_added', 
        name: 'Blue-green Algae',
        parentSpecies: 'Primordial Algae'
      };
      const newState = reduceEvent(state, event);
      
      expect(newState.species).toHaveLength(2);
      expect(newState.species[1]).toMatchObject({
        name: 'Blue-green Algae',
        parentId: 'species-1',
        birthTurn: 2
      });
    });

    it('should not add duplicate species', () => {
      const state: GameState = {
        turn: 1,
        species: [{
          id: 'species-1',
          name: 'Primordial Algae',
          parentId: null,
          birthTurn: 0
        }]
      };
      
      const event: GameEvent = { type: 'species_added', name: 'Primordial Algae' };
      const newState = reduceEvent(state, event);
      
      expect(newState.species).toHaveLength(1);
      expect(newState).toBe(state); // Should return the same state object
    });

    it('should handle non-existent parent species', () => {
      const event: GameEvent = { 
        type: 'species_added', 
        name: 'Blue-green Algae',
        parentSpecies: 'Non-existent Species'
      };
      const newState = reduceEvent(initialState, event);
      
      expect(newState.species).toHaveLength(1);
      expect(newState.species[0].parentId).toBeNull();
    });
  });

  describe('species_removed event', () => {
    it('should mark species as extinct', () => {
      const state: GameState = {
        turn: 3,
        species: [{
          id: 'species-1',
          name: 'Primordial Algae',
          parentId: null,
          birthTurn: 0
        }]
      };
      
      const event: GameEvent = { type: 'species_removed', name: 'Primordial Algae' };
      const newState = reduceEvent(state, event);
      
      expect(newState.species).toHaveLength(1);
      expect(newState.species[0]).toMatchObject({
        name: 'Primordial Algae',
        extinctionTurn: 3
      });
    });

    it('should handle removing non-existent species', () => {
      const event: GameEvent = { type: 'species_removed', name: 'Non-existent' };
      const newState = reduceEvent(initialState, event);
      
      expect(newState.species).toHaveLength(0);
      expect(newState).toEqual(initialState); // No change
    });
  });

  describe('turn_ended event', () => {
    it('should not change state', () => {
      const event: GameEvent = { type: 'turn_ended' };
      const newState = reduceEvent(initialState, event);
      
      expect(newState).toBe(initialState);
    });
  });

  describe('applyEvents', () => {
    it('should apply multiple events in sequence', () => {
      const events: GameEvent[] = [
        { type: 'turn_changed', turn: 1 },
        { type: 'species_added', name: 'Primordial Algae' },
        { type: 'species_added', name: 'Simple Bacteria' },
        { type: 'turn_changed', turn: 2 },
        { type: 'species_added', name: 'Blue-green Algae', parentSpecies: 'Primordial Algae' },
        { type: 'species_removed', name: 'Simple Bacteria' },
        { type: 'turn_ended' }
      ];
      
      const newState = applyEvents(initialState, events);
      
      expect(newState.turn).toBe(2);
      expect(newState.species).toHaveLength(3);
      
      // Check Primordial Algae
      const primordial = newState.species.find(s => s.name === 'Primordial Algae');
      expect(primordial).toBeDefined();
      expect(primordial!.parentId).toBeNull();
      expect(primordial!.birthTurn).toBe(1);
      expect(primordial!.extinctionTurn).toBeUndefined();
      
      // Check Simple Bacteria (extinct)
      const bacteria = newState.species.find(s => s.name === 'Simple Bacteria');
      expect(bacteria).toBeDefined();
      expect(bacteria!.birthTurn).toBe(1);
      expect(bacteria!.extinctionTurn).toBe(2);
      
      // Check Blue-green Algae
      const blueGreen = newState.species.find(s => s.name === 'Blue-green Algae');
      expect(blueGreen).toBeDefined();
      expect(blueGreen!.parentId).toBe(primordial!.id);
      expect(blueGreen!.birthTurn).toBe(2);
    });
  });

  describe('species lineage tracking', () => {
    it('should track multi-generation lineages', () => {
      const events: GameEvent[] = [
        { type: 'turn_changed', turn: 1 },
        { type: 'species_added', name: 'A' },
        { type: 'turn_changed', turn: 2 },
        { type: 'species_added', name: 'B', parentSpecies: 'A' },
        { type: 'turn_changed', turn: 3 },
        { type: 'species_added', name: 'C', parentSpecies: 'B' },
        { type: 'turn_changed', turn: 4 },
        { type: 'species_added', name: 'D', parentSpecies: 'C' }
      ];
      
      const state = applyEvents(initialState, events);
      
      const speciesA = state.species.find(s => s.name === 'A');
      const speciesB = state.species.find(s => s.name === 'B');
      const speciesC = state.species.find(s => s.name === 'C');
      const speciesD = state.species.find(s => s.name === 'D');
      
      expect(speciesA!.parentId).toBeNull();
      expect(speciesB!.parentId).toBe(speciesA!.id);
      expect(speciesC!.parentId).toBe(speciesB!.id);
      expect(speciesD!.parentId).toBe(speciesC!.id);
    });

    it('should preserve lineage when parent goes extinct', () => {
      const events: GameEvent[] = [
        { type: 'species_added', name: 'Parent' },
        { type: 'turn_changed', turn: 1 },
        { type: 'species_added', name: 'Child', parentSpecies: 'Parent' },
        { type: 'turn_changed', turn: 2 },
        { type: 'species_removed', name: 'Parent' },
        { type: 'turn_changed', turn: 3 },
        { type: 'species_added', name: 'Grandchild', parentSpecies: 'Child' }
      ];
      
      const state = applyEvents(initialState, events);
      
      const parent = state.species.find(s => s.name === 'Parent');
      const child = state.species.find(s => s.name === 'Child');
      const grandchild = state.species.find(s => s.name === 'Grandchild');
      
      expect(parent!.extinctionTurn).toBe(2);
      expect(child!.parentId).toBe(parent!.id);
      expect(grandchild!.parentId).toBe(child!.id);
    });
  });
});