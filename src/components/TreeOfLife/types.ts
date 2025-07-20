/**
 * Represents a single node in the Tree of Life visualization.
 * Uses a flat structure where parent-child relationships are represented by IDs.
 * Each node represents a species state at a specific turn.
 */
export interface TreeNode {
  /** Unique identifier for this node */
  id: string;
  
  /** Display name for the node/species */
  name: string;
  
  /** ID of the parent node, null for root nodes. Flat structure, no nested children */
  parentId: string | null;
  
  /** Which turn this node represents */
  turn: number;
  
  /** The lifecycle state of the species at this turn */
  nodeType: 'birth' | 'alive' | 'extinction';
  
  /** Reference to the species this node represents */
  speciesId: string;
}

/**
 * Props for the TreeOfLife visualization component.
 * The component renders a tree structure from a flat array of nodes
 * and computes x,y coordinates internally for positioning.
 */
export interface TreeOfLifeProps {
  /** Flat array containing all nodes. Component determines topology from parent relationships */
  nodes: TreeNode[];
  
  /** Width of the visualization canvas in pixels */
  width: number;
  
  /** Height of the visualization canvas in pixels */
  height: number;
  
  /** Optional callback fired when a user clicks on a node */
  onNodeClick?: (node: TreeNode) => void;
}

// Note: Component computes x,y coordinates internally
// Note: Leveled tree - one node per species per turn