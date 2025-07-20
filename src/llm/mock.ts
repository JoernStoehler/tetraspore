// Mock LLM - Generates realistic evolution events with species lineage

import type { GameState, GameAction, Species } from '../dsl/types';
import type { LLMService } from './types';

export class MockLLM implements LLMService {
  private evolutionPatterns = [
    // Turn 1: Primordial origins
    {
      turn: 1,
      spawns: [
        { name: "Primordial-life", parent: null },
        { name: "Proto-bacteria", parent: null }
      ],
      extinctions: []
    },
    // Turn 2: Early branching
    {
      turn: 2,
      spawns: [
        { name: "Early-bacteria", parent: "Proto-bacteria" },
        { name: "Proto-algae", parent: "Primordial-life" }
      ],
      extinctions: []
    },
    // Turn 3: Diversification
    {
      turn: 3,
      spawns: [
        { name: "Aerobic-bacteria", parent: "Early-bacteria" },
        { name: "Green-algae", parent: "Proto-algae" },
        { name: "Blue-algae", parent: "Proto-algae" }
      ],
      extinctions: ["Proto-bacteria"]
    },
    // Turn 4: Some extinctions, new adaptations
    {
      turn: 4,
      spawns: [
        { name: "Cyanobacteria", parent: "Aerobic-bacteria" },
        { name: "Red-algae", parent: "Proto-algae" },
        { name: "Colonial-algae", parent: "Green-algae" }
      ],
      extinctions: ["Primordial-life", "Blue-algae"]
    },
    // Turn 5: Complex organisms emerge
    {
      turn: 5,
      spawns: [
        { name: "Simple-moss", parent: "Green-algae" },
        { name: "Marine-bacteria", parent: "Cyanobacteria" },
        { name: "Multicellular-algae", parent: "Red-algae" }
      ],
      extinctions: ["Early-bacteria"]
    },
    // Turn 6: Early plant life
    {
      turn: 6,
      spawns: [
        { name: "Ground-moss", parent: "Simple-moss" },
        { name: "Water-moss", parent: "Simple-moss" },
        { name: "Primitive-fern", parent: "Multicellular-algae" }
      ],
      extinctions: ["Proto-algae", "Red-algae"]
    }
  ];
  
  async generateActions(_prompt: string, state: GameState): Promise<GameAction[]> {
    // Simulate LLM processing delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const nextTurn = state.turn + 1;
    const pattern = this.evolutionPatterns.find(p => p.turn === nextTurn);
    
    if (!pattern) {
      // No more evolution patterns, just advance turn
      return [
        { type: "turn_changed", turn: nextTurn },
        { type: "turn_ended" }
      ];
    }
    
    const actions: GameAction[] = [
      { type: "turn_changed", turn: nextTurn }
    ];
    
    // Handle extinctions first
    for (const extinctSpeciesName of pattern.extinctions) {
      // Check if species exists and is not already extinct
      const species = state.species.find(s => s.name === extinctSpeciesName && !s.extinctionTurn);
      if (species) {
        actions.push({
          type: "species_removed",
          name: extinctSpeciesName
        });
      }
    }
    
    // Handle new species births
    for (const spawn of pattern.spawns) {
      // Generate species_added event with parent relationship
      const addAction: GameAction = {
        type: "species_added",
        name: spawn.name,
        ...(spawn.parent && { parentSpecies: spawn.parent })
      };
      
      actions.push(addAction);
    }
    
    actions.push({ type: "turn_ended" });
    
    return actions;
  }
  
  // For debugging - shows what the LLM would see
  formatStateForLLM(state: GameState): string {
    // Extract just the living species (those without extinctionTurn)
    const livingSpecies = state.species
      .filter(s => !s.extinctionTurn)
      .map(s => ({
        name: s.name,
        parent: state.species.find(p => p.id === s.parentId)?.name || null,
        birthTurn: s.birthTurn
      }));
    
    return JSON.stringify({
      current_turn: state.turn,
      living_species: livingSpecies,
      total_species_count: state.species.length,
      extinct_count: state.species.filter(s => s.extinctionTurn !== undefined).length
    }, null, 2);
  }

  // Helper method to get species lineage for debugging
  getSpeciesLineage(speciesName: string, state: GameState): string[] {
    const lineage: string[] = [];
    let current = state.species.find(s => s.name === speciesName);
    
    while (current) {
      lineage.unshift(current.name);
      const parentId = current.parentId;
      if (!parentId) break;
      current = state.species.find(s => s.id === parentId);
    }
    
    return lineage;
  }

  // Get all living species with their relationships
  getLivingSpecies(state: GameState): Species[] {
    return state.species.filter(s => !s.extinctionTurn);
  }
}