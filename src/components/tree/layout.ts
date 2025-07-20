import * as d3 from 'd3';
import { TreeNode, TreeNodeLayout } from './types';
import { TREE_DIMENSIONS } from './styles';

interface HierarchyNode {
  id: string;
  data: TreeNode;
  children?: HierarchyNode[];
  parent?: HierarchyNode;
}

function getNodeId(node: TreeNode): string {
  if (node.type === 'createPreview') {
    return node.data.id;
  }
  return node.data.id;
}

function getParentId(node: TreeNode): string | undefined {
  if (node.type === 'createPreview') {
    return node.data.parent_id;
  }
  return node.data.parent;
}

function getTurnNumber(node: TreeNode): number {
  if (node.type === 'extinctPreview') {
    return node.data.preview_extinction_turn;
  }
  return node.data.creation_turn;
}

export function buildHierarchy(nodes: TreeNode[]): HierarchyNode[] {
  const nodeMap = new Map<string, HierarchyNode>();
  const roots: HierarchyNode[] = [];
  
  // First pass: create all nodes
  nodes.forEach(node => {
    const id = getNodeId(node);
    nodeMap.set(id, {
      id,
      data: node,
      children: []
    });
  });
  
  // Second pass: establish parent-child relationships
  nodes.forEach(node => {
    const id = getNodeId(node);
    const parentId = getParentId(node);
    const currentNode = nodeMap.get(id)!;
    
    if (parentId && nodeMap.has(parentId)) {
      const parentNode = nodeMap.get(parentId)!;
      parentNode.children = parentNode.children || [];
      parentNode.children.push(currentNode);
      currentNode.parent = parentNode;
    } else {
      roots.push(currentNode);
    }
  });
  
  return roots;
}

export function calculateTreeLayout(nodes: TreeNode[]): TreeNodeLayout[] {
  if (nodes.length === 0) return [];
  
  const roots = buildHierarchy(nodes);
  const layouts: TreeNodeLayout[] = [];
  
  // Process each root tree separately
  roots.forEach((root, rootIndex) => {
    // Create D3 hierarchy
    const hierarchy = d3.hierarchy(root);
    
    // Create tree layout
    const treeLayout = d3.tree<HierarchyNode>()
      .nodeSize([TREE_DIMENSIONS.horizontalSpacing, TREE_DIMENSIONS.verticalSpacing]);
    
    // Apply layout
    const tree = treeLayout(hierarchy);
    
    // Extract positions and scale by turn
    tree.each((d: d3.HierarchyPointNode<HierarchyNode>) => {
      const turn = getTurnNumber(d.data.data);
      
      const layout: TreeNodeLayout = {
        id: d.data.id,
        x: d.x + (rootIndex * TREE_DIMENSIONS.horizontalSpacing * 3), // Offset multiple roots
        y: turn * TREE_DIMENSIONS.turnScale, // Y position based on turn
        data: d.data.data,
        children: []
      };
      
      if (d.parent) {
        const parentLayout = layouts.find(l => l.id === d.parent!.data.id);
        if (parentLayout) {
          layout.parent = parentLayout;
          parentLayout.children!.push(layout);
        }
      }
      
      layouts.push(layout);
    });
  });
  
  // Center the tree horizontally
  if (layouts.length > 0) {
    const minX = Math.min(...layouts.map(l => l.x));
    const maxX = Math.max(...layouts.map(l => l.x));
    const centerOffset = -(minX + maxX) / 2;
    
    layouts.forEach(layout => {
      layout.x += centerOffset;
    });
  }
  
  return layouts;
}

export function generatePath(parent: TreeNodeLayout, child: TreeNodeLayout): string {
  const startX = parent.x;
  const startY = parent.y + TREE_DIMENSIONS.nodeHeight / 2;
  const endX = child.x;
  const endY = child.y - TREE_DIMENSIONS.nodeHeight / 2;
  
  // Create a smooth cubic bezier curve
  const midY = (startY + endY) / 2;
  
  return `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
}