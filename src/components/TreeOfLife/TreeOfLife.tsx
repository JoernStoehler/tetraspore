import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { TreeNode, TreeOfLifeProps } from './types';
import { computeTreeLayout, createEdgePath, getNodeRadius, getNodeClass } from './layout';
import './TreeOfLife.css';

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


export function TreeOfLife({ 
  nodes = SAMPLE_TREE_DATA, 
  width, 
  height, 
  onNodeClick 
}: TreeOfLifeProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  
  // Compute layout
  const { layoutNodes, edges } = computeTreeLayout(nodes, width, height);
  
  // Setup zoom/pan behavior
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    
    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);
    
    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });
    
    // Apply zoom behavior to svg
    svg.call(zoom);
    
    // Cleanup
    return () => {
      svg.on('.zoom', null);
    };
  }, []);
  
  const handleNodeClick = (node: TreeNode) => {
    if (onNodeClick) {
      // Pass only the original TreeNode properties, not the layout extensions
      const { id, name, parentId, turn, nodeType, speciesId } = node;
      onNodeClick({ id, name, parentId, turn, nodeType, speciesId });
    }
  };
  
  return (
    <div className="tree-of-life-container">
      <h3>Tree of Life</h3>
      <svg 
        ref={svgRef}
        width={width} 
        height={height} 
        className="tree-of-life-svg"
        role="img"
        aria-label="Tree of Life visualization"
      >
        <g ref={gRef}>
          {/* Render edges first (behind nodes) */}
          <g className="edges">
            {edges.map((edge, index) => (
              <path
                key={`edge-${index}`}
                d={createEdgePath(edge)}
                className="tree-edge"
                fill="none"
              />
            ))}
          </g>
          
          {/* Render nodes */}
          <g className="nodes">
            {layoutNodes.map((node) => {
              const radius = getNodeRadius(node.nodeType);
              const nodeClass = getNodeClass(node.nodeType);
              
              return (
                <g 
                  key={node.id} 
                  className="tree-node-group"
                  transform={`translate(${node.x}, ${node.y})`}
                >
                  {/* Node circle */}
                  <circle
                    r={radius}
                    className={nodeClass}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleNodeClick(node)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleNodeClick(node);
                      }
                    }}
                  >
                    <title>{node.name} - Turn {node.turn}</title>
                  </circle>
                  
                  {/* Node label */}
                  <text
                    y={radius + 20}
                    className="tree-node-label"
                  >
                    {node.name}
                  </text>
                  
                  {/* Turn indicator */}
                  <text
                    y={5}
                    className="tree-node-turn"
                  >
                    T{node.turn}
                  </text>
                </g>
              );
            })}
          </g>
        </g>
      </svg>
      <div className="tree-controls">
        <p>Use mouse wheel to zoom, drag to pan</p>
      </div>
    </div>
  );
}

export default TreeOfLife;