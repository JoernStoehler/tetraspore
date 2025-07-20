// Core DSL types for the evolution game

export interface Species {
  id: string;
  name: string;
  description: string;
  parent?: string;
  creation_turn: number;
  extinction_turn?: number;
}

export interface CreatePreview {
  id: string;  // Temporary preview ID
  name: string;
  description: string;
  parent_id: string;
  creation_turn: number;
}

export interface ExtinctPreview {
  species_id: string;
  extinction_turn: number;
}

export interface DSLState {
  turn: number;
  species: Species[];  // All species ever created
  previewCreate: CreatePreview[];
  previewExtinct: ExtinctPreview[];
}

// DSL Actions
export type DSLAction = 
  | {
      type: 'SpeciesCreate';
      species: Omit<Species, 'extinction_turn'>;
    }
  | {
      type: 'SpeciesCreateChoice';
      preview: CreatePreview;
    }
  | {
      type: 'SpeciesExtinct';
      species_id: string;
      extinction_turn: number;
    }
  | {
      type: 'SpeciesExtinctChoice';
      preview: ExtinctPreview;
    };

export interface DSLActionTurn {
  actions: DSLAction[];
}

// Tree visualization types
export type TreeNode = 
  | { type: 'species'; data: Species }
  | { type: 'extinct'; data: Species }  
  | { type: 'createPreview'; data: CreatePreview }
  | { type: 'extinctPreview'; data: Species & { preview_extinction_turn: number } };

export interface TreeViewProps {
  nodes: TreeNode[];
  onAcceptCreate: (previewId: string) => void;
  onRejectCreate: (previewId: string) => void;
  onAcceptExtinct: (speciesId: string) => void;
  onRejectExtinct: (speciesId: string) => void;
}

export interface GameControlsProps {
  currentTurn: number;
  isProcessing: boolean;
  onNextTurn: () => void;
}

// Validation types
export interface ValidationError {
  path: string;
  message: string;
  value?: unknown;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  feedback?: string;  // Human-readable feedback for LLM
}