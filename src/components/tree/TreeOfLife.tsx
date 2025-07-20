import React, { useState } from 'react';
import { TreeView } from './TreeView';
import { GameControls } from '../GameControls';
import { TreeNode } from './types';

// Mock data for testing
const initialMockNodes: TreeNode[] = [
  {
    type: 'species',
    data: {
      id: 'moss_001',
      name: 'Basic Moss',
      description: 'Simple photosynthetic organism that thrives in moist environments',
      creation_turn: 1
    }
  },
  {
    type: 'species',
    data: {
      id: 'moss_002',
      name: 'Mountain Moss',
      description: 'Hardy variant adapted to high altitudes and cold temperatures',
      parent: 'moss_001',
      creation_turn: 3
    }
  },
  {
    type: 'createPreview',
    data: {
      id: 'preview_001',
      name: 'Arctic Moss',
      description: 'Extremely cold-resistant variant with antifreeze proteins',
      parent_id: 'moss_002',
      creation_turn: 5
    }
  },
  {
    type: 'extinct',
    data: {
      id: 'old_moss',
      name: 'Ancient Moss',
      description: 'Primitive moss that could not adapt to changing conditions',
      creation_turn: 0,
      extinction_turn: 2
    }
  },
  {
    type: 'species',
    data: {
      id: 'moss_003',
      name: 'Desert Moss',
      description: 'Drought-resistant variant with water storage capabilities',
      parent: 'moss_001',
      creation_turn: 4
    }
  },
  {
    type: 'extinctPreview',
    data: {
      id: 'moss_003',
      name: 'Desert Moss',
      description: 'Drought-resistant variant with water storage capabilities',
      parent: 'moss_001',
      creation_turn: 4,
      preview_extinction_turn: 6
    }
  },
  {
    type: 'species',
    data: {
      id: 'moss_004',
      name: 'Aquatic Moss',
      description: 'Fully aquatic variant that can photosynthesize underwater',
      parent: 'moss_001',
      creation_turn: 2
    }
  },
  {
    type: 'createPreview',
    data: {
      id: 'preview_002',
      name: 'Deep Sea Moss',
      description: 'Bioluminescent moss adapted to extreme depths',
      parent_id: 'moss_004',
      creation_turn: 5
    }
  }
];

export const TreeOfLife: React.FC = () => {
  const [nodes, setNodes] = useState<TreeNode[]>(initialMockNodes);
  const [currentTurn, setCurrentTurn] = useState(5);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAcceptCreate = (previewId: string) => {
    console.log('Accept create:', previewId);
    setNodes(prevNodes => {
      const preview = prevNodes.find(n => n.type === 'createPreview' && n.data.id === previewId);
      if (!preview || preview.type !== 'createPreview') return prevNodes;
      
      const newSpecies: TreeNode = {
        type: 'species',
        data: {
          id: preview.data.id.replace('preview_', 'moss_'),
          name: preview.data.name,
          description: preview.data.description,
          parent: preview.data.parent_id,
          creation_turn: preview.data.creation_turn
        }
      };
      
      return prevNodes.filter(n => n.data.id !== previewId).concat(newSpecies);
    });
  };

  const handleRejectCreate = (previewId: string) => {
    console.log('Reject create:', previewId);
    setNodes(prevNodes => prevNodes.filter(n => n.data.id !== previewId));
  };

  const handleAcceptExtinct = (speciesId: string) => {
    console.log('Accept extinct:', speciesId);
    setNodes(prevNodes => {
      const preview = prevNodes.find(n => n.type === 'extinctPreview' && n.data.id === speciesId);
      if (!preview || preview.type !== 'extinctPreview') return prevNodes;
      
      return prevNodes.map(n => {
        if (n.data.id === speciesId && n.type === 'species') {
          return {
            type: 'extinct' as const,
            data: {
              ...n.data,
              extinction_turn: preview.data.preview_extinction_turn
            }
          };
        }
        return n;
      }).filter(n => n.type !== 'extinctPreview' || n.data.id !== speciesId);
    });
  };

  const handleRejectExtinct = (speciesId: string) => {
    console.log('Reject extinct:', speciesId);
    setNodes(prevNodes => prevNodes.filter(n => !(n.type === 'extinctPreview' && n.data.id === speciesId)));
  };

  const handleNextTurn = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setCurrentTurn(prev => prev + 1);
      setIsProcessing(false);
      
      // Simulate adding a new preview node
      if (Math.random() > 0.5) {
        const livingSpecies = nodes.filter(n => n.type === 'species');
        if (livingSpecies.length > 0) {
          const randomParent = livingSpecies[Math.floor(Math.random() * livingSpecies.length)];
          const newPreview: TreeNode = {
            type: 'createPreview',
            data: {
              id: `preview_${Date.now()}`,
              name: `New Species ${currentTurn + 1}`,
              description: 'A newly evolved variant',
              parent_id: randomParent.data.id,
              creation_turn: currentTurn + 1
            }
          };
          setNodes(prev => [...prev, newPreview]);
        }
      }
    }, 1000);
  };

  return (
    <div className="w-full h-screen bg-gray-100">
      <TreeView
        nodes={nodes}
        onAcceptCreate={handleAcceptCreate}
        onRejectCreate={handleRejectCreate}
        onAcceptExtinct={handleAcceptExtinct}
        onRejectExtinct={handleRejectExtinct}
      />
      <GameControls
        currentTurn={currentTurn}
        isProcessing={isProcessing}
        onNextTurn={handleNextTurn}
      />
    </div>
  );
};