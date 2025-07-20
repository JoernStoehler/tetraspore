import { useMemo } from 'react';
import type { TreeNode } from './types';
import { useGameState } from '../../store/store';

/**
 * Hook that provides TreeOfLife data from game state.
 * Transforms the game state species into a leveled tree structure.
 */
export function useTreeData(): TreeNode[] {
  const gameState = useGameState();
  
  return useMemo(() => {
    const nodes: TreeNode[] = [];
    const { species, turn: currentTurn } = gameState;
    
    // If no species yet, return empty array
    if (species.length === 0) {
      return nodes;
    }
    
    // Check if we need a primordial root (if any species has no parent)
    const hasRootSpecies = species.some(s => s.parentId === null);
    if (hasRootSpecies) {
      // Add primordial life as the common ancestor at turn 0
      nodes.push({
        id: 'primordial-0',
        name: 'Primordial Life',
        parentId: null,
        turn: 0,
        nodeType: 'birth',
        speciesId: 'primordial'
      });
    }
    
    // For each species, create nodes for each turn it existed
    species.forEach(sp => {
      const endTurn = sp.extinctionTurn ?? currentTurn;
      
      // Create nodes for each turn the species existed
      for (let turn = sp.birthTurn; turn <= endTurn; turn++) {
        // Determine node type
        let nodeType: 'birth' | 'alive' | 'extinction';
        if (turn === sp.birthTurn) {
          nodeType = 'birth';
        } else if (sp.extinctionTurn && turn === sp.extinctionTurn) {
          nodeType = 'extinction';
        } else {
          nodeType = 'alive';
        }
        
        // Determine parent ID
        let parentId: string | null;
        if (turn === sp.birthTurn) {
          // Birth turn: connect to parent species at previous turn
          if (sp.parentId) {
            parentId = `${sp.parentId}-${turn - 1}`;
          } else {
            // No parent means this is a root species, connect to primordial if it exists
            parentId = hasRootSpecies ? 'primordial-0' : null;
          }
        } else {
          // Continuation: connect to same species at previous turn
          parentId = `${sp.id}-${turn - 1}`;
        }
        
        nodes.push({
          id: `${sp.id}-${turn}`,
          name: sp.name,
          parentId,
          turn,
          nodeType,
          speciesId: sp.id
        });
      }
    });
    
    return nodes;
  }, [gameState]);
}