# Tree Visualization Tech Stack Analysis

## Current Limitations

### D3.js + SVG Limitations
- **Performance**: SVG struggles with 1000+ animated elements
- **Animation Control**: Limited to CSS transitions and D3 transitions
- **Visual Effects**: No shaders, limited blend modes, no particle systems
- **Custom Rendering**: Hard to implement textured edges, complex gradients

### React Considerations
- React is great for UI state management
- Not optimized for frame-by-frame animations
- Can integrate with other rendering libraries

## Recommended Tech Stack Options

### Option 1: **Pixi.js** (2D WebGL) - RECOMMENDED
```javascript
// Example API for themes
const treeTheme = {
  init: (app, api) => {
    // Background with particle system
    const background = api.createBackground({
      gradient: ['#0a0e1a', '#1a1f3a'],
      particles: {
        count: 200,
        behavior: 'twinkle'
      }
    });
    
    // Node styling
    api.setNodeRenderer((node, graphics) => {
      if (node.type === 'birth') {
        graphics.beginFill(0x4CAF50);
        graphics.drawCircle(0, 0, node.radius);
        
        // Pulsing animation
        api.animate(graphics, {
          scale: [1, 1.1, 1],
          duration: 2000,
          repeat: -1
        });
      }
    });
    
    // Edge growing animation
    api.setEdgeAnimation((edge, graphics) => {
      return api.growPath(graphics, edge.path, {
        duration: 500,
        texture: 'organic-vine',
        width: edge.strength * 3
      });
    });
  }
};
```

**Pros:**
- Hardware accelerated (WebGL)
- Excellent performance with thousands of nodes
- Rich animation/filter system
- Texture support
- Particle systems built-in
- Great React integration via @pixi/react

**Cons:**
- Learning curve if unfamiliar
- Larger bundle size than D3

### Option 2: **Canvas API + Custom Renderer**
```javascript
// Lighter weight, more control
const treeTheme = {
  init: (canvas, ctx, api) => {
    api.onFrame((time) => {
      // Custom render loop
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background
      api.drawGradient(ctx, [...]);
      
      // Draw edges with growth animation
      api.edges.forEach(edge => {
        const progress = api.getAnimationProgress(edge.id, 'grow');
        api.drawPartialPath(ctx, edge.path, progress);
      });
      
      // Draw nodes
      api.nodes.forEach(node => {
        if (node.alive) {
          const pulse = Math.sin(time * 0.001) * 0.1 + 1;
          api.drawNode(ctx, node, pulse);
        }
      });
    });
  }
};
```

**Pros:**
- Full control
- Minimal dependencies
- Smaller bundle
- Easy to understand

**Cons:**
- Must implement everything
- No built-in optimizations
- More code for complex effects

### Option 3: **Hybrid - React UI + Pixi.js Visualization**
```javascript
// TreeOfLife.tsx
import { Stage } from '@pixi/react';
import { TreeVisualization } from './TreeVisualization';

export function TreeOfLife({ data, theme }) {
  return (
    <div className="tree-container">
      <Stage width={width} height={height}>
        <TreeVisualization 
          data={data}
          theme={theme} // JS file that modifies Pixi scene
        />
      </Stage>
      
      {/* React UI overlays */}
      <SpeciesPanel />
      <TimelineControls />
    </div>
  );
}
```

## API Design Principles

### 1. **Standard Web Patterns**
```javascript
// Theme gets standard DOM elements and APIs
const theme = {
  // Called once on mount
  init: (container, api) => {
    // Container is a standard div
    container.style.background = 'black';
    
    // Can add any HTML/CSS
    const stars = document.createElement('div');
    stars.className = 'starfield';
    container.appendChild(stars);
  },
  
  // Called on updates
  update: (state, api) => {
    // State changes trigger animations
    if (state.newSpecies) {
      api.animateNodeBirth(state.newSpecies);
    }
  }
};
```

### 2. **Progressive Enhancement**
```javascript
// Start simple
const minimalTheme = {
  nodeColor: (node) => node.type === 'birth' ? 'green' : 'blue',
  edgeColor: () => '#666'
};

// Enhance incrementally
const animatedTheme = {
  ...minimalTheme,
  nodeAnimation: (node) => ({
    scale: node.alive ? 'pulse' : 'none',
    opacity: node.extinct ? 0.3 : 1
  })
};
```

### 3. **GenAI-Friendly APIs**
```javascript
// Clear, documented functions that AI can easily call
const api = {
  // Visual effects
  addGlow: (element, color, intensity) => {},
  createParticles: (x, y, config) => {},
  animatePath: (path, options) => {},
  
  // Layout algorithms  
  setLayoutAlgorithm: (fn) => {},
  
  // Event handling
  onNodeClick: (handler) => {},
  onTimeChange: (handler) => {},
  
  // Replay system
  replayEvents: (events, speed) => {}
};
```

## Migration Path

### Phase 1: Keep D3 + React, Add Theme API
- Extract hardcoded styles to theme object
- Add animation API using D3 transitions
- Test with GenAI creating simple themes

### Phase 2: Evaluate Performance
- If D3 is sufficient, enhance API
- If not, implement Pixi.js renderer
- Keep same theme API interface

### Phase 3: Advanced Features
- Implement replay system
- Add particle effects
- Complex edge rendering

## Example: Minimal Theme System

```javascript
// treeTheme.js - can be generated by AI
export default {
  background: {
    type: 'animated-gradient',
    colors: ['#001', '#113'],
    animation: 'slow-shift'
  },
  
  nodes: {
    birth: {
      fill: '#0f0',
      stroke: '#080',
      animation: 'grow-in',
      glow: true
    },
    alive: {
      fill: '#00f',
      animation: 'pulse',
      pulseSpeed: 2000
    },
    extinct: {
      fill: '#f00',
      animation: 'fade-out',
      particles: 'dissolve'
    }
  },
  
  edges: {
    animation: 'grow',
    texture: 'organic',
    width: (edge) => edge.importance * 3
  },
  
  camera: {
    followNew: true,
    zoomToFit: true,
    panSpeed: 0.5
  }
};
```

This approach gives us maximum flexibility while keeping things standard and AI-friendly!