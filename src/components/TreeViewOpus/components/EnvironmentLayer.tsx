/**
 * Background environment layer showing habitats and environmental effects
 */

import React, { useRef, useEffect } from 'react';
import { TapestryUIState } from '../types';

interface EnvironmentLayerProps {
  width: number;
  height: number;
  uiState: TapestryUIState;
  currentTurn: number;
}

export const EnvironmentLayer: React.FC<EnvironmentLayerProps> = ({
  width,
  height,
  uiState,
  currentTurn
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Apply background based on visual style
    switch (uiState.visuals.backgroundColor) {
      case 'cosmos':
        renderCosmosBackground(ctx, width, height, currentTurn);
        break;
      case 'ocean':
        renderOceanBackground(ctx, width, height, currentTurn);
        break;
      case 'paper':
        renderPaperBackground(ctx, width, height);
        break;
      case 'dark':
        renderDarkBackground(ctx, width, height);
        break;
      default:
        renderLightBackground(ctx, width, height);
    }
    
    // Render habitat layers if enabled
    if (uiState.layers.showHabitats) {
      renderHabitatLayers(ctx, width, height, uiState);
    }
    
    // Render environmental pressure if enabled
    if (uiState.layers.showPressure) {
      renderEnvironmentalPressure(ctx, width, height, currentTurn);
    }
    
  }, [width, height, uiState, currentTurn]);
  
  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="environment-layer"
      style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
    />
  );
};

function renderCosmosBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  turn: number
) {
  // Deep space gradient
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height)
  );
  gradient.addColorStop(0, '#0a0a2e');
  gradient.addColorStop(0.5, '#161853');
  gradient.addColorStop(1, '#292c6d');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Stars
  ctx.fillStyle = '#ffffff';
  const starCount = 200;
  for (let i = 0; i < starCount; i++) {
    const x = (i * 73 + turn * 0.1) % width;
    const y = (i * 37 + turn * 0.05) % height;
    const size = Math.sin(i + turn * 0.01) * 0.5 + 1;
    const opacity = Math.sin(i * 2 + turn * 0.02) * 0.3 + 0.7;
    
    ctx.globalAlpha = opacity;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Nebula clouds
  ctx.globalAlpha = 0.1;
  for (let i = 0; i < 5; i++) {
    const x = width * (0.2 + i * 0.15);
    const y = height * (0.3 + Math.sin(i + turn * 0.001) * 0.2);
    const radius = 100 + Math.sin(i * 2 + turn * 0.002) * 30;
    
    const nebula = ctx.createRadialGradient(x, y, 0, x, y, radius);
    nebula.addColorStop(0, '#ff6b9d');
    nebula.addColorStop(0.5, '#c44569');
    nebula.addColorStop(1, 'transparent');
    
    ctx.fillStyle = nebula;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  }
  
  ctx.globalAlpha = 1;
}

function renderOceanBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  turn: number
) {
  // Ocean depth gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#0a3d62');
  gradient.addColorStop(0.3, '#0c4b7c');
  gradient.addColorStop(0.6, '#145374');
  gradient.addColorStop(1, '#1e3a5f');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Water caustics
  ctx.globalAlpha = 0.1;
  ctx.strokeStyle = '#3fc1c9';
  
  for (let i = 0; i < 20; i++) {
    const waveY = i * 50 + Math.sin(turn * 0.01 + i) * 20;
    ctx.beginPath();
    ctx.moveTo(0, waveY);
    
    for (let x = 0; x <= width; x += 20) {
      const y = waveY + Math.sin(x * 0.01 + turn * 0.02) * 10;
      ctx.lineTo(x, y);
    }
    
    ctx.stroke();
  }
  
  // Bubbles
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 30; i++) {
    const x = (i * 61) % width;
    const baseY = height - (i * 97 + turn * 2) % height;
    const wobble = Math.sin(turn * 0.1 + i) * 20;
    const size = 2 + Math.sin(i) * 2;
    
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(x + wobble, baseY, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.globalAlpha = 1;
}

function renderPaperBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  // Paper texture
  ctx.fillStyle = '#f5f5dc';
  ctx.fillRect(0, 0, width, height);
  
  // Subtle grain
  ctx.globalAlpha = 0.05;
  for (let i = 0; i < 1000; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const gray = Math.floor(Math.random() * 50);
    ctx.fillStyle = `rgb(${gray}, ${gray}, ${gray})`;
    ctx.fillRect(x, y, 1, 1);
  }
  
  // Paper fibers
  ctx.globalAlpha = 0.1;
  ctx.strokeStyle = '#d4d4aa';
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.stroke();
  }
  
  ctx.globalAlpha = 1;
}

function renderDarkBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height)
  );
  gradient.addColorStop(0, '#1a1a1a');
  gradient.addColorStop(1, '#0a0a0a');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function renderLightBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height)
  );
  gradient.addColorStop(0, '#ffffff');
  gradient.addColorStop(1, '#f0f0f0');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

function renderHabitatLayers(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  uiState: TapestryUIState
) {
  ctx.globalAlpha = 0.1;
  
  // Deep layer
  const deepGradient = ctx.createLinearGradient(0, height * 0.7, 0, height);
  deepGradient.addColorStop(0, 'transparent');
  deepGradient.addColorStop(1, '#2c003e');
  ctx.fillStyle = deepGradient;
  ctx.fillRect(0, height * 0.7, width, height * 0.3);
  
  // Middle layer
  const middleGradient = ctx.createLinearGradient(0, height * 0.4, 0, height * 0.7);
  middleGradient.addColorStop(0, 'transparent');
  middleGradient.addColorStop(0.5, '#1a5490');
  middleGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = middleGradient;
  ctx.fillRect(0, height * 0.4, width, height * 0.3);
  
  // Surface layer
  const surfaceGradient = ctx.createLinearGradient(0, height * 0.1, 0, height * 0.4);
  surfaceGradient.addColorStop(0, 'transparent');
  surfaceGradient.addColorStop(0.5, '#4a7c59');
  surfaceGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = surfaceGradient;
  ctx.fillRect(0, height * 0.1, width, height * 0.3);
  
  // Aerial layer
  const aerialGradient = ctx.createLinearGradient(0, 0, 0, height * 0.2);
  aerialGradient.addColorStop(0, '#87ceeb');
  aerialGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = aerialGradient;
  ctx.fillRect(0, 0, width, height * 0.2);
  
  ctx.globalAlpha = 1;
}

function renderEnvironmentalPressure(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  turn: number
) {
  // Simulate environmental pressure waves
  ctx.globalAlpha = 0.2;
  
  const pressureZones = [
    { x: width * 0.3, y: height * 0.5, radius: 150, intensity: 0.7 },
    { x: width * 0.7, y: height * 0.3, radius: 200, intensity: 0.5 },
    { x: width * 0.5, y: height * 0.8, radius: 100, intensity: 0.9 }
  ];
  
  for (const zone of pressureZones) {
    const pulseRadius = zone.radius + Math.sin(turn * 0.05) * 20;
    
    const gradient = ctx.createRadialGradient(
      zone.x, zone.y, 0,
      zone.x, zone.y, pulseRadius
    );
    gradient.addColorStop(0, `rgba(255, 0, 0, ${zone.intensity})`);
    gradient.addColorStop(0.5, `rgba(255, 100, 0, ${zone.intensity * 0.5})`);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(
      zone.x - pulseRadius,
      zone.y - pulseRadius,
      pulseRadius * 2,
      pulseRadius * 2
    );
  }
  
  ctx.globalAlpha = 1;
}