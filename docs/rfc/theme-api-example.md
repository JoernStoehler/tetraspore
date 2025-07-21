# Theme API Example - Practical Implementation

## Core Concept: Themes as JavaScript Modules

Instead of configuration objects, themes are JavaScript modules that receive a well-documented API and can do whatever they want with standard web technologies.

## Starting Small - YAGNI Approach

### Step 1: Minimal API Surface

```javascript
// TreeOfLifeAPI.ts - What we expose to themes
export interface TreeAPI {
  // DOM access
  container: HTMLElement;      // The tree's container div
  canvas?: HTMLCanvasElement;  // If using canvas
  
  // Data access
  nodes: TreeNode[];
  edges: Edge[];
  
  // Basic lifecycle
  onMount: (callback: () => void) => void;
  onUpdate: (callback: (changes: Changes) => void) => void;
  onFrame: (callback: (time: number) => void) => void;
  
  // Simple utilities (only what we need)
  animate: (element: Element, keyframes: Keyframe[], options: KeyframeAnimationOptions) => Animation;
}
```

### Step 2: First Theme - Demonstrating the API

```javascript
// themes/cosmic-theme.js
export default function cosmicTheme(api) {
  // Theme can do ANYTHING with standard DOM/JS
  
  api.onMount(() => {
    // 1. Style the container with standard CSS
    api.container.style.cssText = `
      background: radial-gradient(ellipse at center, #0a0e1a 0%, #1a1f3a 100%);
      position: relative;
      overflow: hidden;
    `;
    
    // 2. Add a starfield using standard HTML/CSS
    const stars = document.createElement('div');
    stars.innerHTML = generateStarfield(200); // Regular JS function
    stars.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      animation: twinkle 200s linear infinite;
    `;
    api.container.appendChild(stars);
    
    // 3. If the theme wants WebGL effects, it can add them
    if (window.WebGLRenderingContext) {
      addWebGLBackground(api.container); // Theme brings its own libs
    }
  });
  
  api.onUpdate((changes) => {
    // React to game events
    if (changes.newBirth) {
      // Create birth animation using Web Animations API
      const birthNode = document.querySelector(`[data-node-id="${changes.newBirth.id}"]`);
      if (birthNode) {
        api.animate(birthNode, [
          { transform: 'scale(0)', opacity: 0 },
          { transform: 'scale(1.2)', opacity: 1, offset: 0.8 },
          { transform: 'scale(1)', opacity: 1 }
        ], {
          duration: 600,
          easing: 'ease-out'
        });
        
        // Add particle burst
        createParticleBurst(birthNode.getBoundingClientRect(), api.container);
      }
    }
  });
  
  // If theme wants custom rendering, it can take over
  if (api.canvas) {
    const ctx = api.canvas.getContext('2d');
    api.onFrame((time) => {
      // Custom canvas rendering
      drawPulsingNodes(ctx, api.nodes, time);
    });
  }
}

// Helper functions - theme can include whatever it needs
function generateStarfield(count) {
  let stars = '';
  for (let i = 0; i < count; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const size = Math.random() * 2;
    stars += `<div class="star" style="left:${x}%;top:${y}%;width:${size}px;height:${size}px;"></div>`;
  }
  return stars;
}
```

## Why This Works

### 1. **GenAI Can Easily Generate Themes**
```javascript
// AI prompt: "Create a primordial soup theme with bubbling effects"
// AI generates:
export default function primordialTheme(api) {
  api.onMount(() => {
    // Standard CSS gradient
    api.container.style.background = 'linear-gradient(to bottom, #1a3a1a, #0a1a0a)';
    
    // Add bubbles using standard divs
    const bubbleContainer = document.createElement('div');
    bubbleContainer.className = 'bubbles';
    
    // CSS animations
    const style = document.createElement('style');
    style.textContent = `
      .bubble {
        position: absolute;
        border-radius: 50%;
        background: radial-gradient(circle at 30% 30%, #4a6a4a, #2a4a2a);
        animation: rise 10s infinite;
      }
      @keyframes rise {
        from { transform: translateY(100vh) scale(0); }
        to { transform: translateY(-100px) scale(1); }
      }
    `;
    document.head.appendChild(style);
    
    // Generate bubbles
    setInterval(() => {
      const bubble = document.createElement('div');
      bubble.className = 'bubble';
      bubble.style.left = Math.random() * 100 + '%';
      bubble.style.width = bubble.style.height = Math.random() * 50 + 20 + 'px';
      bubble.style.animationDuration = Math.random() * 5 + 5 + 's';
      bubbleContainer.appendChild(bubble);
      
      // Clean up
      setTimeout(() => bubble.remove(), 10000);
    }, 500);
    
    api.container.appendChild(bubbleContainer);
  });
}
```

### 2. **Progressive Enhancement**
Start with just `onMount` and `container`, add more as needed:
- Add `onFrame` when we need animation loops
- Add `canvas` when SVG isn't enough
- Add `webgl` when we need shaders
- Add `audio` when we want sound effects

### 3. **No Magic, Just Web Standards**
- Themes use `document.createElement`, `style.cssText`, `animate()`
- No custom DSL to learn
- GenAI already knows these APIs
- Easy to debug in browser DevTools

## Extending the API (YAGNI)

Only add to the API when a theme needs it:

```javascript
// Version 2: Theme needed node access
export interface TreeAPI {
  // ... previous API ...
  
  // Added because cosmic theme needed it
  getNodeElement: (nodeId: string) => HTMLElement | null;
  
  // Added because ocean theme needed it  
  addRipple: (x: number, y: number, options?: RippleOptions) => void;
}
```

## Integration with React

```typescript
// TreeOfLife.tsx
import { useEffect, useRef } from 'react';

export function TreeOfLife({ data, themePath }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<TreeAPI>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create API
    const api: TreeAPI = {
      container: containerRef.current,
      nodes: data.nodes,
      edges: data.edges,
      onMount: (cb) => mountCallbacks.push(cb),
      onUpdate: (cb) => updateCallbacks.push(cb),
      onFrame: (cb) => frameCallbacks.push(cb),
      animate: (el, kf, opt) => el.animate(kf, opt)
    };
    
    apiRef.current = api;
    
    // Load and apply theme
    import(themePath).then(module => {
      const theme = module.default;
      theme(api);
      mountCallbacks.forEach(cb => cb());
    });
    
    // Start frame loop if needed
    if (frameCallbacks.length > 0) {
      const frame = (time: number) => {
        frameCallbacks.forEach(cb => cb(time));
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    }
  }, [themePath]);
  
  return (
    <div ref={containerRef} className="tree-of-life-container">
      {/* React renders the tree structure */}
      {/* Theme handles all styling/animation */}
    </div>
  );
}
```

This approach gives us maximum flexibility while keeping everything simple and standard!