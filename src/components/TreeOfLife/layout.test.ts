import { describe, it, expect } from 'vitest';
import { 
  createHierarchy, 
  computeTreeLayout, 
  createEdgePath, 
  getNodeRadius, 
  getNodeClass
} from './layout';
import { TreeNode } from './types';

describe('TreeOfLife Layout', () => {
  const sampleNodes: TreeNode[] = [
    {
      id: 'root',
      name: 'Root',
      parentId: null,
      turn: 1,
      nodeType: 'birth',
      speciesId: 'species-1'
    },
    {
      id: 'child1',
      name: 'Child 1',
      parentId: 'root',
      turn: 2,
      nodeType: 'alive',
      speciesId: 'species-2'
    },
    {
      id: 'child2',
      name: 'Child 2',
      parentId: 'root',
      turn: 2,
      nodeType: 'birth',
      speciesId: 'species-3'
    },
    {
      id: 'grandchild1',
      name: 'Grandchild 1',
      parentId: 'child1',
      turn: 3,
      nodeType: 'extinction',
      speciesId: 'species-4'
    }
  ];

  describe('createHierarchy', () => {
    it('should create a hierarchy from flat nodes', () => {
      const hierarchy = createHierarchy(sampleNodes);
      
      expect(hierarchy.data.id).toBe('root');
      expect(hierarchy.children).toBeDefined();
      expect(hierarchy.children?.length).toBe(2);
    });

    it('should throw error if no root node exists', () => {
      const noRootNodes: TreeNode[] = [
        {
          id: 'node1',
          name: 'Node 1',
          parentId: 'missing',
          turn: 1,
          nodeType: 'birth',
          speciesId: 'species-1'
        }
      ];
      
      expect(() => createHierarchy(noRootNodes)).toThrow('No root node found');
    });
  });

  describe('computeTreeLayout', () => {
    it('should compute layout with x,y coordinates', () => {
      const { layoutNodes, edges } = computeTreeLayout(sampleNodes, 800, 600);
      
      expect(layoutNodes).toHaveLength(4);
      expect(edges).toHaveLength(3);
      
      // Check that all nodes have coordinates
      layoutNodes.forEach(node => {
        expect(node.x).toBeGreaterThan(0);
        expect(node.y).toBeGreaterThan(0);
        expect(node.x).toBeLessThan(800);
        expect(node.y).toBeLessThan(600);
      });
    });

    it('should align nodes by turn (leveled structure)', () => {
      const { layoutNodes } = computeTreeLayout(sampleNodes, 800, 600);
      
      // Group nodes by turn
      const nodesByTurn = new Map<number, typeof layoutNodes>();
      layoutNodes.forEach(node => {
        const turnNodes = nodesByTurn.get(node.turn) || [];
        turnNodes.push(node);
        nodesByTurn.set(node.turn, turnNodes);
      });
      
      // Check that nodes in same turn have same y coordinate
      nodesByTurn.forEach((nodes) => {
        const yCoord = nodes[0].y;
        nodes.forEach(node => {
          expect(node.y).toBe(yCoord);
        });
      });
    });

    it('should handle empty nodes array', () => {
      const { layoutNodes, edges } = computeTreeLayout([], 800, 600);
      
      expect(layoutNodes).toHaveLength(0);
      expect(edges).toHaveLength(0);
    });

    it('should handle single node', () => {
      const singleNode: TreeNode[] = [{
        id: 'single',
        name: 'Single Node',
        parentId: null,
        turn: 1,
        nodeType: 'birth',
        speciesId: 'species-1'
      }];
      
      const { layoutNodes, edges } = computeTreeLayout(singleNode, 800, 600);
      
      expect(layoutNodes).toHaveLength(1);
      expect(edges).toHaveLength(0);
      expect(layoutNodes[0].x).toBeGreaterThan(0);
      expect(layoutNodes[0].y).toBeGreaterThan(0);
    });

    it('should handle deep tree structures', () => {
      const deepTree: TreeNode[] = [];
      
      // Create a deep tree with 10 levels
      for (let i = 0; i < 10; i++) {
        deepTree.push({
          id: `node-${i}`,
          name: `Node ${i}`,
          parentId: i === 0 ? null : `node-${i - 1}`,
          turn: i + 1,
          nodeType: 'alive',
          speciesId: `species-${i}`
        });
      }
      
      const { layoutNodes, edges } = computeTreeLayout(deepTree, 800, 1000);
      
      expect(layoutNodes).toHaveLength(10);
      expect(edges).toHaveLength(9);
      
      // Check that y coordinates increase with turn
      for (let i = 1; i < layoutNodes.length; i++) {
        expect(layoutNodes[i].y).toBeGreaterThan(layoutNodes[i - 1].y);
      }
    });
  });

  describe('createEdgePath', () => {
    it('should create a curved path between nodes', () => {
      const source = { ...sampleNodes[0], x: 100, y: 100, depth: 0, height: 0 };
      const target = { ...sampleNodes[1], x: 200, y: 200, depth: 1, height: 0 };
      
      const path = createEdgePath({ source, target });
      
      expect(path).toContain('M 100,100');
      expect(path).toContain('C');
      expect(path).toContain('200,200');
    });
  });

  describe('getNodeRadius', () => {
    it('should return different radius for each node type', () => {
      expect(getNodeRadius('birth')).toBe(22);
      expect(getNodeRadius('alive')).toBe(20);
      expect(getNodeRadius('extinction')).toBe(18);
    });
  });

  describe('getNodeClass', () => {
    it('should return correct CSS class for each node type', () => {
      expect(getNodeClass('birth')).toBe('tree-node tree-node-birth');
      expect(getNodeClass('alive')).toBe('tree-node tree-node-alive');
      expect(getNodeClass('extinction')).toBe('tree-node tree-node-extinction');
    });
  });
});