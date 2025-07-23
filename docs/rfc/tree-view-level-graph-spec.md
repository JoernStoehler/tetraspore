# RFC: Tree of Life Level Graph Visualization Specification

## Overview

This specification defines a level graph visualization for the Tree of Life, where time (turn numbers) flows vertically and species evolution is represented as flowing edges. The design prioritizes visual clarity, smooth animations, and rich interaction patterns while maintaining stability under changes.

## Core Concept

### Level Graph Structure
- **Y-axis**: Time (turn numbers) flowing downward
- **X-axis**: Spatial arrangement for visual clarity
- **Edges**: Represent species lifecycles, not individual connections
- **Nodes**: Implicit - exist only as events on species paths

### Visual Language
- **Species as Paths**: Each species is a continuous colored path through time
- **No Explicit Nodes**: Clean edge flow without node clutter
- **Event Markers**: Birth, branching, and extinction points on paths
- **Smooth Curves**: Organic flow using cubic Bézier curves

## Data Model

### Extended Species Type
```typescript
interface Species {
  // Core Identity
  id: string;
  name: string;
  parentId: string | null;
  
  // Timeline
  birthTurn: number;
  extinctionTurn?: number;
  
  // Visual Identity
  primaryColor: string;          // Main edge color for this species
  imageUrl?: string;             // Species image (circular crop for icons, 4:3 for cards)
  
  // Content
  description: string;           // Text shown in species cards
  
  // Proposal State (all proposals are previews awaiting approval)
  proposalType?: 'birth' | 'extinction';  // What kind of proposal
  proposalSource?: 'player' | 'ai';       // Who proposed it
}
```

### Implementation Notes

**Node Data Structure**: The algorithm references "nodes" but we're rendering continuous paths. Each species has implicit nodes at:
- Birth point (turn + 0.33)
- Each turn it survives (turn + 0.0)  
- Extinction point (turn + 0.66) or current turn if alive

**Helper Functions**: These are standard implementations:
- `computeGradient()`: Use numerical approximation (f(x+ε) - f(x))/ε
- `gradientNorm()`: sqrt(Σ gradient[i]²)
- Objective functions: Sum distances/variances as described in names
- `findSiblings()`: Filter species with same parentId
- `interpolateXPosition()`: Average X of neighboring order positions

### Component Architecture

```typescript
// Main visualization component
interface TreeOfLifeLevelGraphProps {
  species: Species[];              // Game state
  currentTurn: number;
  selectedSpeciesId?: string;      // Currently selected
  hoveredSpeciesId?: string;       // Currently hovered
  onSpeciesClick: (id: string) => void;
  onSpeciesHover: (id: string | null) => void;
  onProposalAction: (id: string, action: 'accept' | 'reject') => void;
}

// Individual species path component
interface SpeciesPathProps {
  species: Species;
  path: Point[];                   // Computed path points
  zIndex: number;                  // Layering (parent above child at branch)
  isSelected: boolean;
  isHovered: boolean;
  viewport: Viewport;              // For label positioning
  onPathClick: () => void;
  onPathHover: (hovering: boolean) => void;
}

// SpeciesPath renders:
// - The curved path (SVG path element)
// - Leaf image & name at endpoint
// - Floating label positioned to stay in viewport

// Shared icon component
interface SpeciesIconProps {
  species: Species;
  size: 'small' | 'medium' | 'large';  // small=hover(20px), medium=card(40px), large=leaf(60px)
  showLabel?: boolean;
}

// Hover tooltip component
interface HoverPointProps {
  species: Species;
  position: Point;                 // Screen coordinates
  visible: boolean;
}

// Card components
interface SpeciesCardBarProps {
  species: Species[];              // All species
  selectedHistory: string[];       // IDs in order [newest...oldest]
  hoveredSpeciesId?: string;       // For preview card
  onCardClick: (id: string) => void;
  onProposalAction: (id: string, action: 'accept' | 'reject') => void;
}

interface SpeciesCardProps {
  species: Species;
  index: number;                   // 0=preview, 1+=history
  displayMode: 'compact' | 'expanded';
  onExpand?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
}
```

### Layout Computation

```typescript
// Layout algorithm transforms Species[] to visual positions
interface LayoutEngine {
  // Main computation with caching for stability
  computeLayout(
    species: Species[],
    currentTurn: number,
    viewport: Viewport,
    cache?: LayoutCache
  ): LayoutResult;
}

interface LayoutResult {
  speciesPaths: Map<string, Point[]>;  // speciesId -> path points
  zIndices: Map<string, number>;       // speciesId -> z-index
  viewportBounds: Bounds;              // Total bounds of all content
}

interface LayoutCache {
  previousSpeciesOrder: Map<string, number>;  // speciesId -> order number
  previousPositions: Map<string, Point>;      // speciesId -> {x,y} position
  lastComputedTurn: number;
}

type Point = { x: number; y: number };
type Bounds = { minX: number; maxX: number; minY: number; maxY: number };
type Viewport = { x: number; y: number; width: number; height: number; zoom: number };
```

### Component Hierarchy

```tsx
<TreeOfLifeLevelGraph>
  {/* Main visualization area */}
  <svg className="tree-canvas">
    {/* Background layers per turn */}
    {turns.map(turn => <TurnBackground key={turn} />)}
    
    {/* Species paths sorted by z-index (lower z-index renders first) */}
    {sortedSpecies.map(species => (
      <SpeciesPath 
        key={species.id}
        species={species}
        path={layoutResult.speciesPaths.get(species.id)}
        zIndex={layoutResult.zIndices.get(species.id)}
        viewport={viewport}
        {...etc}
      />
    ))}
    
    {/* Hover tooltip */}
    {hoveredSpecies && (
      <HoverPoint 
        species={hoveredSpecies}
        position={cursorPosition}
        visible={true}
      />
    )}
  </svg>
  
  {/* Bottom card bar */}
  <SpeciesCardBar 
    species={species}
    selectedHistory={selectedHistory}  // Maintained in parent component state
    hoveredSpeciesId={hoveredSpeciesId}
    {...etc}
  />
</TreeOfLifeLevelGraph>
```

## Visual Design

### Path Rendering
```typescript
interface PathStyle {
  // Base style
  strokeWidth: 3;
  strokeLinecap: 'round';
  opacity: 1;
  
  // State variations
  preview: {
    strokeDasharray: '5,5';
    glowFilter: 'golden-sparkle';
  };
  selected: {
    strokeWidth: 5;
    glowFilter: 'white-pulse';
  };
  hover: {
    strokeWidth: 4;
    opacity: 1;
  };
}
```

### Branching Geometry
- Parent path continues uninterrupted through branch point
- Children emerge from beneath with C¹ continuity (matching tangent)
- Different curvature for natural separation

### Y-Position System
- **turn + 0.00**: Species continues from previous turn
- **turn + 0.33**: Birth/branching events
- **turn + 0.66**: Extinction events
- **turn + 1.00**: Fade-out for living species (next turn boundary)

### Path Endpoints
- **Living species**: edge → icon+label → fading edge into future
- **Extinct species**: edge → icon+label → hard stop

### Background Design
- Textured tiles per turn for visual distinction
- Blend between adjacent turn textures
- Subtle grid lines at turn boundaries
- Possibility for AI-generated textures matching planet theme

## Interaction Design

### Species Information Display

#### Hover Behavior
- Show species name and circular-cropped image near cursor
- Highlight the hovered path
- Update the preview card (index 0) in bottom panel

#### Click Behavior
- Push species to history cards (index 1+)
- Smooth camera pan to center on species path
- Open selection glow on the path

#### Bottom Panel Cards
```typescript
interface SpeciesCard {
  index: number;                // 0 = preview, 1-10 = history
  speciesId: string;
  displayMode: 'compact' | 'expanded';
  
  // Compact mode shows:
  // - Circular-cropped image, name, birth-extinction turns
  // - Primary color indicator
  
  // Expanded mode adds:
  // - Full description
  // - Full 4:3 aspect ratio image
  // - Action buttons (for preview species)
}
```

### Card Behavior Rules
1. **Index 0**: Always shows hovered species (preview card)
2. **Index 1-10**: Click history, most recent first
3. **Deduplication**: Same species appears only once (at lowest index)
4. **Click on card**: Pan view to species location
5. **Double-click**: Expand card to modal view

### Proposal Interactions
```typescript
interface ProposalActions {
  // Visual indicators for proposals
  birth: {
    dashPattern: '5,5';          // Dashed line for proposed path
    glowEffect: 'golden-pulse';  // Golden sparkle
    acceptIcon: 'checkmark';
    rejectIcon: 'x-mark';
  };
  
  extinction: {
    fadeOpacity: 0.5;            // Semi-transparent path
    glowEffect: 'golden-pulse';  // At extinction point
    acceptIcon: 'skull-check';   
    rejectIcon: 'shield';
  };
  
  // Action locations
  actionButtons: ['species-card', 'path-endpoint'];
}
```

## Layout Algorithm

### Design Goals (Priority Order)
1. **STRICT**: No edge crossings within a turn
2. **STRICT**: Temporal consistency (birth before extinction)
3. **STRICT**: Total ordering preserved (topology)
4. **STRONG**: Minimize total edge length
5. **STRONG**: Stability under incremental changes
6. **SOFT**: Even horizontal spacing
7. **SOFT**: Parent-child proximity
8. **SOFT**: Aesthetic balance (center of mass)

### Algorithm Approach: Tree Layout with Animation Support

The layout system transforms game state into visual positions through these stages:

1. **Game State → Graph Structure**
   - Each species generates nodes for every turn it exists
   - Parent-child relationships create edges between nodes
   - Result: A directed graph with nodes at fixed Y positions (turn-based)

2. **Graph → Layout Positions**
   - Apply tree layout algorithm (e.g., Reingold-Tilford)
   - Respects minimum spacing between nodes
   - Parents centered over children where possible
   - X positions computed to minimize edge crossings

3. **Animation Support**
   - "Ghost nodes" for species that appear/disappear (width = 0)
   - Unified topology between start/end states
   - Node widths animate: 0→1 (appearing) or 1→0 (disappearing)
   - Edges grow/shrink layer by layer for organic feel

```typescript
// Key interfaces for layout system
interface GraphNode {
  id: string;                    // e.g., "speciesA-turn3"
  speciesId: string;             // Reference to Species
  turn: number;                  // Y position determinant
  type: 'birth' | 'continue' | 'extinction';
  children: GraphNode[];         // Next turn connections
}

interface LayoutInput {
  graph: GraphNode;              // Root of graph structure
  animationState?: {
    startSpecies: Species[];
    endSpecies: Species[];
    t: number;                   // Animation progress [0,1]
  };
}

interface LayoutOutput {
  nodePositions: Map<string, Point>;   // nodeId → {x, y}
  edgePaths: Map<string, Point[]>;    // edgeId → path points
  animatedWidths: Map<string, number>; // nodeId → current width
}

// Configuration constants
const INITIAL_SPACING = 100;      // Pixels between species initially
const MIN_SPACING = 50;           // Minimum pixels between species
const MAX_ITERATIONS = 1000;      // Gradient descent iterations
const LEARNING_RATE = 0.1;        // Gradient descent step size
const EPSILON = 0.001;            // Convergence threshold
const TURN_HEIGHT = 150;          // Pixels per turn
const BIRTH_OFFSET = 0.33;        // Y offset for births (turn + offset)
const EXTINCTION_OFFSET = 0.66;   // Y offset for extinctions

// Soft constraint weights (tune for desired behavior)
const EDGE_LENGTH_WEIGHT = 1.0;
const SPACING_WEIGHT = 0.5;
const PROXIMITY_WEIGHT = 2.0;  // Parent-child closeness
const BALANCE_WEIGHT = 0.3;
```

### Stability Strategy
- **Consistent X-ordering**: Once established, species maintain relative positions
- **Local adjustments**: New species push neighbors, not entire graph
- **View tracking**: Camera follows changes to maintain context
- **Gradual transitions**: Animate layout changes over 500-1000ms

### Animation Strategy

The layout algorithm handles transitions between any two tree states:

1. **Ghost Nodes**: Species that exist in only one state get zero-width "ghost" nodes in the other
2. **Unified Tree**: Both states share the same topology, enabling smooth transitions
3. **Width Animation**: Node widths animate from 0→1 (appearing) or 1→0 (disappearing)
4. **Layer-by-Layer**: Edges grow/shrink progressively by depth for organic feel

```typescript
// Node width based on animation state
computeNodeWidth(
  species: Species,
  startSpecies: Species[],
  endSpecies: Species[],
  t: number
): number {
  const inStart = startSpecies.some(s => s.id === species.id);
  const inEnd = endSpecies.some(s => s.id === species.id);
  
  if (inStart && inEnd) return NORMAL_WIDTH;        // Stable node
  if (!inStart && inEnd) return NORMAL_WIDTH * t;   // Appearing
  if (inStart && !inEnd) return NORMAL_WIDTH * (1 - t); // Disappearing
  return 0; // Should not happen
}
```

## Animation System

### Animation Types
```typescript
enum AnimationType {
  // State changes
  SPECIES_BIRTH = 'species-birth',
  SPECIES_EXTINCTION = 'species-extinction',
  SPECIES_CONTINUATION = 'species-continuation',
  
  // Preview interactions
  PREVIEW_APPEAR = 'preview-appear',
  PREVIEW_ACCEPT = 'preview-accept',
  PREVIEW_REJECT = 'preview-reject',
  
  // View changes
  CAMERA_PAN = 'camera-pan',
  CAMERA_ZOOM = 'camera-zoom',
  LAYOUT_ADJUSTMENT = 'layout-adjustment'
}

interface Animation {
  type: AnimationType;
  duration: number;              // milliseconds
  easing: string;                // CSS easing function
  parallel?: boolean;            // Can run with others
}
```

### Animation Sequences
1. **Turn Transition**:
   - Fade in new turn background (500ms)
   - Extend continuing species (300ms)
   - Reveal new births (500ms, staggered)
   - Show extinctions (500ms)
   - Adjust layout if needed (1000ms)

2. **Preview Acceptance**:
   - Remove dash pattern (200ms)
   - Pulse glow effect (300ms)
   - Solidify path (300ms)

3. **Species Selection**:
   - Highlight path (200ms)
   - Pan camera (500ms, eased)
   - Update card (300ms)

## Performance Considerations

### Optimization Strategies
1. **Path Simplification**: Reduce points on straight segments
2. **Viewport Culling**: Only render visible turns ± 2
3. **Level of Detail**: Simpler curves when zoomed out
4. **Path Caching**: Precompute unchanging path segments
5. **GPU Acceleration**: Use CSS transforms for panning

### Target Metrics
- **Initial render**: < 500ms for 100 species
- **Pan/zoom**: 60fps smooth interaction
- **Layout update**: < 200ms for single species addition
- **Memory usage**: < 100MB for 500 species

## Implementation Phases

### Phase 1: Core Visualization
- Basic path rendering with D3.js
- Simple force-directed layout
- Pan/zoom navigation
- Hover tooltips

### Phase 2: Rich Interactions
- Bottom card panel
- Click selection and history
- Smooth camera animations
- Path highlighting

### Phase 3: Preview System
- Golden glow effects
- Accept/reject UI
- Animation sequences
- State management

### Phase 4: Polish
- Textured backgrounds
- Particle effects
- Sound design hooks
- Performance optimization

## Design Decisions (from Open Questions)

1. **Edge Aesthetics**: Monochrome paths using species' primaryColor
   - Simple, clean aesthetic
   - Focus on topology over decoration

2. **Branching Visualization**: Organic emergence from parent
   - Parent path continues uninterrupted
   - Child branches emerge from beneath with C¹ continuity
   - Same first derivative (tangent) at branch point
   - Different higher derivatives for natural curve separation

3. **Density Management**: Unlimited canvas with zoom/pan
   - Not restricted to screen size
   - Support 50+ turns with fixed height per turn
   - Users navigate via zoom and pan controls

4. **Time Navigation**: Always show full evolutionary history
   - Core purpose is seeing complete tree
   - Possible debug mode: replay subset of events with animations

5. **Path Endpoints**: 
   - **Living species**: edge → icon+label → fading edge into future
   - **Extinct species**: edge → icon+label → hard stop
   - Visual distinction between "still alive" and "ended"

## Success Criteria

1. **Visual Clarity**: Can trace any species' full history at a glance
2. **Intuitive Interaction**: New players understand in < 30 seconds
3. **Performance**: Smooth with 500 species
4. **Stability**: Adding species doesn't reorganize entire view
5. **Engagement**: Players enjoy watching evolution unfold

## Implementation Roadmap

### Phase 1: Static Layout (Prove the Concept)
1. **Hardcoded positions** - Start with 5-10 species, manually set X positions
2. **Basic SVG paths** - Simple straight lines, no curves yet
3. **Component structure** - Get SpeciesPath and TreeOfLifeLevelGraph rendering
4. **Verify z-ordering** - Ensure parent paths render above children

### Phase 2: Basic Algorithm (No Optimization Yet)
1. **Topological sort** - Implement ordering with alphabetic tiebreaking
2. **Equal spacing** - Position nodes evenly across X axis
3. **Path curves** - Add Bézier curves for branching
4. **Test with 20+ species** - Find edge cases in ordering

### Phase 3: Optimization (Gradient Descent)
1. **Single constraint first** - Just minimize edge length
2. **Gradient computation** - Numerical gradients are fine initially
3. **Add ordering projection** - Implement enforceOrdering
4. **Tune one constraint at a time** - Add spacing, proximity, balance incrementally

### Phase 4: Incremental Updates
1. **Cache implementation** - Store previous orderings/positions
2. **Warm start logic** - Insert new species, interpolate positions
3. **Differential learning rates** - Lower rate for existing nodes
4. **Animation integration** - Smooth transitions between layouts

### Common Pitfalls to Avoid
- Don't try to implement all soft constraints at once
- Numerical gradients are fine (∂f/∂x ≈ (f(x+ε) - f(x))/ε)
- Start with small MAX_ITERATIONS (10-20) for faster debugging
- Log objective function value to ensure it's decreasing
- Visualize intermediate steps to debug convergence issues

### Testing Strategy
```typescript
// Start with simple test cases
const testCase1: Species[] = [
  { 
    id: 'A', name: 'Alpha', parentId: null, birthTurn: 0,
    primaryColor: '#FF6B6B', description: 'The first species'
  },
  { 
    id: 'B', name: 'Beta', parentId: 'A', birthTurn: 1,
    primaryColor: '#4ECDC4', description: 'Evolved from Alpha'
  },
  { 
    id: 'C', name: 'Charlie', parentId: 'A', birthTurn: 1,
    primaryColor: '#45B7D1', description: 'Also evolved from Alpha'
  }
];
// Expected order: B, A, C (parent centered)

// Then add complexity
const testCase2: Species[] = [
  ...testCase1,
  { 
    id: 'D', name: 'Delta', parentId: 'B', birthTurn: 2,
    primaryColor: '#96CEB4', description: 'Child of Beta'
  },
  { 
    id: 'E', name: 'Echo', parentId: 'B', birthTurn: 2,
    primaryColor: '#DDA0DD', description: 'Another child of Beta'
  }
];
// Expected order: B, D, E, A, C (maintaining parent-child locality)
```

## Next Steps

1. Set up development environment with D3.js
2. Create sample Species data for testing
3. Implement Phase 1 (static layout)
4. Iterate through phases with git commits
5. Measure performance at each phase