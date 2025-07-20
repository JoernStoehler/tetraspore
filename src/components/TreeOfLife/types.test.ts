import { describe, test, expect } from 'vitest';
import { TreeNode, TreeOfLifeProps } from './types';

describe('TreeOfLife Types', () => {
  describe('TreeNode interface', () => {
    test('should accept valid TreeNode objects', () => {
      const validNode: TreeNode = {
        id: 'node1',
        name: 'Species Alpha',
        parentId: null,
        turn: 1,
        nodeType: 'birth',
        speciesId: 'species1'
      };

      expect(validNode.id).toBe('node1');
      expect(validNode.name).toBe('Species Alpha');
      expect(validNode.parentId).toBeNull();
      expect(validNode.turn).toBe(1);
      expect(validNode.nodeType).toBe('birth');
      expect(validNode.speciesId).toBe('species1');
    });

    test('should accept all valid nodeType values', () => {
      const birthNode: TreeNode = {
        id: 'b1',
        name: 'Birth Node',
        parentId: null,
        turn: 1,
        nodeType: 'birth',
        speciesId: 's1'
      };

      const aliveNode: TreeNode = {
        id: 'a1',
        name: 'Alive Node',
        parentId: 'b1',
        turn: 2,
        nodeType: 'alive',
        speciesId: 's1'
      };

      const extinctionNode: TreeNode = {
        id: 'e1',
        name: 'Extinction Node',
        parentId: 'a1',
        turn: 3,
        nodeType: 'extinction',
        speciesId: 's1'
      };

      expect(birthNode.nodeType).toBe('birth');
      expect(aliveNode.nodeType).toBe('alive');
      expect(extinctionNode.nodeType).toBe('extinction');
    });

    test('should handle parentId being string or null', () => {
      const rootNode: TreeNode = {
        id: 'root',
        name: 'Root Species',
        parentId: null,
        turn: 1,
        nodeType: 'birth',
        speciesId: 'root-species'
      };

      const childNode: TreeNode = {
        id: 'child',
        name: 'Child Species',
        parentId: 'root',
        turn: 2,
        nodeType: 'birth',
        speciesId: 'child-species'
      };

      expect(rootNode.parentId).toBeNull();
      expect(childNode.parentId).toBe('root');
    });
  });

  describe('TreeOfLifeProps interface', () => {
    test('should accept valid TreeOfLifeProps objects', () => {
      const nodes: TreeNode[] = [
        {
          id: 'n1',
          name: 'Node 1',
          parentId: null,
          turn: 1,
          nodeType: 'birth',
          speciesId: 's1'
        }
      ];

      const validProps: TreeOfLifeProps = {
        nodes,
        width: 800,
        height: 600
      };

      expect(validProps.nodes).toEqual(nodes);
      expect(validProps.width).toBe(800);
      expect(validProps.height).toBe(600);
      expect(validProps.onNodeClick).toBeUndefined();
    });

    test('should accept optional onNodeClick callback', () => {
      const nodes: TreeNode[] = [];
      const mockCallback = (node: TreeNode) => {
        console.log('Node clicked:', node.id);
      };

      const propsWithCallback: TreeOfLifeProps = {
        nodes,
        width: 400,
        height: 300,
        onNodeClick: mockCallback
      };

      expect(propsWithCallback.onNodeClick).toBe(mockCallback);
    });

    test('should accept empty nodes array', () => {
      const emptyProps: TreeOfLifeProps = {
        nodes: [],
        width: 100,
        height: 100
      };

      expect(emptyProps.nodes).toEqual([]);
    });
  });

  describe('Tree structure validation', () => {
    test('should validate no cycles in parent-child relationships', () => {
      const nodes: TreeNode[] = [
        {
          id: 'a',
          name: 'Node A',
          parentId: null,
          turn: 1,
          nodeType: 'birth',
          speciesId: 'sa'
        },
        {
          id: 'b',
          name: 'Node B',
          parentId: 'a',
          turn: 2,
          nodeType: 'birth',
          speciesId: 'sb'
        },
        {
          id: 'c',
          name: 'Node C',
          parentId: 'b',
          turn: 3,
          nodeType: 'birth',
          speciesId: 'sc'
        }
      ];

      const hasCycle = (nodes: TreeNode[]): boolean => {
        const visited = new Set<string>();
        const recursionStack = new Set<string>();

        const dfs = (nodeId: string): boolean => {
          if (recursionStack.has(nodeId)) return true; // Cycle detected
          if (visited.has(nodeId)) return false;

          visited.add(nodeId);
          recursionStack.add(nodeId);

          const node = nodes.find(n => n.id === nodeId);
          if (node?.parentId && nodes.find(n => n.id === node.parentId)) {
            if (dfs(node.parentId)) return true;
          }

          recursionStack.delete(nodeId);
          return false;
        };

        for (const node of nodes) {
          if (!visited.has(node.id) && dfs(node.id)) {
            return true;
          }
        }
        return false;
      };

      expect(hasCycle(nodes)).toBe(false);
    });

    test('should validate parent references exist', () => {
      const nodes: TreeNode[] = [
        {
          id: 'child',
          name: 'Child Node',
          parentId: 'nonexistent',
          turn: 2,
          nodeType: 'birth',
          speciesId: 'sc'
        }
      ];

      const hasValidParentRefs = (nodes: TreeNode[]): boolean => {
        return nodes.every(node => 
          node.parentId === null || 
          nodes.some(n => n.id === node.parentId)
        );
      };

      expect(hasValidParentRefs(nodes)).toBe(false);

      const validNodes: TreeNode[] = [
        {
          id: 'parent',
          name: 'Parent Node',
          parentId: null,
          turn: 1,
          nodeType: 'birth',
          speciesId: 'sp'
        },
        {
          id: 'child',
          name: 'Child Node',
          parentId: 'parent',
          turn: 2,
          nodeType: 'birth',
          speciesId: 'sc'
        }
      ];

      expect(hasValidParentRefs(validNodes)).toBe(true);
    });

    test('should validate turn numbers are positive integers', () => {
      const validNode: TreeNode = {
        id: 'n1',
        name: 'Valid Turn',
        parentId: null,
        turn: 1,
        nodeType: 'birth',
        speciesId: 's1'
      };

      const hasValidTurns = (nodes: TreeNode[]): boolean => {
        return nodes.every(node => 
          Number.isInteger(node.turn) && node.turn > 0
        );
      };

      expect(hasValidTurns([validNode])).toBe(true);
    });

    test('should validate leveled structure (no skip-turn connections)', () => {
      const validLeveledNodes: TreeNode[] = [
        {
          id: 'root',
          name: 'Root',
          parentId: null,
          turn: 1,
          nodeType: 'birth',
          speciesId: 'sr'
        },
        {
          id: 'child1',
          name: 'Child 1',
          parentId: 'root',
          turn: 2,
          nodeType: 'birth',
          speciesId: 'sc1'
        },
        {
          id: 'grandchild',
          name: 'Grandchild',
          parentId: 'child1',
          turn: 3,
          nodeType: 'birth',
          speciesId: 'sgc'
        }
      ];

      const invalidSkipTurnNodes: TreeNode[] = [
        {
          id: 'root',
          name: 'Root',
          parentId: null,
          turn: 1,
          nodeType: 'birth',
          speciesId: 'sr'
        },
        {
          id: 'skip',
          name: 'Skip Turn',
          parentId: 'root',
          turn: 3, // Skips turn 2
          nodeType: 'birth',
          speciesId: 'ss'
        }
      ];

      const hasLeveledStructure = (nodes: TreeNode[]): boolean => {
        return nodes.every(node => {
          if (node.parentId === null) return true;
          const parent = nodes.find(n => n.id === node.parentId);
          return parent ? node.turn === parent.turn + 1 : false;
        });
      };

      expect(hasLeveledStructure(validLeveledNodes)).toBe(true);
      expect(hasLeveledStructure(invalidSkipTurnNodes)).toBe(false);
    });
  });
});