import { describe, test, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTreeData } from './hooks';
import type { TreeNode } from './types';

describe('useTreeData Hook', () => {
  test('should return a non-empty array of TreeNode objects', () => {
    const { result } = renderHook(() => useTreeData());
    
    expect(result.current).toBeInstanceOf(Array);
    expect(result.current.length).toBeGreaterThan(0);
    expect(result.current.every(node => 
      typeof node === 'object' &&
      typeof node.id === 'string' &&
      typeof node.name === 'string' &&
      typeof node.turn === 'number' &&
      typeof node.speciesId === 'string' &&
      ['birth', 'alive', 'extinction'].includes(node.nodeType)
    )).toBe(true);
  });

  test('should return memoized data (same reference across renders)', () => {
    const { result, rerender } = renderHook(() => useTreeData());
    const firstResult = result.current;
    
    rerender();
    
    expect(result.current).toBe(firstResult);
  });

  test('should have proper turn progression (1 to 6)', () => {
    const { result } = renderHook(() => useTreeData());
    const nodes = result.current;
    
    const turns = [...new Set(nodes.map(node => node.turn))].sort();
    expect(turns).toEqual([1, 2, 3, 4, 5, 6]);
  });

  test('should ensure every species has nodes for all turns it exists', () => {
    const { result } = renderHook(() => useTreeData());
    const nodes = result.current;
    
    // Group nodes by species
    const speciesNodes = nodes.reduce((acc, node) => {
      if (!acc[node.speciesId]) acc[node.speciesId] = [];
      acc[node.speciesId].push(node);
      return acc;
    }, {} as Record<string, TreeNode[]>);

    // For each species, check that turns are consecutive
    Object.entries(speciesNodes).forEach(([, speciesNodes]) => {
      const turns = speciesNodes.map(n => n.turn).sort((a, b) => a - b);
      
      // Check that turns are consecutive (no gaps)
      for (let i = 1; i < turns.length; i++) {
        expect(turns[i]).toBe(turns[i-1] + 1);
      }
    });
  });

  test('should have valid parent-child relationships', () => {
    const { result } = renderHook(() => useTreeData());
    const nodes = result.current;
    
    // Every non-root node should have a valid parent
    const hasValidParentRefs = nodes.every(node => 
      node.parentId === null || 
      nodes.some(n => n.id === node.parentId)
    );
    
    expect(hasValidParentRefs).toBe(true);
  });

  test('should ensure parent references point to previous turn', () => {
    const { result } = renderHook(() => useTreeData());
    const nodes = result.current;
    
    const hasLeveledStructure = nodes.every(node => {
      if (node.parentId === null) return true;
      const parent = nodes.find(n => n.id === node.parentId);
      return parent ? node.turn === parent.turn + 1 : false;
    });
    
    expect(hasLeveledStructure).toBe(true);
  });

  test('should have no skip-turn connections', () => {
    const { result } = renderHook(() => useTreeData());
    const nodes = result.current;
    
    // Check that no child is more than 1 turn ahead of its parent
    const noSkipTurns = nodes.every(node => {
      if (node.parentId === null) return true;
      const parent = nodes.find(n => n.id === node.parentId);
      return parent ? (node.turn - parent.turn) === 1 : false;
    });
    
    expect(noSkipTurns).toBe(true);
  });

  test('should have proper node types for lifecycle', () => {
    const { result } = renderHook(() => useTreeData());
    const nodes = result.current;
    
    // Group nodes by species
    const speciesNodes = nodes.reduce((acc, node) => {
      if (!acc[node.speciesId]) acc[node.speciesId] = [];
      acc[node.speciesId].push(node);
      return acc;
    }, {} as Record<string, TreeNode[]>);

    Object.entries(speciesNodes).forEach(([, speciesNodes]) => {
      const sortedNodes = speciesNodes.sort((a, b) => a.turn - b.turn);
      
      // First node should be 'birth'
      expect(sortedNodes[0].nodeType).toBe('birth');
      
      // Last node should be 'extinction', 'alive', or 'birth' (for single-turn species)
      const lastNode = sortedNodes[sortedNodes.length - 1];
      expect(['alive', 'extinction', 'birth']).toContain(lastNode.nodeType);
      
      // Middle nodes should be 'alive' (unless it's a single-turn species)
      if (sortedNodes.length > 2) {
        for (let i = 1; i < sortedNodes.length - 1; i++) {
          expect(sortedNodes[i].nodeType).toBe('alive');
        }
      }
    });
  });

  test('should have unique node IDs', () => {
    const { result } = renderHook(() => useTreeData());
    const nodes = result.current;
    
    const ids = nodes.map(node => node.id);
    const uniqueIds = new Set(ids);
    
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('should include expected species', () => {
    const { result } = renderHook(() => useTreeData());
    const nodes = result.current;
    
    const speciesIds = new Set(nodes.map(node => node.speciesId));
    
    // Check that we have the expected species from our hardcoded data
    expect(speciesIds).toContain('aquaticus');
    expect(speciesIds).toContain('terrestris');
    expect(speciesIds).toContain('deepdiver');
    expect(speciesIds).toContain('climber');
    expect(speciesIds).toContain('abyssal');
  });

  test('should demonstrate evolution branching', () => {
    const { result } = renderHook(() => useTreeData());
    const nodes = result.current;
    
    // Find cases where multiple children have the same parent
    const parentChildMap = nodes.reduce((acc, node) => {
      if (node.parentId) {
        if (!acc[node.parentId]) acc[node.parentId] = [];
        acc[node.parentId].push(node);
      }
      return acc;
    }, {} as Record<string, TreeNode[]>);
    
    // Should have at least one parent with multiple children (branching)
    const hasBranching = Object.values(parentChildMap).some(children => children.length > 1);
    expect(hasBranching).toBe(true);
  });

  test('should demonstrate extinctions', () => {
    const { result } = renderHook(() => useTreeData());
    const nodes = result.current;
    
    // Should have at least one extinction node
    const hasExtinctions = nodes.some(node => node.nodeType === 'extinction');
    expect(hasExtinctions).toBe(true);
  });
});