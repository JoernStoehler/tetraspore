# Trait View Specification

## Overview

The Trait View is a core visualization component in Tetraspore that displays the evolutionary and developmental pathways available to species and civilizations. It presents traits as an interconnected graph where players can observe current capabilities, potential developments, and guide evolution through strategic resource allocation.

## Purpose

### Why This Component Exists

1. **Strategic Visibility**: Players need to see the full landscape of possible developments to make informed decisions about guiding evolution
2. **Progress Tracking**: Visual representation of adopted vs. available traits shows advancement
3. **Relationship Understanding**: Graph structure reveals dependencies and evolutionary distances between traits
4. **Multi-species Comparison**: Switching between species/civilizations enables strategic planning

### Game Design Goals

- Enable "guided evolution" gameplay where players are smarter than pure Darwinian selection
- Show how traits across different domains (biological, behavioral, cultural) interconnect
- Visualize evolutionary "distance" and resource costs
- Support strategic planning by revealing blocked paths and requirements

## Visual Design

### Graph Structure

```
┌─────────────────────────────────────────────────┐
│  Species: [Dropdown Selector]                   │
├─────────────────────────────────────────────────┤
│                                                 │
│    ○ Photosynthesis          ● Tool Use        │
│   ╱ ╲                       ╱   ╲              │
│  ●   ○ Chloroplasts    ◐ Stone  ○ Metal       │
│  │    ╲                Tools     Working       │
│  ●      ○ C4 Photo.    │                      │
│ Cells    synthesis      ● Fire                 │
│                         Making                  │
│                                                 │
│  Legend:                                        │
│  ● Adopted  ◐ In-adoption  ○ Available  ⊗ Blocked │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Node States

1. **Adopted** (●): Fully integrated trait
   - Solid fill color based on category
   - Slightly larger size for emphasis

2. **In-adoption** (◐): Currently acquiring
   - Half-filled or animated fill
   - Shows progress visually

3. **Available** (○): Can be pursued
   - Outlined only, no fill
   - Category color for outline

4. **Blocked** (⊗): Too distant/costly
   - Grayed out or cross-hatched
   - Reduced opacity

### Edge Visualization

- **Thickness**: Represents evolutionary distance/difficulty
- **Style**: Solid for direct paths, dashed for complex multi-step paths
- **Color**: Gradient from source to target node categories
- **Arrows**: Show directionality of evolution

### Categories & Color Coding

```typescript
enum TraitCategory {
  Biological = "biological", // Green palette
  Behavioral = "behavioral", // Blue palette
  Technological = "technological", // Orange palette
  Cultural = "cultural", // Purple palette
  Social = "social", // Yellow palette
}
```

## Technical Architecture

### Data Structure

```typescript
interface Trait {
  id: string;
  name: string;
  category: TraitCategory;
  description: string;
  requirements: string[]; // IDs of prerequisite traits
  baseCost: number; // Base resource cost
  benefits: string[]; // Gameplay effects
}

interface TraitEdge {
  from: string; // Trait ID
  to: string; // Trait ID
  distance: number; // Evolutionary distance
  intermediateSteps?: string[]; // Required intermediate traits
}

interface SpeciesTraitState {
  speciesId: string;
  adoptedTraits: Set<string>;
  inAdoption: Map<string, number>; // trait ID -> progress %
  discoveredTraits: Set<string>;
  blockedTraits: Set<string>;
}
```

### Component Interface

```typescript
interface TraitViewProps {
  // Core data
  traits: Trait[];
  edges: TraitEdge[];

  // Current selection
  selectedSpeciesId: string;
  speciesStates: Map<string, SpeciesTraitState>;
  availableSpecies: Species[];

  // Callbacks
  onSpeciesChange: (speciesId: string) => void;
  onTraitClick: (traitId: string) => void;
  onTraitHover: (traitId: string | null) => void;
}
```

### Graph Layout Algorithm

Use a force-directed graph layout with constraints:

1. Group nodes by category into regions
2. Apply repulsion between nodes
3. Apply attraction along edges (stronger for shorter evolutionary distances)
4. Pin adopted traits near center
5. Push blocked traits to periphery

## User Interactions

### Selection & Viewing

- **Species Selector**: Dropdown/tabs to switch between species/civilizations
- **Trait Click**: Shows detailed panel with requirements, benefits, path options
- **Trait Hover**: Highlights connected traits and shows tooltip
- **Pan/Zoom**: Navigate large trait graphs

### Information Display

- **Detail Panel**: Shows on trait selection
  - Current adoption progress
  - Requirements (with met/unmet indicators)
  - Benefits when adopted
  - Shortest paths from current traits
  - Resource cost estimate

### Visual Feedback

- **Path Highlighting**: When hovering a trait, highlight possible paths
- **Requirement Lines**: Show which adopted traits enable an available trait
- **Progress Animation**: Animate fill for in-adoption traits

## Implementation Priorities

### Phase 1: Core Visualization

1. Basic graph rendering with D3.js or React Flow
2. Node states and categories
3. Species selector
4. Static layout

### Phase 2: Interactivity

1. Click and hover interactions
2. Detail panel
3. Path highlighting
4. Zoom/pan controls

### Phase 3: Advanced Features

1. Animated transitions when switching species
2. Progress animations for adoptions
3. Filtering by category
4. Search functionality
5. Comparison mode (show multiple species)

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

1. Should resource allocation be directly manipulable in this view or just visualized?
2. How should we handle traits that can be lost/abandoned?
3. Should there be a timeline view showing trait adoption history?
4. How to best visualize traits shared across multiple species?

## Success Criteria

- Players can quickly understand their species' current capabilities
- Evolutionary paths and requirements are clear
- Strategic planning is enhanced by seeing the full possibility space
- Performance remains smooth with 100+ traits
