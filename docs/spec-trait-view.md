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
  edgeType: EdgeType; // Type of influence
}

enum EdgeType {
  AdoptedToDiscovered = "adopted_to_discovered", // Having trait A reveals trait B
  AdoptedToFitness = "adopted_to_fitness", // Having trait A affects fitness of B
  EnvironmentToFitness = "environment_to_fitness", // Environmental trait affects fitness
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

Use a force-directed graph layout optimized for stability:

1. **Stable positioning**: Nodes maintain positions between turns to aid recognition
2. **Category clustering**: Group nodes by category into loose regions
3. **Force constraints**:
   - Gentle repulsion between nodes to prevent overlap
   - Mild attraction along edges to minimize edge length
   - Environmental traits anchored to periphery
   - Adopted traits gravitate toward center
4. **Smooth animations**: When adding new nodes/edges, animate the layout adjustment

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

## Implementation Priorities

### Phase 1: Core Visualization

1. Basic graph rendering with D3.js or React Flow
2. All node states (not discovered, discovered, adoptable, adopted, environmental)
3. Category-based styling
4. Force-directed layout with stability

### Phase 2: Interactivity

1. Click and hover interactions
2. Edge/node highlighting on hover
3. Tooltips for traits and edges
4. Pan/zoom controls
5. Golden sparkle effect for choice nodes

### Phase 3: Advanced Features

1. Smooth animations for layout changes
2. Detail panel for clicked traits
3. Choice modal integration (when that component exists)
4. Performance optimization for large graphs
5. Keyboard navigation support

## Performance Considerations

- **Virtualization**: For large graphs (>100 nodes), implement viewport culling
- **Level of Detail**: Simplify distant nodes, show full detail for nearby nodes
- **Caching**: Cache layout calculations per species
- **Progressive Loading**: Load trait details on demand

## Accessibility

- **Keyboard Navigation**: Tab through traits, arrow keys for graph traversal
- **Screen Reader**: Descriptive labels for all states and relationships
- **Color Blind**: Use patterns/shapes in addition to colors
- **Focus Indicators**: Clear visual focus states

## Testing Strategy

1. **Unit Tests**: Graph algorithms, state calculations
2. **Component Tests**: User interactions, state changes
3. **Visual Tests**: Storybook stories for different graph sizes/states
4. **Performance Tests**: Rendering speed with large graphs

## Open Questions

1. Should the graph show all traits globally or filter based on discoverability distance?
2. How should we indicate the number of active prerequisites for trait discoverability?
3. Should edge descriptions be always visible or only on hover?
4. What's the best visual indicator for traits that have multiple paths to adoption?

## Success Criteria

- Players can quickly understand their species' current capabilities
- Evolutionary paths and requirements are clear
- Strategic planning is enhanced by seeing the full possibility space
- Performance remains smooth with 100+ traits
