import React, { useMemo, useRef, useEffect, useState } from 'react';
import { TreeViewProps } from './types';
import { calculateTreeLayout, generatePath } from './layout';
import { SpeciesNode } from './SpeciesNode';
import { TREE_DIMENSIONS } from './styles';

export const TreeView: React.FC<TreeViewProps> = ({
  nodes,
  onAcceptCreate,
  onRejectCreate,
  onAcceptExtinct,
  onRejectExtinct
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [viewBox, setViewBox] = useState({ x: -500, y: -100, width: 1000, height: 800 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [viewStart, setViewStart] = useState({ x: 0, y: 0 });

  const layouts = useMemo(() => calculateTreeLayout(nodes), [nodes]);

  // Auto-fit content on layout change
  useEffect(() => {
    if (layouts.length === 0) return;

    const padding = 100;
    const minX = Math.min(...layouts.map(l => l.x - TREE_DIMENSIONS.nodeWidth / 2)) - padding;
    const maxX = Math.max(...layouts.map(l => l.x + TREE_DIMENSIONS.nodeWidth / 2)) + padding;
    const minY = Math.min(...layouts.map(l => l.y)) - padding;
    const maxY = Math.max(...layouts.map(l => l.y + TREE_DIMENSIONS.nodeHeight)) + padding;

    const width = maxX - minX;
    const height = maxY - minY;

    setViewBox({
      x: minX,
      y: minY,
      width: Math.max(width, 1000),
      height: Math.max(height, 800)
    });
  }, [layouts]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setViewStart({ x: viewBox.x, y: viewBox.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    
    setViewBox({
      ...viewBox,
      x: viewStart.x - dx * 2,
      y: viewStart.y - dy * 2
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 1.1 : 0.9;
    
    setViewBox({
      x: viewBox.x,
      y: viewBox.y,
      width: viewBox.width * scaleFactor,
      height: viewBox.height * scaleFactor
    });
  };

  const renderConnections = () => {
    return layouts.map(layout => {
      if (!layout.parent) return null;
      
      return (
        <path
          key={`edge-${layout.parent.id}-${layout.id}`}
          d={generatePath(layout.parent, layout)}
          fill="none"
          stroke="#6B7280"
          strokeWidth="2"
          strokeDasharray={
            layout.data.type === 'createPreview' || layout.data.type === 'extinctPreview' 
              ? "5,5" 
              : undefined
          }
        />
      );
    });
  };

  const renderNodes = () => {
    return layouts.map(layout => (
      <foreignObject
        key={layout.id}
        x={layout.x - TREE_DIMENSIONS.nodeWidth / 2}
        y={layout.y}
        width={TREE_DIMENSIONS.nodeWidth}
        height={TREE_DIMENSIONS.nodeHeight}
      >
        <SpeciesNode
          node={layout.data}
          onAcceptCreate={onAcceptCreate}
          onRejectCreate={onRejectCreate}
          onAcceptExtinct={onAcceptExtinct}
          onRejectExtinct={onRejectExtinct}
        />
      </foreignObject>
    ));
  };

  return (
    <div className="w-full h-full relative bg-gray-50 overflow-hidden">
      <svg
        ref={svgRef}
        className="w-full h-full cursor-move"
        viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#E5E7EB" strokeWidth="1"/>
          </pattern>
        </defs>
        
        <rect width="10000" height="10000" x="-5000" y="-5000" fill="url(#grid)" />
        
        <g>
          {renderConnections()}
          {renderNodes()}
        </g>
      </svg>
      
      <div className="absolute top-4 left-4 text-sm text-gray-600 bg-white px-3 py-1 rounded shadow">
        Drag to pan • Scroll to zoom
      </div>
    </div>
  );
};