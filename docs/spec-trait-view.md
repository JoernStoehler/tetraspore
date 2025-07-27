# Trait View Specification

## Overview

The Trait View is a core visualization component in Tetraspore that displays the evolutionary and developmental pathways available to the player's species and civilization. It presents traits as an interconnected graph where players can observe current capabilities, potential developments, and guide evolution through discrete choice events.

## Purpose

### Why This Component Exists

1. **Strategic Visibility**: Players need to see the full landscape of possible developments to make informed decisions about guiding evolution
2. **Progress Tracking**: Visual representation of adopted vs. available traits shows advancement
3. **Relationship Understanding**: Graph structure reveals qualitative relationships between traits
4. **Limited Influence**: Players guide evolution through discrete choices rather than direct control

### Game Design Goals

- Enable "guided evolution" gameplay where players are smarter than pure Darwinian selection
- Show how traits across different domains interconnect through qualitative relationships
- Support decision-making through clear visualization of choices and their implications
- Represent both species traits and environmental context

## Visual Design

### Graph Structure

```
┌─────────────────────────────────────────────────┐
│  Player Species Trait View                      │
├─────────────────────────────────────────────────┤
│                                                 │
│    ○ Photosynthesis     ● Tool Use    ◇ Rocky  │
│   ╱ ╲                  ╱   ╲          Terrain   │
│  ●   ○ Chloroplasts ✨ Stone  ○ Metal          │
│  │    ╲              Tools     Working          │
│  ●      ○ C4 Photo.  │                         │
│ Cells    synthesis    ● Fire    ◇ Abundant     │
│                       Making      Minerals      │
│                                                 │
│  Legend:                                        │
│  ● Adopted  ○ Discovered  ◇ Environmental      │
│  ✨ Choice Available  ⊗ Not Discovered          │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Node States

1. **Not Discovered** (⊗): Unknown to the species
   - Grayed out, low opacity
   - No details visible on hover

2. **Discovered but Not Adoptable** (○): Known but currently unreachable
   - Outlined only, no fill
   - Category color for outline
   - Shows requirements on hover

3. **Adoptable** (✨): Available as part of a choice
   - Golden sparkly border/glow
   - Part of current decision set
   - Clicking opens choice modal (future feature)

4. **Adopted** (●): Fully integrated trait
   - Solid fill color based on category
   - Cannot be lost (unless marked as losable)

5. **Losable** (✨●): Can be abandoned as part of a choice
   - Golden sparkly border around filled node
   - Part of current decision set

6. **Environmental** (◇): Present in species' environment
   - Diamond shape to distinguish from species traits
   - Category-based coloring
   - Affects fitness of other traits

### Edge Visualization

- **Style**: Consistent line style (no thickness variation as edges are qualitative)
- **Color**: Subtle gray to avoid visual clutter
- **Hover**: Highlights edge and shows description tooltip
- **No arrows**: Relationships are contextual, not strictly directional

### Categories & Color Coding

```typescript
// Adopted trait categories
enum AdoptedTraitCategory {
  Biological = "biological", // Green palette
  Behavioral = "behavioral", // Blue palette
  Social = "social", // Yellow palette
  Technological = "technological", // Orange palette
}

// Environmental trait categories
enum EnvironmentalTraitCategory {
  Geological = "geological", // Brown palette
  Ecological = "ecological", // Teal palette
  Industrial = "industrial", // Gray palette
}
```

## Technical Architecture

### Data Structure

```typescript
interface Trait {
  id: string;
  name: string;
  category: AdoptedTraitCategory | EnvironmentalTraitCategory;
  description: string;
  isEnvironmental: boolean;
}

interface TraitEdge {
  from: string; // Trait ID
  to: string; // Trait ID
  description: string; // Natural language description of relationship
  // Edge type can be computed from the traits: if from.isEnvironmental then it's environment→fitness, etc.
}

interface PlayerTraitState {
  adoptedTraits: Set<string>;
  discoveredTraits: Set<string>;
  environmentalTraits: Set<string>; // Traits present in environment

  // Current choice events
  adoptableChoices?: TraitChoice[];
  losableChoices?: TraitChoice[];
}

interface TraitChoice {
  id: string;
  options: string[]; // Trait IDs that can be chosen
  choiceType: "adopt" | "lose";
}
```

### Component Interface

```typescript
interface TraitViewProps {
  // Core data
  traits: Trait[];
  edges: TraitEdge[];

  // Player state
  playerState: PlayerTraitState;
  visibleTraits: Set<string>; // Which traits player can see

  // Callbacks
  onTraitClick: (traitId: string) => void;
  onTraitHover: (traitId: string | null) => void;
  onChoiceSelect?: (choiceId: string, selectedTraitId: string) => void;
}
```

### Graph Layout Algorithm

Use a well-established graph layout algorithm that prioritizes stability under incremental changes:

**Recommended Algorithm**: **Fruchterman-Reingold** with modifications for stability

- Well-documented force-directed algorithm
- Good at minimizing edge crossings and maintaining uniform edge lengths
- Can be made stable with position constraints

**Alternative Options**:

1. **D3 Force Simulation** - Popular, well-documented, built for web
2. **Graphviz Neato** - Stable layouts, good for static graphs
3. **CoSE (Compound Spring Embedder)** - Good for hierarchical relationships

**Implementation Approach**:

1. Treat as standard unlabeled graph (V, E) problem
2. Use force-directed layout without category clustering
3. Pin existing node positions softly (weak constraints)
4. Allow gentle drift for better layouts as graph evolves
5. Smooth transitions when adding/removing nodes/edges

**Key Priorities** (in order):

1. Minimize edge lengths
2. Avoid node overlap
3. Maintain relative positions (stability)
4. Minimize edge crossings

## User Interactions

### Selection & Viewing

- **Trait Click**: Shows detailed panel with trait information
- **Trait Hover**:
  - Highlights connected edges and nodes
  - Shows tooltip with trait name and brief description
  - For edges: Shows relationship description
- **Pan/Zoom**: Navigate large trait graphs
- **Choice Nodes**: Golden sparkly nodes indicate pending choices (future: click to open choice modal)

### Information Display

- **Hover Tooltips**:
  - Node: Name, category, brief description
  - Edge: Relationship description
  - Not discovered nodes: No information shown

- **Detail Panel** (on click):
  - Full trait description
  - Category and type (adopted/environmental)
  - Connected traits and relationships
  - For discovered traits: Why not adoptable

### Visual Feedback

- **Hover Effects**:
  - Hovered node: Slight scale increase, glow
  - Connected nodes: Highlighted
  - Connected edges: Highlighted with descriptions visible
- **Golden Sparkles**: Animated effect on choice-available nodes
- **Visibility**: Not discovered traits are very faint/ghosted

## Development Approach

### Test-Driven Development (TDD)

This component will be built using TDD principles:

1. **Write tests first** for each feature before implementation
2. **Red-Green-Refactor** cycle for all functionality
3. **Component tests** for user interactions
4. **Unit tests** for graph algorithms and state management
5. **Visual regression tests** using Storybook

### Implementation Phases

#### Phase 1: Core Visualization

1. Basic graph rendering with D3.js or React Flow
2. All node states (not discovered, discovered, adoptable, adopted, environmental)
3. Category-based styling
4. Standard force-directed layout (Fruchterman-Reingold or D3 Force)

#### Phase 2: Interactivity

1. Click and hover interactions
2. Edge/node highlighting on hover
3. Tooltips for traits and edges
4. Pan/zoom controls
5. Golden sparkle effect for choice nodes

#### Phase 3: Advanced Features

1. Smooth animations for layout changes
2. Detail panel for clicked traits
3. Choice modal integration (when that component exists)
4. Improved layout stability algorithms

#### Phase 4: Performance Optimization

- **Virtualization**: For large graphs (>100 nodes), implement viewport culling
- **Level of Detail**: Simplify distant nodes, show full detail for nearby nodes
- **Caching**: Cache layout calculations
- **Progressive Loading**: Load trait details on demand

#### Phase 5: Accessibility

- **Keyboard Navigation**: Tab through traits, arrow keys for graph traversal
- **Screen Reader**: Descriptive labels for all states and relationships
- **Color Blind**: Use patterns/shapes in addition to colors
- **Focus Indicators**: Clear visual focus states

## Testing Strategy

1. **Unit Tests**: Graph algorithms, state calculations
2. **Component Tests**: User interactions, state changes
3. **Visual Tests**: Storybook stories for different graph sizes/states
4. **Integration Tests**: Graph layout stability under changes

## Open Questions (with Answers)

1. **Q: Should the graph show all traits globally or filter based on discoverability distance?**
   - A: Show all traits visible to the player (discovered and undiscovered that are visible)

2. **Q: How should we indicate the number of active prerequisites for trait discoverability?**
   - A: No explicit number needed - the GenAI handles non-linear thresholds dynamically

3. **Q: Should edge descriptions be always visible or only on hover?**
   - A: Only on hover (descriptions are long, edge existence matters most)

4. **Q: What's the best visual indicator for traits that have multiple paths to adoption?**
   - A: Multiple edges naturally show different paths from disconnected graph regions

## Success Criteria

### User Experience

- Players can quickly understand their species' current capabilities
- Evolutionary paths and relationships are clear
- Strategic planning is enhanced by seeing the full possibility space
- Performance remains smooth with 100+ traits

### Developer Experience

- **Simple, Common Patterns**: Uses well-known graph libraries and algorithms
- **Well-Documented "Why"**: Clear comments explaining design decisions
- **Maintainable**: Simple code that's easy to refactor and extend
- **Good Meta-Documentation**:
  - Descriptive file names (e.g., `TraitGraphLayout.ts`, `TraitNodeRenderer.tsx`)
  - Clear component boundaries
  - Obvious file organization
- **Testable**: TDD approach ensures good test coverage
- **AI-Agent Friendly**: Clear naming and structure for easy navigation
