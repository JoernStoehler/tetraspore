// Mock LLM - Generates realistic evolution events with species lineage

import type { GameState, GameAction } from '../dsl/types';
import type { LLMService } from './types';

interface SpeciesInfo {
  id: string;
  name: string;
  parent?: string;
  turn: number;
  extinct: boolean;
}

export class MockLLM implements LLMService {
  private speciesRegistry: Map<string, SpeciesInfo> = new Map();
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
      // No more evolution patterns
      return [];
    }
    
    const actions: GameAction[] = [
      { type: "turn_changed", turn: nextTurn }
    ];
    
    // Handle extinctions first
    for (const extinctSpecies of pattern.extinctions) {
      const species = this.speciesRegistry.get(extinctSpecies);
      if (species && !species.extinct) {
        species.extinct = true;
        actions.push({
          type: "species_removed",
          name: extinctSpecies
        });
      }
    }
    
    // Handle new species births
    for (const spawn of pattern.spawns) {
      const speciesId = spawn.name;
      const newSpecies: SpeciesInfo = {
        id: speciesId,
        name: spawn.name,
        parent: spawn.parent || undefined,
        turn: nextTurn,
        extinct: false
      };
      
      this.speciesRegistry.set(speciesId, newSpecies);
      
      // Generate species_added event with parent relationship
      const addAction: GameAction = {
        type: "species_added",
        name: spawn.name
      };
      
      // Add parentSpecies field if parent exists (for future DSL compatibility)
      if (spawn.parent) {
        (addAction as any).parentSpecies = spawn.parent;
      }
      
      actions.push(addAction);
    }
    
    actions.push({ type: "turn_ended" });
    
    return actions;
  }
  
  // For debugging - shows what the LLM would see
  formatStateForLLM(state: GameState): string {
    const livingSpecies = Array.from(this.speciesRegistry.values())
      .filter(species => !species.extinct)
      .map(species => ({
        name: species.name,
        parent: species.parent,
        turn: species.turn
      }));

    return JSON.stringify({
      current_turn: state.turn,
      living_species: livingSpecies,
      total_species_created: this.speciesRegistry.size
    }, null, 2);
  }

  // Helper method to get species lineage for debugging
  getSpeciesLineage(speciesName: string): string[] {
    const lineage: string[] = [];
    let current = this.speciesRegistry.get(speciesName);
    
    while (current) {
      lineage.unshift(current.name);
      if (!current.parent) break;
      current = this.speciesRegistry.get(current.parent);
    }
    
    return lineage;
  }

  // Get all living species with their relationships
  getLivingSpecies(): SpeciesInfo[] {
    return Array.from(this.speciesRegistry.values())
      .filter(species => !species.extinct);
  }
}