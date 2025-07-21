# RFC: Tree of Life View - Parallel Development Specification v2

## Overview

This document provides guidance for parallel development of Tree of Life visualization prototypes. Multiple agents will work independently to create different approaches. The key principle: **be creative and propose what data/features would make your visualization amazing**.

## Core Philosophy

### Flexibility Over Restriction
- **Extend the Species type** with whatever fields would enhance your visualization
- **Propose new data structures** if they would improve the experience
- **Imagine rich interactions** that could make the game more engaging
- **Think beyond basic trees** - this is a living world simulator

### GenAI as Content Generator
Our GenAI will generate game events/actions that create rich species data. It can easily handle:
- Colors and visual themes
- Image URLs or generation prompts
- Tags and categories
- Personality traits
- Animation preferences
- Sound signatures
- Anything else you can imagine!

## Architectural Guidance

### Three-Layer Data Model

```typescript
// Layer 1: UI State (not derived from game state)
interface TreeViewUIState {
  lastViewedTurn?: number;
  selectedSpeciesId?: string;
  zoomLevel?: number;
  cameraPosition?: { x: number; y: number };
  userPreferences?: {
    animationSpeed: number;
    colorScheme: 'vibrant' | 'pastel' | 'monochrome';
    // ... whatever else makes sense
  };
}

// Layer 2: Game-Derived Aggregates (pure function of game events)
interface GameDerivedData {
  species: Species[];      // Your extended Species type!
  currentTurn: number;
  // Add whatever aggregates help your visualization
  speciesByTurn?: Map<number, Species[]>;
  evolutionaryTree?: TreeStructure;
  hotspots?: EvolutionaryHotspot[];
}

// Layer 3: Visual Events (function of game state + UI state)
interface VisualEvent {
  type: string;  // You define what types make sense
  timing: {
    startTime: number;
    duration: number;
    easing?: string;
  };
  // Examples:
  // - SpeciesBirthAnimation
  // - ExtinctionFadeOut  
  // - LineageSplit
  // - PopulationPulse
  // - DramaticReveal
}
```

### Example Extended Species Type

```typescript
// Feel free to extend this with whatever would make your viz amazing!
interface Species {
  // Basics (required)
  id: string;
  name: string;
  parentId: string | null;
  birthTurn: number;
  extinctionTurn?: number;
  
  // Visual Identity (add what you need!)
  primaryColor?: string;           // #FF6B6B
  secondaryColor?: string;         // #4ECDC4
  iconUrl?: string;                // Generated species icon
  animationStyle?: 'aggressive' | 'peaceful' | 'mysterious';
  glowIntensity?: number;          // 0-1, for magical effects
  
  // Rich Data (go wild!)
  traits?: string[];               // ['nocturnal', 'pack-hunter', 'telepathic']
  population?: number;             // For sizing/importance
  territory?: string[];            // ['deep-ocean', 'volcanic-vents']
  soundSignature?: string;         // URL to generated sound
  emotionalProfile?: {
    aggression: number;
    curiosity: number;
    sociability: number;
  };
  
  // Relationships (beyond parent/child)
  rivals?: string[];               // Species IDs of competitors
  symbioticPartners?: string[];    // Mutual benefit relationships
  preySpecies?: string[];          // Food web connections
  
  // Anything else that would make the tree more interesting!
}
```

### Visual Event System

Your TreeView receives visual events, not raw game events:

```typescript
// Good: Visual events that know about animations
interface SpeciesBirthVisualEvent {
  type: 'species-birth';
  speciesId: string;
  parentId: string | null;
  position: { x: number; y: number };  // Pre-calculated!
  
  animation: {
    // Can look ahead! Know where species will settle
    fromPosition: { x: number; y: number };
    toPosition: { x: number; y: number };
    
    // Can be parallel! Multiple births at once
    startDelay: number;
    duration: number;
    
    // Rich visual effects
    particleEffect?: 'explosion' | 'growth' | 'magic';
    soundEffect?: string;
  };
}

// These events are computed with full knowledge of:
// - What happened before (history)
// - What happens next (look-ahead)
// - Current UI state (camera position, last viewed)
// - User preferences (animation speed)
```

## What You Should Build

### Required Components

1. **A Creative Tree Visualization** that:
   - Shows species relationships in an engaging way
   - Handles 50-500 species smoothly
   - Provides intuitive navigation
   - Feels alive and dynamic

2. **Extended Data Proposals** including:
   - What Species fields would enhance your design
   - What visual events you need
   - What UI state you track
   - What aggregations would help

3. **Storybook Stories** demonstrating:
   - Basic scenarios (5-10 species)
   - Complex scenarios (50+ species)
   - Your unique features
   - Edge cases

### File Structure (Flexible)

```
src/components/TreeView[YourApproach]/
├── index.ts                        // Your exports
├── TreeView[YourApproach].tsx     // Main component
├── TreeView[YourApproach].stories.tsx
├── types/                         // Your type extensions
│   ├── Species.ts                 // Your vision of Species
│   ├── VisualEvents.ts           // Your event types
│   └── UIState.ts                // Your UI state
├── hooks/                        // Your custom hooks
├── components/                   // Sub-components
├── utils/                       // Your algorithms
└── assets/                      // Any static assets
```

## Evaluation Criteria

### Primary (What Matters Most)

1. **Innovation** (40%)
   - Novel visualization approach
   - Creative data extensions
   - Unique interactions
   - "Wow factor"

2. **User Experience** (30%)
   - Intuitive navigation
   - Clear information hierarchy
   - Smooth animations
   - Engaging aesthetics

3. **Technical Feasibility** (30%)
   - Performance with many species
   - Clean, maintainable code
   - Realistic data requirements
   - Smart architectural choices

### Bonus Points For

- **Mobile-first design**
- **Accessibility features**
- **Sound design ideas**
- **Multiplayer considerations**
- **AI-assistant integration ideas**

## Example Approaches (Not Exhaustive!)

1. **Living Galaxy**: Species as star systems, evolution as cosmic expansion
2. **Neural Network**: Species as neurons, evolution as growing connections
3. **City Builder**: Species as buildings, evolution as urban development
4. **Music Visualizer**: Species as instruments, evolution as symphony
5. **Ecosystem Diorama**: 3D environment with species as creatures
6. **Time River**: Species as streams flowing through time
7. **Your Wild Idea**: Seriously, surprise us!

## Key Principles

### DO:
- ✅ **Extend Species** with fields that enhance your visualization
- ✅ **Create new event types** for rich animations
- ✅ **Track UI state** that improves user experience
- ✅ **Think cinematically** - this is entertainment!
- ✅ **Consider sound** even if not implemented
- ✅ **Optimize for delight** not just information

### DON'T:
- ❌ **Limit yourself** to basic tree layouts
- ❌ **Ignore performance** - should handle 500 species
- ❌ **Forget mobile** - many players use phones
- ❌ **Make it static** - evolution is dynamic!
- ❌ **Skip documentation** - explain your vision

## Practical Notes

### Hardcoding is Fine
For the prototype, you can:
- Hardcode example species with rich data
- Fake visual events to show your vision
- Mock UI state to demonstrate features
- Use placeholder images/sounds

Just make sure your architecture could work with real data.

### Architecture Validation
Ask yourself:
- Can game events generate my Species fields? (Yes if GenAI can imagine it)
- Can my visual events be computed from game + UI state? (Should be possible)
- Does my UI state stay separate from game state? (Important for multiplayer)
- Could my approach scale to 1000+ species? (Think about it)

## Getting Started

```bash
# The git worktree will be provided by workagent
# You'll already be in your branch when you start
# Just create your component folder:

APPROACH="Galaxy"  # Your approach name (capitalized)
mkdir -p src/components/TreeView${APPROACH}

# Start building!
npm run storybook
```

## Deliverable: Final Presentation Document

When you complete your prototype, create a presentation document:

**File**: `AGENT_RESULT_tree-view-prototype-[approach].md`  
(where [approach] matches your branch name suffix)

This document should be a professional ~1 day design proposal presentation that includes:

### 1. Executive Summary
- Your approach in 2-3 sentences
- Key innovation or unique selling point
- Why this visualization enhances the game

### 2. Live Demo Instructions
```markdown
## How to Experience the Prototype

1. Run `npm run storybook`
2. Navigate to TreeView > Prototypes > [Your Approach]
3. Start with the "Basic" story to understand the concept
4. Try the "Complex" story to see it handle 50+ species
5. Pay special attention to:
   - [Specific feature 1]
   - [Specific feature 2]
   - [Unique interaction pattern]
```

### 3. Key Features Walkthrough
- Screenshot or description of each major feature
- Why each feature matters for gameplay
- How players would use it

### 4. Technical Decisions
- What Species fields you added and why
- Your visual event architecture
- Performance considerations
- Mobile/accessibility approach

### 5. Edge Cases & Limitations
- Known issues or unfinished aspects
- Edge cases to test (with specific steps)
- Performance limits discovered
- Future improvements needed

### 6. Code Highlights
Point to specific files/functions that demonstrate:
- Your most innovative code
- Elegant solutions to hard problems
- Reusable patterns for the final version

### 7. Vision for Integration
- How your approach could enhance the full game
- What game features it would enable
- How it scales to endgame (1000+ species)

### Example Structure:

```markdown
# Galaxy TreeView - Design Proposal

## Executive Summary
The Galaxy TreeView reimagines evolution as cosmic expansion, with species 
as star systems connected by light streams. This creates an immediately 
graspable metaphor where players feel like gods shaping the universe.

## Live Demo
1. Run `npm run storybook`
2. Navigate to TreeView > Prototypes > Galaxy
3. Start with "Birth of a Galaxy" story
4. Notice how new species pulse into existence like supernovas
5. Try dragging to rotate the 3D galaxy view
6. Click any star to see its "constellation" (lineage)

## Key Features

### 1. Cosmic Metaphor
- Species are stars with size = population
- Evolution creates "light bridges" between stars
- Extinction = star collapse with gravitational waves

### 2. 3D Navigation
- Natural rotation with mouse/touch
- Zoom into sectors for detail
- Auto-focus on active evolution

## Technical Architecture
[...]

## Test These Edge Cases
1. Create 200+ species and verify performance
2. Rapid extinctions might cause overlapping animations
3. Mobile pinch-zoom needs refinement

## Code Highlights
- See `src/components/TreeViewGalaxy/utils/cosmicLayout.ts` for the 
  innovative force-directed 3D layout
- The `StarShader.tsx` component shows WebGL integration

## Future Vision
In the full game, players would feel like they're playing "Spore meets 
Stellaris" with this visualization. The cosmic theme could extend to the 
whole game aesthetic.
```

## Final Thoughts

We're building a game that brings evolution to life. Your TreeView is the window into this living world. Make it:

- **Beautiful** - Players should want to watch
- **Intuitive** - Information without overwhelm  
- **Alive** - Evolution never stops
- **Surprising** - Unexpected emergent patterns
- **Memorable** - Unique visual language

Remember: The "tree" in Tree of Life is metaphorical. If your best idea is a spiral, web, constellation, or something we haven't imagined yet - go for it!

Good luck, and may your visualization evolve into something amazing! 🌟
