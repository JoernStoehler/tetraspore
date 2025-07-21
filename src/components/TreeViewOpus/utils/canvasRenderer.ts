/**
 * Canvas rendering functions for threads and connections
 */

import { TapestryThread, TapestryUIState } from '../types';

export function renderThread(
  ctx: CanvasRenderingContext2D,
  thread: TapestryThread,
  uiState: TapestryUIState
) {
  const { path, visualState, species } = thread;
  if (path.length < 2) return;
  
  ctx.save();
  
  // Apply thread-specific transforms
  ctx.globalAlpha = visualState.opacity;
  
  // Create gradient for thread
  const gradient = createThreadGradient(ctx, thread, uiState);
  
  // Set line style based on visual mode
  switch (uiState.visuals.threadStyle) {
    case 'watercolor':
      renderWatercolorThread(ctx, path, gradient, visualState);
      break;
    case 'neon':
      renderNeonThread(ctx, path, gradient, visualState);
      break;
    case 'sketch':
      renderSketchThread(ctx, path, gradient, visualState);
      break;
    case 'abstract':
      renderAbstractThread(ctx, path, gradient, visualState);
      break;
    default:
      renderRealisticThread(ctx, path, gradient, visualState);
  }
  
  // Add effects
  if (species.effects.sparkles) {
    renderSparkles(ctx, path, species);
  }
  
  if (species.effects.pulses) {
    renderPulses(ctx, path, visualState, Date.now());
  }
  
  // Add glow for high vitality
  if (visualState.glow > 0) {
    renderGlow(ctx, path, species.threadColor.primary, visualState.glow);
  }
  
  ctx.restore();
}

function renderWatercolorThread(
  ctx: CanvasRenderingContext2D,
  path: TapestryThread['path'],
  gradient: CanvasGradient,
  visualState: TapestryThread['visualState']
) {
  // Multiple translucent strokes for watercolor effect
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = gradient;
    
    for (let j = 0; j < path.length; j++) {
      const segment = path[j];
      const wobble = Math.sin(j * 0.5 + i) * 2;
      
      if (j === 0) {
        ctx.moveTo(segment.x + wobble, segment.y);
      } else {
        const prev = path[j - 1];
        if (segment.controlBefore && prev.controlAfter) {
          ctx.bezierCurveTo(
            prev.controlAfter.x + wobble,
            prev.controlAfter.y,
            segment.controlBefore.x + wobble,
            segment.controlBefore.y,
            segment.x + wobble,
            segment.y
          );
        } else {
          ctx.lineTo(segment.x + wobble, segment.y);
        }
      }
      
      // Vary thickness
      ctx.lineWidth = segment.thickness * (0.8 + Math.random() * 0.4);
    }
    
    ctx.stroke();
  }
}

function renderNeonThread(
  ctx: CanvasRenderingContext2D,
  path: TapestryThread['path'],
  gradient: CanvasGradient,
  visualState: TapestryThread['visualState']
) {
  // Bright core with multiple glows
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  // Outer glow
  ctx.beginPath();
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = gradient;
  ctx.lineWidth = path[0].thickness * 4;
  ctx.filter = 'blur(8px)';
  drawThreadPath(ctx, path);
  ctx.stroke();
  
  // Middle glow
  ctx.beginPath();
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = path[0].thickness * 2;
  ctx.filter = 'blur(4px)';
  drawThreadPath(ctx, path);
  ctx.stroke();
  
  // Bright core
  ctx.beginPath();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = path[0].thickness * 0.5;
  ctx.filter = 'none';
  drawThreadPath(ctx, path);
  ctx.stroke();
}

function renderSketchThread(
  ctx: CanvasRenderingContext2D,
  path: TapestryThread['path'],
  gradient: CanvasGradient,
  visualState: TapestryThread['visualState']
) {
  // Rough, hand-drawn appearance
  ctx.lineCap = 'round';
  ctx.strokeStyle = gradient;
  
  // Multiple rough strokes
  for (let i = 0; i < 2; i++) {
    ctx.beginPath();
    ctx.globalAlpha = 0.7;
    
    for (let j = 0; j < path.length; j++) {
      const segment = path[j];
      const jitter = (Math.random() - 0.5) * 3;
      
      if (j === 0) {
        ctx.moveTo(segment.x + jitter, segment.y + jitter);
      } else if (j % 3 === 0) {
        // Occasional straight lines for sketch effect
        ctx.lineTo(segment.x + jitter, segment.y + jitter);
      } else {
        const prev = path[j - 1];
        ctx.quadraticCurveTo(
          prev.x + jitter,
          prev.y + jitter,
          segment.x + jitter,
          segment.y + jitter
        );
      }
      
      ctx.lineWidth = segment.thickness * (0.8 + Math.random() * 0.4);
    }
    
    ctx.stroke();
  }
}

function renderAbstractThread(
  ctx: CanvasRenderingContext2D,
  path: TapestryThread['path'],
  gradient: CanvasGradient,
  visualState: TapestryThread['visualState']
) {
  // Geometric, angular representation
  ctx.lineCap = 'square';
  ctx.lineJoin = 'miter';
  ctx.strokeStyle = gradient;
  
  ctx.beginPath();
  
  for (let i = 0; i < path.length; i++) {
    const segment = path[i];
    
    if (i === 0) {
      ctx.moveTo(segment.x, segment.y);
    } else if (i % 4 === 0) {
      // Create angular segments
      const prev = path[i - 1];
      ctx.lineTo(prev.x, segment.y);
      ctx.lineTo(segment.x, segment.y);
    }
    
    ctx.lineWidth = segment.thickness;
  }
  
  ctx.stroke();
  
  // Add geometric shapes at key points
  for (let i = 0; i < path.length; i += 5) {
    const segment = path[i];
    ctx.fillStyle = segment.color;
    ctx.fillRect(
      segment.x - segment.thickness / 2,
      segment.y - segment.thickness / 2,
      segment.thickness,
      segment.thickness
    );
  }
}

function renderRealisticThread(
  ctx: CanvasRenderingContext2D,
  path: TapestryThread['path'],
  gradient: CanvasGradient,
  visualState: TapestryThread['visualState']
) {
  // Smooth, organic thread
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = gradient;
  
  ctx.beginPath();
  drawThreadPath(ctx, path);
  ctx.stroke();
}

function drawThreadPath(ctx: CanvasRenderingContext2D, path: TapestryThread['path']) {
  for (let i = 0; i < path.length; i++) {
    const segment = path[i];
    
    if (i === 0) {
      ctx.moveTo(segment.x, segment.y);
    } else {
      const prev = path[i - 1];
      if (segment.controlBefore && prev.controlAfter) {
        ctx.bezierCurveTo(
          prev.controlAfter.x,
          prev.controlAfter.y,
          segment.controlBefore.x,
          segment.controlBefore.y,
          segment.x,
          segment.y
        );
      } else {
        ctx.lineTo(segment.x, segment.y);
      }
    }
    
    // Update line width for each segment
    ctx.lineWidth = segment.thickness;
  }
}

function createThreadGradient(
  ctx: CanvasRenderingContext2D,
  thread: TapestryThread,
  uiState: TapestryUIState
): CanvasGradient {
  const { path, species } = thread;
  if (path.length < 2) return species.threadColor.primary;
  
  const start = path[0];
  const end = path[path.length - 1];
  
  const gradient = ctx.createLinearGradient(start.x, start.y, end.x, end.y);
  
  // Add color stops based on thread state
  gradient.addColorStop(0, species.threadColor.primary);
  gradient.addColorStop(0.5, species.threadColor.secondary);
  gradient.addColorStop(1, species.threadColor.primary);
  
  return gradient;
}

export function renderConnections(
  ctx: CanvasRenderingContext2D,
  thread: TapestryThread,
  allThreads: TapestryThread[],
  uiState: TapestryUIState
) {
  for (const connection of thread.connections) {
    const targetThread = allThreads.find(t => t.id === connection.targetId);
    if (!targetThread) continue;
    
    ctx.save();
    ctx.globalAlpha = connection.visual.opacity;
    
    switch (connection.visual.style) {
      case 'fiber':
        renderFiberConnection(ctx, thread, targetThread, connection);
        break;
      case 'energy':
        renderEnergyConnection(ctx, thread, targetThread, connection);
        break;
      case 'particle':
        renderParticleConnection(ctx, thread, targetThread, connection);
        break;
    }
    
    ctx.restore();
  }
}

function renderFiberConnection(
  ctx: CanvasRenderingContext2D,
  source: TapestryThread,
  target: TapestryThread,
  connection: TapestryThread['connections'][0]
) {
  if (source.path.length === 0 || target.path.length === 0) return;
  
  const start = source.path[Math.min(connection.fromSegment, source.path.length - 1)];
  const end = target.path[target.path.length - 1];
  
  ctx.strokeStyle = connection.visual.color;
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);
  
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);
  ctx.quadraticCurveTo(
    (start.x + end.x) / 2,
    (start.y + end.y) / 2 - 50,
    end.x,
    end.y
  );
  ctx.stroke();
  
  ctx.setLineDash([]);
}

function renderEnergyConnection(
  ctx: CanvasRenderingContext2D,
  source: TapestryThread,
  target: TapestryThread,
  connection: TapestryThread['connections'][0]
) {
  if (source.path.length === 0 || target.path.length === 0) return;
  
  const time = Date.now() * 0.001;
  const segments = 20;
  
  for (let i = 0; i < source.path.length; i += 5) {
    for (let j = 0; j < target.path.length; j += 5) {
      const start = source.path[i];
      const end = target.path[j];
      
      // Check if segments are close enough
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 200) {
        ctx.strokeStyle = connection.visual.color;
        ctx.lineWidth = 1;
        ctx.globalAlpha = connection.visual.opacity * (1 - distance / 200);
        
        ctx.beginPath();
        
        for (let k = 0; k <= segments; k++) {
          const t = k / segments;
          const wave = Math.sin(t * Math.PI * 4 + time * 2) * 10;
          const x = start.x + dx * t + wave * (-dy / distance);
          const y = start.y + dy * t + wave * (dx / distance);
          
          if (k === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
      }
    }
  }
}

function renderParticleConnection(
  ctx: CanvasRenderingContext2D,
  source: TapestryThread,
  target: TapestryThread,
  connection: TapestryThread['connections'][0]
) {
  if (source.path.length === 0 || target.path.length === 0) return;
  
  const time = Date.now() * 0.001;
  const particleCount = 5;
  
  ctx.fillStyle = connection.visual.color;
  
  for (let i = 0; i < particleCount; i++) {
    const t = ((time * 0.5 + i / particleCount) % 1);
    const sourceIndex = Math.floor(t * (source.path.length - 1));
    const targetIndex = Math.floor(t * (target.path.length - 1));
    
    const start = source.path[sourceIndex];
    const end = target.path[targetIndex];
    
    const x = start.x + (end.x - start.x) * t;
    const y = start.y + (end.y - start.y) * t;
    
    const size = 3 * (1 - Math.abs(t - 0.5) * 2);
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function renderSparkles(
  ctx: CanvasRenderingContext2D,
  path: TapestryThread['path'],
  species: TapestryThread['species']
) {
  const time = Date.now() * 0.001;
  
  ctx.fillStyle = species.threadColor.primary;
  
  for (let i = 0; i < path.length; i += 3) {
    const segment = path[i];
    const sparkle = Math.sin(time * 3 + i) * 0.5 + 0.5;
    
    if (sparkle > 0.8) {
      ctx.globalAlpha = sparkle;
      ctx.beginPath();
      ctx.arc(segment.x, segment.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function renderPulses(
  ctx: CanvasRenderingContext2D,
  path: TapestryThread['path'],
  visualState: TapestryThread['visualState'],
  time: number
) {
  const pulseSpeed = 0.002;
  const pulsePosition = (time * pulseSpeed) % path.length;
  const pulseIndex = Math.floor(pulsePosition);
  
  if (pulseIndex < path.length) {
    const segment = path[pulseIndex];
    const pulse = Math.sin(pulsePosition * Math.PI) * visualState.thickness;
    
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.arc(segment.x, segment.y, segment.thickness + pulse, 0, Math.PI * 2);
    ctx.stroke();
  }
}

function renderGlow(
  ctx: CanvasRenderingContext2D,
  path: TapestryThread['path'],
  color: string,
  intensity: number
) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.strokeStyle = color;
  ctx.globalAlpha = intensity * 0.3;
  ctx.filter = `blur(${intensity * 10}px)`;
  ctx.lineWidth = path[0].thickness * 3;
  
  ctx.beginPath();
  drawThreadPath(ctx, path);
  ctx.stroke();
  
  ctx.restore();
}