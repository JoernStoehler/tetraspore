import { useMemo } from 'react';
import type { TreeNode } from './types';

/**
 * Hook that provides TreeOfLife data from game state.
 * Currently returns hardcoded evolution data - will be connected to store in Task 2.5.
 */
export function useTreeData(): TreeNode[] {
  return useMemo(() => {
    // TODO: Connect to actual game state in Task 2.5
    // For now, return realistic hardcoded evolution data
    
    const nodes: TreeNode[] = [];
    
    // Turn 0: Common ancestor (root)
    nodes.push({
      id: 'primordial-0',
      name: 'Primordial Life',
      parentId: null,
      turn: 0,
      nodeType: 'birth',
      speciesId: 'primordial'
    });
    
    // Turn 1: Initial species emergence from common ancestor
    nodes.push({
      id: 'aquaticus-1',
      name: 'Aquaticus',
      parentId: 'primordial-0',
      turn: 1,
      nodeType: 'birth',
      speciesId: 'aquaticus'
    });
    
    nodes.push({
      id: 'terrestris-1', 
      name: 'Terrestris',
      parentId: 'primordial-0',
      turn: 1,
      nodeType: 'birth',
      speciesId: 'terrestris'
    });
    
    // Turn 2: Both species continue
    nodes.push({
      id: 'aquaticus-2',
      name: 'Aquaticus',
      parentId: 'aquaticus-1',
      turn: 2,
      nodeType: 'alive',
      speciesId: 'aquaticus'
    });
    
    nodes.push({
      id: 'terrestris-2',
      name: 'Terrestris', 
      parentId: 'terrestris-1',
      turn: 2,
      nodeType: 'alive',
      speciesId: 'terrestris'
    });
    
    // Turn 3: First branching - Aquaticus evolves subspecies
    nodes.push({
      id: 'aquaticus-3',
      name: 'Aquaticus',
      parentId: 'aquaticus-2',
      turn: 3,
      nodeType: 'alive',
      speciesId: 'aquaticus'
    });
    
    nodes.push({
      id: 'deepdiver-3',
      name: 'Deepdiver',
      parentId: 'aquaticus-2',
      turn: 3,
      nodeType: 'birth',
      speciesId: 'deepdiver'
    });
    
    nodes.push({
      id: 'terrestris-3',
      name: 'Terrestris',
      parentId: 'terrestris-2', 
      turn: 3,
      nodeType: 'alive',
      speciesId: 'terrestris'
    });
    
    // Turn 4: More evolution - Terrestris branches, Aquaticus continues
    nodes.push({
      id: 'aquaticus-4',
      name: 'Aquaticus',
      parentId: 'aquaticus-3',
      turn: 4,
      nodeType: 'alive',
      speciesId: 'aquaticus'
    });
    
    nodes.push({
      id: 'deepdiver-4',
      name: 'Deepdiver',
      parentId: 'deepdiver-3',
      turn: 4,
      nodeType: 'alive',
      speciesId: 'deepdiver'
    });
    
    nodes.push({
      id: 'terrestris-4',
      name: 'Terrestris',
      parentId: 'terrestris-3',
      turn: 4,
      nodeType: 'alive',
      speciesId: 'terrestris'
    });
    
    nodes.push({
      id: 'climber-4',
      name: 'Climber',
      parentId: 'terrestris-3',
      turn: 4,
      nodeType: 'birth',
      speciesId: 'climber'
    });
    
    // Turn 5: First extinction - Aquaticus goes extinct, others continue
    nodes.push({
      id: 'aquaticus-5',
      name: 'Aquaticus',
      parentId: 'aquaticus-4',
      turn: 5,
      nodeType: 'extinction',
      speciesId: 'aquaticus'
    });
    
    nodes.push({
      id: 'deepdiver-5',
      name: 'Deepdiver',
      parentId: 'deepdiver-4',
      turn: 5,
      nodeType: 'alive',
      speciesId: 'deepdiver'
    });
    
    nodes.push({
      id: 'terrestris-5',
      name: 'Terrestris',
      parentId: 'terrestris-4',
      turn: 5,
      nodeType: 'alive',
      speciesId: 'terrestris'
    });
    
    nodes.push({
      id: 'climber-5',
      name: 'Climber',
      parentId: 'climber-4',
      turn: 5,
      nodeType: 'alive',
      speciesId: 'climber'
    });
    
    // Turn 6: New species emerges from Deepdiver
    nodes.push({
      id: 'deepdiver-6',
      name: 'Deepdiver',
      parentId: 'deepdiver-5',
      turn: 6,
      nodeType: 'alive',
      speciesId: 'deepdiver'
    });
    
    nodes.push({
      id: 'abyssal-6',
      name: 'Abyssal',
      parentId: 'deepdiver-5',
      turn: 6,
      nodeType: 'birth',
      speciesId: 'abyssal'
    });
    
    nodes.push({
      id: 'terrestris-6',
      name: 'Terrestris',
      parentId: 'terrestris-5',
      turn: 6,
      nodeType: 'extinction',
      speciesId: 'terrestris'
    });
    
    nodes.push({
      id: 'climber-6',
      name: 'Climber',
      parentId: 'climber-5',
      turn: 6,
      nodeType: 'alive',
      speciesId: 'climber'
    });
    
    return nodes;
  }, []);
}