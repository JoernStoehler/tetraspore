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
# Pick your approach name
APPROACH="galaxy"  # or "neural", "ecosystem", etc.

# Create your branch and folder
git checkout -b tree-view-prototype-$APPROACH
mkdir -p src/components/TreeView${APPROACH^}

# Start with types that inspire you
touch src/components/TreeView${APPROACH^}/types/Species.ts

# Build your vision!
npm run storybook
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
