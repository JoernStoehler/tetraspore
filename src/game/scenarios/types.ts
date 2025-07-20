/**
 * @agent-note This file defines the structure of mock scenario JSON files
 * @integration-point JSON scenarios are loaded by MockLLM to simulate game progression
 * @design-rationale Scenarios are externalized to JSON for easy modification without code changes
 */

import type { DSLActionTurn } from '../../dsl';

export interface ScenarioMetadata {
  id: string;
  name: string;
  description: string;
  author?: string;
  version?: string;
}

export interface TurnScenario {
  turn: number;
  reasoning: string;
  actions: DSLActionTurn['actions'];
}

export interface ConditionalScenario {
  condition: {
    minSpecies?: number;
    maxSpecies?: number;
    hasSpeciesNamed?: string[];
    turnModulo?: number; // e.g., every 5 turns
  };
  reasoning: string;
  actions: DSLActionTurn['actions'];
}

export interface SpeciesEvolutionPath {
  from: string; // Species name pattern
  to: string[];  // Possible evolutions
  descriptions: Record<string, string>;
}

export interface MockScenarioFile {
  metadata: ScenarioMetadata;
  
  // Fixed turn scenarios (turns 1-5 in default)
  fixedTurns: TurnScenario[];
  
  // Conditional scenarios for procedural generation after fixed turns
  evolutionScenarios: ConditionalScenario[];
  extinctionScenarios: ConditionalScenario[];
  
  // Evolution paths for species
  evolutionPaths: SpeciesEvolutionPath[];
  
  // Extinction reasons for variety
  extinctionReasons: string[];
}