/**
 * Main renderer for the tapestry visualization
 * Uses Canvas API for performance with many threads
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { TapestryThread, TapestryUIState } from '../types';
import { renderThread, renderConnections } from '../utils/canvasRenderer';

interface TapestryRendererProps {
  threads: TapestryThread[];
  width: number;
  height: number;
  uiState: TapestryUIState;
  onThreadClick: (threadId: string) => void;
  onThreadHover: (threadId: string | null) => void;
}

export const TapestryRenderer: React.FC<TapestryRendererProps> = ({
  threads,
  width,
  height,
  uiState,
  onThreadClick,
  onThreadHover
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  // Initialize offscreen canvas
  useEffect(() => {
    offscreenCanvasRef.current = document.createElement('canvas');
    offscreenCanvasRef.current.width = width;
    offscreenCanvasRef.current.height = height;
  }, [width, height]);
  
  // Main render function
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const offscreen = offscreenCanvasRef.current;
    if (!canvas || !offscreen) return;
    
    const ctx = canvas.getContext('2d');
    const offCtx = offscreen.getContext('2d');
    if (!ctx || !offCtx) return;
    
    // Clear canvases
    ctx.clearRect(0, 0, width, height);
    offCtx.clearRect(0, 0, width, height);
    
    // Apply camera transforms
    offCtx.save();
    offCtx.translate(width / 2, height / 2);
    offCtx.scale(uiState.camera.zoom, uiState.camera.zoom);
    offCtx.translate(
      -width / 2 + uiState.camera.centerX,
      -height / 2 + uiState.camera.centerY
    );
    
    // Apply visual style
    applyVisualStyle(offCtx, uiState);
    
    // Sort threads by depth
    const sortedThreads = [...threads].sort((a, b) => {
      const aDepth = a.path[0]?.z || 0;
      const bDepth = b.path[0]?.z || 0;
      return aDepth - bDepth;
    });
    
    // Render connections first
    if (uiState.layers.showRelationships) {
      for (const thread of sortedThreads) {
        renderConnections(offCtx, thread, threads, uiState);
      }
    }
    
    // Render threads
    for (const thread of sortedThreads) {
      if (thread.isVisible) {
        renderThread(offCtx, thread, uiState);
      }
    }
    
    offCtx.restore();
    
    // Apply post-processing effects
    if (uiState.visuals.motionBlur) {
      ctx.globalAlpha = 0.9;
      ctx.drawImage(canvas, 0, 0);
      ctx.globalAlpha = 1;
    }
    
    // Copy to main canvas
    ctx.drawImage(offscreen, 0, 0);
    
    // Schedule next frame
    animationFrameRef.current = requestAnimationFrame(render);
  }, [threads, width, height, uiState]);
  
  // Start render loop
  useEffect(() => {
    render();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [render]);
  
  // Handle mouse interactions
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (width / rect.width);
    const y = (e.clientY - rect.top) * (height / rect.height);
    
    // Transform to world coordinates
    const worldX = (x - width / 2) / uiState.camera.zoom + width / 2 - uiState.camera.centerX;
    const worldY = (y - height / 2) / uiState.camera.zoom + height / 2 - uiState.camera.centerY;
    
    // Find hovered thread
    let hoveredId: string | null = null;
    for (const thread of threads) {
      if (isPointNearThread(worldX, worldY, thread)) {
        hoveredId = thread.id;
        break;
      }
    }
    
    onThreadHover(hoveredId);
  }, [threads, width, height, uiState.camera, onThreadHover]);
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (width / rect.width);
    const y = (e.clientY - rect.top) * (height / rect.height);
    
    // Transform to world coordinates
    const worldX = (x - width / 2) / uiState.camera.zoom + width / 2 - uiState.camera.centerX;
    const worldY = (y - height / 2) / uiState.camera.zoom + height / 2 - uiState.camera.centerY;
    
    // Find clicked thread
    for (const thread of threads) {
      if (isPointNearThread(worldX, worldY, thread)) {
        onThreadClick(thread.id);
        break;
      }
    }
  }, [threads, width, height, uiState.camera, onThreadClick]);
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="tapestry-canvas"
      onMouseMove={handleMouseMove}
      onClick={handleClick}
      style={{ cursor: 'crosshair' }}
    />
  );
};

function applyVisualStyle(ctx: CanvasRenderingContext2D, uiState: TapestryUIState) {
  // Set composite operation for glow effects
  if (uiState.visuals.glowIntensity > 0) {
    ctx.globalCompositeOperation = 'screen';
  }
  
  // Apply quality settings
  if (uiState.performance.quality === 'low') {
    ctx.imageSmoothingEnabled = false;
  } else {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = uiState.performance.quality === 'ultra' ? 'high' : 'medium';
  }
}

function isPointNearThread(x: number, y: number, thread: TapestryThread): boolean {
  const threshold = 20; // pixels
  
  for (const segment of thread.path) {
    const dx = x - segment.x;
    const dy = y - segment.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < threshold + segment.thickness) {
      return true;
    }
  }
  
  return false;
}