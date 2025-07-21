# RFC: Tree of Life View - Parallel Development Specification

## Overview

This document specifies requirements and constraints for parallel development of Tree of Life visualization prototypes. Multiple agents will work independently to create different approaches, which will later be synthesized into a final implementation.

## Core Constraints

### 1. Interface Requirements

The TreeView component MUST implement this exact interface:

```typescript
interface TreeViewProps {
  // Required: Game state data
  species: Species[];           // Current species from game state
  events: GameEvent[];          // Historical events for replay capability
  currentTurn: number;          // Current game turn
  
  // Required: Dimensions
  width: number;                // Container width
  height: number;               // Container height
  
  // Optional: Interaction callbacks
  onSpeciesClick?: (speciesId: string) => void;
  onSpeciesHover?: (speciesId: string | null) => void;
  
  // Optional: Configuration
  theme?: 'dark' | 'light';     // Default: 'dark'
  animationSpeed?: number;      // 0-1, where 0 is instant, 1 is slow
}

interface Species {
  id: string;
  name: string;
  parentId: string | null;
  birthTurn: number;
  extinctionTurn?: number;
  traits: string[];             // For future use
  population: number;           // For visualization sizing
}

interface GameEvent {
  type: 'species_added' | 'species_removed' | 'trait_evolved';
  turn: number;
  speciesId: string;
  parentSpeciesId?: string;     // For species_added
  timestamp: number;            // For animation sequencing
}
```

### 2. React Integration Requirements

- **Pure Component**: No direct Zustand store access
- **Controlled Component**: All state comes through props
- **Memoization**: Use React.memo for performance
- **Hooks**: Custom hooks should be in separate files
- **Error Boundaries**: Handle missing/invalid data gracefully

### 3. File Structure Requirements

Each prototype MUST follow this structure:
```
src/components/TreeView[PrototypeName]/
├── index.ts                  // Public exports only
├── TreeView[PrototypeName].tsx    // Main component
├── TreeView[PrototypeName].stories.tsx  // Storybook stories
├── TreeView[PrototypeName].test.tsx     // Tests
├── types.ts                  // Local type definitions
├── hooks/                    // Custom React hooks
│   └── useTreeLayout.ts      // Example: layout calculations
├── utils/                    // Pure utility functions
│   └── treeCalculations.ts   // Example: tree algorithms
└── styles.css                // Component-specific styles
```

### 4. Development Constraints

- **No External Dependencies**: Use only packages already in package.json
- **No Global State**: Component must be completely self-contained
- **TypeScript Strict**: All code must pass strict TypeScript checks
- **Performance Target**: Smooth rendering up to 500 species

## Context and Background

### Game Mechanics
- **Turn-based evolution**: Species evolve each turn
- **Branching**: Species can split into multiple children
- **Extinction**: Species can die out
- **Traits**: Species gain/lose traits (future feature)
- **Population dynamics**: Species grow/shrink over time

### Player Mental Model
- Players think of evolution as a branching tree
- Time flows downward (or left-to-right)
- Living species are "leaves" at the current turn
- Extinct species are "dead ends" in the past
- Parent-child relationships show evolutionary lineage

## User Stories

### Story 1: First Time Viewing
**As a** new player  
**I want to** understand the evolutionary tree at a glance  
**So that** I can grasp the game's core mechanic

**Acceptance Criteria:**
- Root species clearly visible
- Visual distinction between living/extinct species
- Time progression obvious (turn numbers)
- No more than 3 seconds to understand basic structure

### Story 2: Returning After Turns
**As a** player who missed several turns  
**I want to** see what changed since I last looked  
**So that** I can understand what happened

**Acceptance Criteria:**
- New species highlighted or animated
- Extinctions clearly shown
- Ability to replay events from last viewed turn
- Species maintain rough spatial positions

### Story 3: Tracking Specific Lineage
**As a** player interested in one species  
**I want to** follow its evolutionary history  
**So that** I can understand its origins and descendants

**Acceptance Criteria:**
- Click species to highlight entire lineage
- Ancestors and descendants visually connected
- Other species fade but remain visible
- Easy to return to full view

### Story 4: Understanding Current State
**As a** player making strategic decisions  
**I want to** see all living species and their relationships  
**So that** I can plan my next move

**Acceptance Criteria:**
- Living species prominently displayed
- Population sizes visible (node size, number, or color)
- Recent evolutionary activity indicated
- Traits visible on hover/click (when implemented)

### Story 5: Mobile/Small Screen Usage
**As a** player on a phone or tablet  
**I want to** navigate the tree on a small screen  
**So that** I can play anywhere

**Acceptance Criteria:**
- Touch-friendly interactions (pinch zoom, drag pan)
- Readable text at all zoom levels
- Smart clustering of dense areas
- Portrait and landscape orientation support

## Design Principles & Desiderata

### Visual Stability
- **Spatial Consistency**: Species should maintain approximate positions between renders
- **Smooth Transitions**: Changes animate rather than jump
- **Predictable Layout**: Similar structures produce similar layouts
- **No Jarring Reflows**: Adding one species shouldn't reorganize entire tree

### Information Hierarchy
1. **Primary**: Living species and their immediate parents
2. **Secondary**: Recent extinctions and evolutionary events  
3. **Tertiary**: Ancient history and distant relatives
4. **On-Demand**: Detailed stats, traits, population numbers

### Performance Characteristics
- **Initial Render**: < 100ms for 50 species
- **Animation Frame Rate**: 60fps during transitions
- **Interaction Response**: < 16ms for hover/click feedback
- **Memory Usage**: < 50MB for 500 species with full history

### Accessibility
- **Keyboard Navigation**: Tab through species, arrow keys for tree traversal
- **Screen Reader Support**: Meaningful descriptions of relationships
- **Color Blind Friendly**: Don't rely solely on color
- **High Contrast Mode**: Respect system preferences

## Technical Considerations

### Rendering Strategy Options
1. **SVG with D3.js**: Good for < 200 species
2. **Canvas 2D**: Better for 200-1000 species  
3. **WebGL**: Best for 1000+ species (future-proofing)
4. **Hybrid**: SVG for interaction, Canvas for rendering

### Layout Algorithm Options
1. **Tidier Tree**: Compact, good for balanced trees
2. **Force-Directed**: Organic look, handles any graph
3. **Sugiyama**: Minimizes edge crossings
4. **Custom Grid**: Predictable positions

### State Management
- Component receives immutable props
- Internal state only for UI concerns (hover, selection)
- Use reducers for complex state logic
- Memoize expensive calculations

### Animation Approaches
1. **CSS Transitions**: Simple position/opacity changes
2. **React Spring**: Physics-based animations
3. **Custom RAF Loop**: Full control over timing
4. **FLIP Technique**: Smooth layout transitions

## Evaluation Criteria

Prototypes will be evaluated on:

1. **Correctness** (30%)
   - Accurate representation of species relationships
   - Proper handling of edge cases
   - No data inconsistencies

2. **Performance** (25%)
   - Smooth interactions up to 500 species
   - Fast initial render
   - Efficient memory usage

3. **Usability** (25%)
   - Intuitive navigation
   - Clear visual hierarchy
   - Responsive to different screen sizes

4. **Code Quality** (20%)
   - Clean, maintainable code
   - Good TypeScript usage
   - Comprehensive tests
   - Clear documentation

## Prototype Variations to Explore

Each agent should focus on ONE primary approach:

1. **Classic Tree**: Traditional top-down or left-right tree
2. **Radial/Circular**: Species radiate from center
3. **Timeline-Based**: Strong emphasis on turn progression
4. **Force-Directed**: Physics simulation for organic layout
5. **Nested/Hierarchical**: Collapsible tree sections
6. **Matrix View**: Grid showing species vs turns

## Getting Started

```bash
# Create your prototype branch and folder
git checkout -b tree-view-prototype-[approach-name]
mkdir src/components/TreeView[ApproachName]

# Install dependencies (already available)
# React, D3, Three.js, Framer Motion all installed

# Run Storybook to develop
npm run storybook

# Run tests
npm test
```

## Example Storybook Story

```typescript
// TreeViewRadial.stories.tsx
import type { Meta, StoryObj } from '@storybook/react-vite';
import { TreeViewRadial } from './TreeViewRadial';
import { basicTree, complexTree } from '../../test-data';

const meta = {
  title: 'TreeView/Prototypes/Radial',
  component: TreeViewRadial,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TreeViewRadial>;

export default meta;

export const Basic: Story = {
  args: {
    species: basicTree.species,
    events: basicTree.events,
    currentTurn: 5,
    width: 800,
    height: 600,
  },
};
```

## Questions to Consider

1. How to handle 1000+ species efficiently?
2. Should extinct species fade over time?
3. How to show population changes?
4. What happens when tree gets too wide?
5. How to indicate "hot" areas of evolution?
6. Should we preview future possibilities?

## Success Criteria

A successful prototype will:
- ✅ Implement the required interface exactly
- ✅ Handle all user stories adequately
- ✅ Perform smoothly with test data sets
- ✅ Provide at least one innovative feature
- ✅ Include comprehensive Storybook stories
- ✅ Document design decisions in code comments

## Final Notes

- **Be Creative**: Try unconventional approaches
- **Focus on One Thing**: Better to excel at one approach than be mediocre at many
- **Document Tradeoffs**: Explain what you optimized for and why
- **Consider Mobile**: Many players will use phones
- **Think Long Term**: Game might have millions of species eventually

Good luck! May the best tree win! 🌳