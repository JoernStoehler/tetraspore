/**
 * Type definitions for the Trait View component system
 * Based on specification in docs/spec-trait-view.md
 */

import * as d3 from 'd3';

export enum AdoptedTraitCategory {
  Biological = "biological",
  Behavioral = "behavioral", 
  Social = "social",
  Technological = "technological",
}

export enum EnvironmentalTraitCategory {
  Geological = "geological",
  Ecological = "ecological",
  Industrial = "industrial",
}

export type TraitCategory = AdoptedTraitCategory | EnvironmentalTraitCategory;

export interface Trait {
  id: string;
  name: string;
  category: TraitCategory;
  description: string;
  isEnvironmental: boolean;
}

export interface TraitEdge {
  from: string; // Trait ID
  to: string; // Trait ID
  description: string; // Natural language description of relationship
}

export interface TraitChoice {
  id: string;
  options: string[]; // Trait IDs that can be chosen
  choiceType: "adopt" | "lose";
}

export interface PlayerTraitState {
  adoptedTraits: Set<string>;
  discoveredTraits: Set<string>;
  environmentalTraits: Set<string>; // Traits present in environment

  // Current choice events
  adoptableChoices?: TraitChoice[];
  losableChoices?: TraitChoice[];
}

export interface TraitViewProps {
  // Core data
  traits: Trait[];
  edges: TraitEdge[];

  // Player state
  playerState: PlayerTraitState;
  visibleTraits: Set<string>; // Which traits player can see

  // Callbacks
  onTraitClick: (traitId: string) => void;
  onTraitHover: (traitId: string | null) => void;
  onChoiceSelect?: (choiceId: string, selectedTraitId: string) => void;
}

export type TraitNodeState = 
  | "not-discovered"
  | "discovered" 
  | "adoptable"
  | "adopted"
  | "losable"
  | "environmental";

export interface TraitNode extends d3.SimulationNodeDatum {
  id: string;
  trait: Trait;
  state: TraitNodeState;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLayoutOptions {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
  nodeRadius: number;
  linkDistance: number;
  chargeStrength: number;
}