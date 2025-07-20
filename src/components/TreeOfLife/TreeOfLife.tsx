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
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>();
  
  // Compute layout
  const { layoutNodes, edges } = computeTreeLayout(nodes, width, height);
  
  // Setup zoom/pan behavior
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;
    
    // Skip zoom behavior in test environment to avoid jsdom issues
    if (typeof window !== 'undefined' && !svgRef.current.createSVGPoint) {
      return;
    }
    
    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);
    
    // Calculate bounds for the content
    const bounds = layoutNodes.reduce((acc, node) => ({
      minX: Math.min(acc.minX, node.x - 50),
      maxX: Math.max(acc.maxX, node.x + 50),
      minY: Math.min(acc.minY, node.y - 50),
      maxY: Math.max(acc.maxY, node.y + 50)
    }), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });
    
    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    
    // Create zoom behavior with constraints
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .translateExtent([
        [bounds.minX - width, bounds.minY - height],
        [bounds.maxX + width, bounds.maxY + height]
      ])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });
    
    zoomRef.current = zoom;
    
    // Apply zoom behavior to svg
    svg.call(zoom);
    
    // Initial fit to view
    const scale = Math.min(width / contentWidth, height / contentHeight) * 0.8;
    const initialTransform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(scale)
      .translate(-centerX, -centerY);
    
    svg.call(zoom.transform, initialTransform);
    
    // Cleanup
    return () => {
      svg.on('.zoom', null);
    };
  }, [layoutNodes, width, height]);
  
  const handleNodeClick = (node: TreeNode) => {
    if (onNodeClick) {
      // Pass only the original TreeNode properties, not the layout extensions
      const { id, name, parentId, turn, nodeType, speciesId } = node;
      onNodeClick({ id, name, parentId, turn, nodeType, speciesId });
    }
  };
  
  const resetView = () => {
    if (!svgRef.current || !zoomRef.current || layoutNodes.length === 0) return;
    
    // Skip in test environment
    if (typeof window !== 'undefined' && !svgRef.current.createSVGPoint) {
      return;
    }
    
    const svg = d3.select(svgRef.current);
    
    // Calculate bounds for the content
    const bounds = layoutNodes.reduce((acc, node) => ({
      minX: Math.min(acc.minX, node.x - 50),
      maxX: Math.max(acc.maxX, node.x + 50),
      minY: Math.min(acc.minY, node.y - 50),
      maxY: Math.max(acc.maxY, node.y + 50)
    }), { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });
    
    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;
    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    
    // Reset to fit view
    const scale = Math.min(width / contentWidth, height / contentHeight) * 0.8;
    const resetTransform = d3.zoomIdentity
      .translate(width / 2, height / 2)
      .scale(scale)
      .translate(-centerX, -centerY);
    
    svg.transition()
      .duration(750)
      .call(zoomRef.current.transform, resetTransform);
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
        {/* Define gradients for visual polish */}
        <defs>
          {/* Birth node gradients */}
          <radialGradient id="gradient-birth">
            <stop offset="0%" stopColor="#66BB6A" />
            <stop offset="100%" stopColor="#4CAF50" />
          </radialGradient>
          <radialGradient id="gradient-birth-hover">
            <stop offset="0%" stopColor="#81C784" />
            <stop offset="100%" stopColor="#66BB6A" />
          </radialGradient>
          
          {/* Alive node gradients */}
          <radialGradient id="gradient-alive">
            <stop offset="0%" stopColor="#42A5F5" />
            <stop offset="100%" stopColor="#2196F3" />
          </radialGradient>
          <radialGradient id="gradient-alive-hover">
            <stop offset="0%" stopColor="#64B5F6" />
            <stop offset="100%" stopColor="#42A5F5" />
          </radialGradient>
          
          {/* Extinction node gradients */}
          <radialGradient id="gradient-extinction">
            <stop offset="0%" stopColor="#EF5350" />
            <stop offset="100%" stopColor="#F44336" />
          </radialGradient>
          <radialGradient id="gradient-extinction-hover">
            <stop offset="0%" stopColor="#E57373" />
            <stop offset="100%" stopColor="#EF5350" />
          </radialGradient>
          
          {/* Edge gradient */}
          <linearGradient id="gradient-edge" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#90A4AE" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#607D8B" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#455A64" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        
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
                  
                  {/* Node label with background for readability */}
                  <g className="tree-node-label-group">
                    <rect
                      x={-40}
                      y={radius + 10}
                      width="80"
                      height="20"
                      rx="3"
                      fill="rgba(255, 255, 255, 0.8)"
                      stroke="none"
                    />
                    <text
                      y={radius + 24}
                      className="tree-node-label"
                    >
                      {node.name.length > 15 ? node.name.substring(0, 13) + '...' : node.name}
                    </text>
                  </g>
                  
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
        <button onClick={resetView} aria-label="Reset view to fit all nodes">
          Reset View
        </button>
      </div>
    </div>
  );
}

export default TreeOfLife;