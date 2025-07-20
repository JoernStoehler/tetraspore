import * as d3 from 'd3';
import { TreeNode } from './types';

export interface LayoutNode extends TreeNode {
  x: number;
  y: number;
  depth: number;
  height: number;
}

export interface Edge {
  source: LayoutNode;
  target: LayoutNode;
}

/**
 * Converts flat node array to D3 hierarchy structure
 */
export function createHierarchy(nodes: TreeNode[]): d3.HierarchyNode<TreeNode> {
  // Create a map for quick lookup
  const nodeMap = new Map<string, TreeNode>();
  nodes.forEach(node => nodeMap.set(node.id, node));
  
  // Find root nodes (no parent)
  const roots = nodes.filter(node => node.parentId === null);
  
  if (roots.length === 0) {
    throw new Error('No root node found in tree data');
  }
  
  // Build hierarchy using d3.stratify
  const stratify = d3.stratify<TreeNode>()
    .id(d => d.id)
    .parentId(d => d.parentId);
  
  return stratify(nodes);
}

/**
 * Computes tree layout and returns nodes with x,y coordinates
 */
export function computeTreeLayout(
  nodes: TreeNode[], 
  width: number, 
  height: number
): { layoutNodes: LayoutNode[], edges: Edge[] } {
  if (nodes.length === 0) {
    return { layoutNodes: [], edges: [] };
  }
  
  // Create hierarchy
  const root = createHierarchy(nodes);
  
  // Create tree layout
  const treeLayout = d3.tree<TreeNode>()
    .size([width - 100, height - 100]); // Leave margin
  
  // Apply layout
  const tree = treeLayout(root);
  
  // Extract layout nodes with coordinates
  const layoutNodes: LayoutNode[] = [];
  const edges: Edge[] = [];
  
  tree.each((node) => {
    const layoutNode: LayoutNode = {
      ...node.data,
      x: node.x + 50, // Add margin
      y: node.y + 50, // Add margin
      depth: node.depth,
      height: node.height
    };
    layoutNodes.push(layoutNode);
  });
  
  // Create edges
  tree.links().forEach(link => {
    const sourceNode = layoutNodes.find(n => n.id === link.source.data.id);
    const targetNode = layoutNodes.find(n => n.id === link.target.data.id);
    
    if (sourceNode && targetNode) {
      edges.push({
        source: sourceNode,
        target: targetNode
      });
    }
  });
  
  // Ensure nodes are aligned by turn (leveled structure)
  alignNodesByTurn(layoutNodes, height);
  
  return { layoutNodes, edges };
}

/**
 * Aligns nodes horizontally by their turn value for a leveled tree structure
 */
function alignNodesByTurn(nodes: LayoutNode[], height: number): void {
  // Find max turn
  const maxTurn = Math.max(...nodes.map(n => n.turn));
  
  if (maxTurn === 0) return;
  
  // Calculate y position for each turn level
  const levelHeight = (height - 100) / (maxTurn + 1);
  
  // Align nodes by turn
  nodes.forEach(node => {
    node.y = 50 + (node.turn * levelHeight);
  });
}

/**
 * Creates a curved path string for drawing edges between nodes
 */
export function createEdgePath(edge: Edge): string {
  const { source, target } = edge;
  
  // Create a curved path using cubic bezier
  const midY = (source.y + target.y) / 2;
  
  return `M ${source.x},${source.y} 
          C ${source.x},${midY} 
            ${target.x},${midY} 
            ${target.x},${target.y}`;
}

/**
 * Determines node radius based on node type
 */
export function getNodeRadius(nodeType: TreeNode['nodeType']): number {
  switch (nodeType) {
    case 'birth':
      return 22;
    case 'alive':
      return 20;
    case 'extinction':
      return 18;
    default:
      return 20;
  }
}

/**
 * Gets CSS class for node based on type
 */
export function getNodeClass(nodeType: TreeNode['nodeType']): string {
  return `tree-node tree-node-${nodeType}`;
}