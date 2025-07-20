export interface Species {
  id: string;
  name: string;
  description: string;
  parent?: string;
  creation_turn: number;
  extinction_turn?: number;
}

export interface CreatePreview {
  id: string;
  name: string;
  description: string;
  parent_id: string;
  creation_turn: number;
}

export interface ExtinctPreview {
  species_id: string;
  extinction_turn: number;
}

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

export interface TreeNodeLayout {
  id: string;
  x: number;
  y: number;
  data: TreeNode;
  parent?: TreeNodeLayout;
  children?: TreeNodeLayout[];
}