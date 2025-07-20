import { describe, it, expect, beforeEach } from 'vitest';
import { MockLLM } from './mock';
import type { GameState } from '../dsl/types';

describe('MockLLM', () => {
  let mockLLM: MockLLM;
  let initialState: GameState;

  beforeEach(() => {
    mockLLM = new MockLLM();
    initialState = {
      turn: 0,
      species: []
    };
  });

  it('should generate turn 1 with primordial species', async () => {
    const actions = await mockLLM.generateActions('test prompt', initialState);
    
    expect(actions).toHaveLength(4); // turn_changed + 2 species_added + turn_ended
    expect(actions[0]).toEqual({ type: 'turn_changed', turn: 1 });
    expect(actions[1]).toEqual({ 
      type: 'species_added', 
      name: 'Primordial-life'
    });
    expect(actions[2]).toEqual({ 
      type: 'species_added', 
      name: 'Proto-bacteria'
    });
    expect(actions[3]).toEqual({ type: 'turn_ended' });
  });

  it('should generate turn 2 with parent relationships', async () => {
    // First generate turn 1
    await mockLLM.generateActions('test', initialState);
    
    // Then generate turn 2 with proper Species objects
    const turn2State = { 
      turn: 1, 
      species: [
        { id: '1', name: 'Primordial-life', parentId: null, birthTurn: 1 },
        { id: '2', name: 'Proto-bacteria', parentId: null, birthTurn: 1 }
      ]
    };
    const actions = await mockLLM.generateActions('test', turn2State);
    
    expect(actions).toHaveLength(4); // turn_changed + 2 species_added + turn_ended
    expect(actions[0]).toEqual({ type: 'turn_changed', turn: 2 });
    
    // Check that species have parent relationships
    const bacteriaAction = actions.find(a => a.type === 'species_added' && a.name === 'Early-bacteria');
    const algaeAction = actions.find(a => a.type === 'species_added' && a.name === 'Proto-algae');
    
    expect(bacteriaAction).toEqual({
      type: 'species_added',
      name: 'Early-bacteria',
      parentSpecies: 'Proto-bacteria'
    });
    
    expect(algaeAction).toEqual({
      type: 'species_added',
      name: 'Proto-algae',
      parentSpecies: 'Primordial-life'
    });
  });

  it('should handle extinctions in later turns', async () => {
    // Generate turns 1 and 2 first
    await mockLLM.generateActions('test', { turn: 0, species: [] });
    await mockLLM.generateActions('test', { turn: 1, species: [] });
    
    // Generate turn 3 which has extinctions - need proper species state
    const turn3State = { 
      turn: 2, 
      species: [
        { id: '1', name: 'Primordial-life', parentId: null, birthTurn: 1 },
        { id: '2', name: 'Proto-bacteria', parentId: null, birthTurn: 1 },
        { id: '3', name: 'Early-bacteria', parentId: '2', birthTurn: 2 },
        { id: '4', name: 'Proto-algae', parentId: '1', birthTurn: 2 }
      ]
    };
    const actions = await mockLLM.generateActions('test', turn3State);
    
    // Should have extinctions and new species
    const extinctions = actions.filter(a => a.type === 'species_removed');
    const additions = actions.filter(a => a.type === 'species_added');
    
    expect(extinctions).toHaveLength(1);
    expect(extinctions[0]).toEqual({
      type: 'species_removed',
      name: 'Proto-bacteria'
    });
    
    expect(additions).toHaveLength(3); // Aerobic-bacteria, Green-algae, Blue-algae
  });

  it('should return empty array when no more turns available', async () => {
    const futureState = { turn: 10, species: [] };
    const actions = await mockLLM.generateActions('test', futureState);
    
    expect(actions).toEqual([]);
  });

  it('should track species lineage correctly', async () => {
    // Create a state with species to test lineage
    const testState = {
      turn: 3,
      species: [
        { id: '1', name: 'Primordial-life', parentId: null, birthTurn: 1 },
        { id: '2', name: 'Proto-bacteria', parentId: null, birthTurn: 1 },
        { id: '3', name: 'Early-bacteria', parentId: '2', birthTurn: 2 },
        { id: '4', name: 'Proto-algae', parentId: '1', birthTurn: 2 },
        { id: '5', name: 'Aerobic-bacteria', parentId: '3', birthTurn: 3 },
        { id: '6', name: 'Green-algae', parentId: '4', birthTurn: 3 }
      ]
    };
    
    // Check lineage
    const lineage = mockLLM.getSpeciesLineage('Aerobic-bacteria', testState);
    expect(lineage).toEqual(['Proto-bacteria', 'Early-bacteria', 'Aerobic-bacteria']);
    
    const algaeLineage = mockLLM.getSpeciesLineage('Green-algae', testState);
    expect(algaeLineage).toEqual(['Primordial-life', 'Proto-algae', 'Green-algae']);
  });

  it('should provide meaningful debug output', async () => {
    // Create a test state with proper species
    const testState = {
      turn: 1,
      species: [
        { id: '1', name: 'Primordial-life', parentId: null, birthTurn: 1 },
        { id: '2', name: 'Proto-bacteria', parentId: null, birthTurn: 1 }
      ]
    };
    
    const debugOutput = mockLLM.formatStateForLLM(testState);
    const parsed = JSON.parse(debugOutput);
    
    expect(parsed.current_turn).toBe(1);
    expect(parsed.living_species).toHaveLength(2);
    expect(parsed.total_species_count).toBe(2);
    expect(parsed.living_species[0].name).toBe('Primordial-life');
    expect(parsed.living_species[1].name).toBe('Proto-bacteria');
  });

  it('should ensure all parent references are valid', async () => {
    // Create a comprehensive test state
    const testState = {
      turn: 6,
      species: [
        { id: '1', name: 'Primordial-life', parentId: null, birthTurn: 1, extinctionTurn: 4 },
        { id: '2', name: 'Proto-bacteria', parentId: null, birthTurn: 1, extinctionTurn: 3 },
        { id: '3', name: 'Early-bacteria', parentId: '2', birthTurn: 2, extinctionTurn: 5 },
        { id: '4', name: 'Proto-algae', parentId: '1', birthTurn: 2, extinctionTurn: 6 },
        { id: '5', name: 'Aerobic-bacteria', parentId: '3', birthTurn: 3 },
        { id: '6', name: 'Green-algae', parentId: '4', birthTurn: 3 },
        { id: '7', name: 'Blue-algae', parentId: '4', birthTurn: 3, extinctionTurn: 4 },
        { id: '8', name: 'Cyanobacteria', parentId: '5', birthTurn: 4 },
        { id: '9', name: 'Red-algae', parentId: '4', birthTurn: 4, extinctionTurn: 6 },
        { id: '10', name: 'Colonial-algae', parentId: '6', birthTurn: 4 },
        { id: '11', name: 'Simple-moss', parentId: '6', birthTurn: 5 },
        { id: '12', name: 'Marine-bacteria', parentId: '8', birthTurn: 5 },
        { id: '13', name: 'Multicellular-algae', parentId: '9', birthTurn: 5 },
        { id: '14', name: 'Ground-moss', parentId: '11', birthTurn: 6 },
        { id: '15', name: 'Water-moss', parentId: '11', birthTurn: 6 },
        { id: '16', name: 'Primitive-fern', parentId: '13', birthTurn: 6 }
      ]
    };
    
    const livingSpecies = mockLLM.getLivingSpecies(testState);
    const allSpeciesById = new Map(testState.species.map(s => [s.id, s.name]));
    
    // Check that all parent references point to species that were created
    for (const species of livingSpecies) {
      if (species.parentId) {
        expect(allSpeciesById.has(species.parentId)).toBe(true);
      }
    }
  });
});