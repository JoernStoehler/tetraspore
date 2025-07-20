import React from 'react';
import { TreeNode, TreeOfLifeProps } from './types';

// Hardcoded sample tree data for scaffold
const SAMPLE_TREE_DATA: TreeNode[] = [
  {
    id: 'root',
    name: 'Primordial Cell',
    parentId: null,
    turn: 1,
    nodeType: 'birth',
    speciesId: 'species-1'
  },
  {
    id: 'child1',
    name: 'Marine Algae',
    parentId: 'root',
    turn: 2,
    nodeType: 'birth',
    speciesId: 'species-2'
  },
  {
    id: 'child2',
    name: 'Land Fungi',
    parentId: 'root',
    turn: 2,
    nodeType: 'birth',
    speciesId: 'species-3'
  },
  {
    id: 'grandchild1',
    name: 'Complex Multicellular',
    parentId: 'child1',
    turn: 3,
    nodeType: 'birth',
    speciesId: 'species-4'
  }
];

// Simple hardcoded positioning for scaffold - TODO: Replace with D3 tree layout in Task 2.3
const getNodePosition = (node: TreeNode, width: number, height: number) => {
  const centerX = width / 2;
  const levelHeight = height / 4;
  
  // Hardcoded x positions for our sample tree
  switch (node.id) {
    case 'root':
      return { x: centerX, y: levelHeight };
    case 'child1':
      return { x: centerX - 150, y: levelHeight * 2 };
    case 'child2':
      return { x: centerX + 150, y: levelHeight * 2 };
    case 'grandchild1':
      return { x: centerX - 150, y: levelHeight * 3 };
    default:
      return { x: centerX, y: levelHeight * node.turn };
  }
};

export function TreeOfLife({ 
  nodes = SAMPLE_TREE_DATA, 
  width, 
  height, 
  onNodeClick 
}: TreeOfLifeProps) {
  const handleNodeClick = (node: TreeNode) => {
    if (onNodeClick) {
      onNodeClick(node);
    }
  };

  // TODO: Replace with D3.js tree layout in Task 2.3
  // TODO: Add proper styling and animations in Task 2.3
  
  return (
    <div>
      <h3>Tree of Life</h3>
      <svg 
        width={width} 
        height={height} 
        role="img"
        style={{ 
          border: '1px solid #ccc',
          backgroundColor: '#fafafa'
        }}
      >
        {/* TODO: Add connecting lines between parent-child nodes in Task 2.3 */}
        
        {/* Render nodes as simple circles */}
        {nodes.map((node) => {
          const { x, y } = getNodePosition(node, width, height);
          
          return (
            <g key={node.id}>
              {/* Node circle */}
              <circle
                cx={x}
                cy={y}
                r={20}
                fill="#4CAF50"
                stroke="#2E7D32"
                strokeWidth={2}
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                onClick={() => handleNodeClick(node)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleNodeClick(node);
                  }
                }}
              />
              
              {/* Node label */}
              <text
                x={x}
                y={y + 35}
                textAnchor="middle"
                fontSize="12"
                fill="#333"
                style={{ pointerEvents: 'none' }}
              >
                {node.name}
              </text>
              
              {/* Turn indicator */}
              <text
                x={x}
                y={y + 6}
                textAnchor="middle"
                fontSize="10"
                fill="white"
                fontWeight="bold"
                style={{ pointerEvents: 'none' }}
              >
                T{node.turn}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}