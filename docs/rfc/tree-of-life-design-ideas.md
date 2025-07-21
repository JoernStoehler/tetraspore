# RFC: Tree of Life Visualization Design Ideas

## Executive Summary

This document explores design improvements for the Tree of Life visualization in Tetraspore, focusing on creating an immersive, game-appropriate visualization that effectively communicates evolutionary relationships while providing engaging gameplay interactions.

## Current State Analysis

### Issues Identified
1. **Layout Constraints**: Fixed 800x400 dimensions don't adapt to screen size
2. **Container Overflow**: SVG content extends beyond its boundaries
3. **Visual Theme**: Light-themed design inappropriate for gaming atmosphere
4. **Limited Interactivity**: Only basic click handlers, no rich interactions
5. **Static Presentation**: No dynamic focus or narrative progression

### Strengths to Preserve
- Clean D3.js implementation
- Smooth zoom/pan functionality
- Clear node type distinctions (birth/alive/extinction)
- Leveled tree structure (one node per species per turn)

## Design Principles for Game-Focused Evolution Trees

### 1. **Immersive Visual Language** (Confidence: 95%)
- Dark, atmospheric theme befitting a cosmic/primordial setting
- Organic, flowing aesthetics suggesting life and growth
- Particle effects and subtle animations for living systems
- Bioluminescent color palette

### 2. **Progressive Disclosure** (Confidence: 90%)
- Start zoomed on current turn's activity
- Reveal history through exploration
- Fog of war for future evolution paths
- Layered information density

### 3. **Narrative Focus** (Confidence: 85%)
- Tree tells a story, not just displays data
- Highlight dramatic moments (mass extinctions, rapid diversification)
- Visual emphasis on player's choices and their consequences

### 4. **Responsive Information Architecture** (Confidence: 98%)
- Full-screen adaptive layout
- Context-sensitive detail levels
- Semantic zoom (show different info at different scales)
- Mobile-responsive design

## Core Feature Ideas

### Visual Features

#### 1. **Dynamic Theme System** (Expected Utility: High, Implementation: Medium)
```typescript
interface ThemeConfig {
  mode: 'cosmic' | 'primordial' | 'technological' | 'mystical';
  palette: {
    background: RadialGradient;  // Deep space to nebula edge
    nodes: {
      birth: PulsingGradient;    // Green with life energy
      alive: FlowingGradient;    // Blue with movement
      extinction: FadingGradient; // Red dissipating to ash
    };
    edges: {
      recent: GlowEffect;        // Bright for recent connections
      ancient: FadeEffect;       // Dim for old lineages
    };
  };
}
```

#### 2. **Atmospheric Background** (Expected Utility: High, Implementation: Low)
- Animated starfield or primordial soup
- Parallax layers for depth
- Subtle particle systems
- Time-of-day progression matching game turns

#### 3. **Node Visualization Enhancements** (Expected Utility: Very High, Implementation: Medium)
- **Size variation**: Node size reflects species population/importance
- **Pulsing animation**: Living species gently pulse
- **Extinction animation**: Nodes fade and scatter when species die
- **Birth animation**: Nodes grow from parent with particle burst
- **Health indicators**: Visual cues for thriving vs struggling species

### Interaction Features

#### 1. **Focus Mode** (Expected Utility: Very High, Implementation: Medium)
- Click species to enter focused view
- Highlight entire lineage (ancestors + descendants)
- Dim unrelated branches
- Show detailed species information panel
- Smooth camera transitions

#### 2. **Time Scrubbing** (Expected Utility: High, Implementation: High)
- Timeline slider to replay evolution
- Watch species emerge and die
- Pause at interesting moments
- Speed controls for playback

#### 3. **Comparison Mode** (Expected Utility: Medium, Implementation: Medium)
- Select 2+ species to compare
- Highlight common ancestors
- Show divergence points
- Display trait differences

#### 4. **Ghost Preview** (Expected Utility: Medium, Implementation: High)
- Preview potential evolution paths
- Show probability clouds for future turns
- Indicate player choice impact zones

### Information Display Features

#### 1. **Contextual Information Layers** (Expected Utility: Very High, Implementation: Medium)
```typescript
interface InfoLayer {
  zoomLevel: number;
  showElements: {
    speciesNames: boolean;
    turnNumbers: boolean;
    populationSize: boolean;
    traits: boolean;
    relationships: boolean;
  };
}

// Zoom levels:
// 0.3-0.7: Overview (only major branches)
// 0.7-1.5: Standard (names and turns)
// 1.5-3.0: Detailed (all information)
```

#### 2. **Rich Tooltips** (Expected Utility: High, Implementation: Low)
- Hover for quick info
- Species traits and abilities
- Population statistics
- Evolutionary pressure indicators
- Player actions that affected this species

#### 3. **Legend and Controls** (Expected Utility: High, Implementation: Low)
- Collapsible legend
- View options (show/hide elements)
- Search/filter capabilities
- Keyboard shortcuts overlay

### Performance Features

#### 1. **Level-of-Detail Rendering** (Expected Utility: High, Implementation: High)
- Render only visible nodes in detail
- Simplified rendering for distant nodes
- Progressive loading for large trees
- WebGL acceleration for complex effects

#### 2. **Smart Clustering** (Expected Utility: Medium, Implementation: High)
- Group dense areas at low zoom
- Expand on zoom/interaction
- Maintain performance with 1000+ nodes

## UX Patterns for Gaming Context

### 1. **Cinematic Transitions** (Confidence: 85%)
- Camera movements tell story
- Smooth focus shifts between game events and tree
- Dramatic zooms for extinctions/births

### 2. **Persistent Player Context** (Confidence: 90%)
- Always show player's current focus species
- Breadcrumb trail of player choices
- Quick return to "home" view

### 3. **Integrated Game Actions** (Confidence: 80%)
- Right-click for species actions menu
- Drag to create relationships
- Double-click to view species detail screen

### 4. **Visual Feedback Loops** (Confidence: 95%)
- Immediate visual response to game events
- Ripple effects through the tree
- Satisfying animations for player actions

## Technical Considerations

### 1. **Rendering Strategy**
- **Canvas vs SVG**: Consider hybrid approach
  - SVG for interactive elements
  - Canvas for effects and backgrounds
  - WebGL for particle systems

### 2. **State Management**
- Efficient tree updates without full re-renders
- Optimistic updates for responsiveness
- State persistence for time scrubbing

### 3. **Responsive Design**
```typescript
interface ViewportStrategy {
  mobile: {
    orientation: 'vertical';
    controls: 'bottom-sheet';
    zoom: 'pinch-gesture';
  };
  tablet: {
    orientation: 'auto';
    controls: 'sidebar';
    zoom: 'pinch-or-wheel';
  };
  desktop: {
    orientation: 'horizontal';
    controls: 'floating-panels';
    zoom: 'wheel-or-buttons';
  };
}
```

## Specific Solutions to Current Issues

### 1. **Full-Screen Adaptive Layout**
```typescript
// Replace fixed dimensions with viewport-based sizing
const { width, height } = useViewportSize();
const treeContainer = {
  width: width - sidebarWidth,
  height: height - headerHeight,
  minWidth: 320,
  minHeight: 480
};
```

### 2. **Container Overflow Fix**
- Implement proper SVG viewBox
- Add pan boundaries
- Clip-path for edge cases
- Overflow indicators at boundaries

### 3. **Dark Gaming Theme**
```css
.tree-of-life {
  background: radial-gradient(ellipse at center, 
    #0a0e1a 0%,     /* Deep space core */
    #1a1f3a 50%,    /* Nebula middle */
    #0d1117 100%);  /* Dark edge */
  
  /* Subtle animated stars */
  &::before {
    content: '';
    background-image: url('data:image/svg+xml,...'); /* Generated stars */
    animation: twinkle 200s linear infinite;
  }
}
```

## Feature Prioritization

### Phase 1: Core Improvements (1-2 weeks)
1. ✅ Dark theme implementation
2. ✅ Responsive full-screen layout
3. ✅ Fix container overflow
4. ✅ Enhanced node animations
5. ✅ Basic focus mode

### Phase 2: Engagement Features (2-3 weeks)
1. 🔄 Rich tooltips
2. 🔄 Species detail panel
3. 🔄 Lineage highlighting
4. 🔄 Legend and controls
5. 🔄 Atmospheric background

### Phase 3: Advanced Features (3-4 weeks)
1. ⏸️ Time scrubbing
2. ⏸️ Comparison mode
3. ⏸️ Level-of-detail rendering
4. ⏸️ Ghost previews
5. ⏸️ WebGL effects

## Risks and Mitigation

### Performance Risks (Probability: 40%)
- **Risk**: Complex effects slow down large trees
- **Mitigation**: Progressive enhancement, quality settings

### Complexity Risks (Probability: 30%)
- **Risk**: Too many features overwhelm players
- **Mitigation**: User testing, gradual feature introduction

### Mobile Experience (Probability: 60%)
- **Risk**: Dense information hard to navigate on small screens
- **Mitigation**: Adaptive UI, mobile-specific interactions

## Open Questions for Stakeholder Input

1. **Visual Style Direction**
   - How "realistic" vs "stylized" should the tree appear?
   - Preference for organic vs geometric aesthetics?
   - Color palette constraints?

2. **Interaction Depth**
   - Should players manipulate the tree directly?
   - How much historical data to preserve?
   - Real-time vs turn-based updates?

3. **Information Density**
   - What species attributes are most important?
   - How much numerical data to show?
   - Preference for icons vs text?

4. **Performance Targets**
   - Maximum expected species count?
   - Target frame rate for animations?
   - Mobile device minimum specs?

## Conclusion

The Tree of Life visualization should evolve from a functional diagram into an immersive, living representation of the game's evolutionary narrative. By implementing these design ideas progressively, we can create an experience that both informs and engages players, making the evolutionary process a central and compelling aspect of gameplay.

**Next Steps:**
1. Gather stakeholder feedback on visual direction
2. Create mockups for Phase 1 features
3. Prototype dark theme and responsive layout
4. User test core interactions