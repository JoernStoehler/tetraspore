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
    
    // Then generate turn 2
    const turn2State = { turn: 1, species: ['Primordial-life', 'Proto-bacteria'] };
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
    
    // Generate turn 3 which has extinctions
    const turn3State = { turn: 2, species: [] };
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
    // Generate a few turns
    await mockLLM.generateActions('test', { turn: 0, species: [] });
    await mockLLM.generateActions('test', { turn: 1, species: [] });
    await mockLLM.generateActions('test', { turn: 2, species: [] });
    
    // Check lineage
    const lineage = mockLLM.getSpeciesLineage('Aerobic-bacteria');
    expect(lineage).toEqual(['Proto-bacteria', 'Early-bacteria', 'Aerobic-bacteria']);
    
    const algaeLineage = mockLLM.getSpeciesLineage('Green-algae');
    expect(algaeLineage).toEqual(['Primordial-life', 'Proto-algae', 'Green-algae']);
  });

  it('should provide meaningful debug output', async () => {
    // Generate a turn
    await mockLLM.generateActions('test', { turn: 0, species: [] });
    
    const debugOutput = mockLLM.formatStateForLLM({ turn: 1, species: [] });
    const parsed = JSON.parse(debugOutput);
    
    expect(parsed.current_turn).toBe(1);
    expect(parsed.living_species).toHaveLength(2);
    expect(parsed.total_species_created).toBe(2);
    expect(parsed.living_species[0].name).toBe('Primordial-life');
    expect(parsed.living_species[1].name).toBe('Proto-bacteria');
  });

  it('should ensure all parent references are valid', async () => {
    // Generate several turns
    for (let turn = 0; turn < 6; turn++) {
      await mockLLM.generateActions('test', { turn, species: [] });
    }
    
    const livingSpecies = mockLLM.getLivingSpecies();
    const allSpeciesNames = new Set([
      'Primordial-life', 'Proto-bacteria', 'Early-bacteria', 'Proto-algae',
      'Aerobic-bacteria', 'Green-algae', 'Blue-algae', 'Cyanobacteria',
      'Red-algae', 'Colonial-algae', 'Simple-moss', 'Marine-bacteria',
      'Multicellular-algae', 'Ground-moss', 'Water-moss', 'Primitive-fern'
    ]);
    
    // Check that all parent references point to species that were created
    for (const species of livingSpecies) {
      if (species.parent) {
        expect(allSpeciesNames.has(species.parent)).toBe(true);
      }
    }
  });
});