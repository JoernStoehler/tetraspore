# Tetraspore Game Specification

## Overview

Tetraspore is a single-player evolution and civilization game where players guide a species from primitive origins through biological evolution to technological singularity. The game features dynamically generated content via LLMs, with AI-controlled competitor species.

### Core Gameplay Loop
1. Player receives dynamically generated events with multiple choices
2. Player makes selections across various decision dimensions
3. Player submits turn
4. LLM processes all players' choices and generates new game state
5. New events and outcomes are presented

### Game Phases
1. **Biological Evolution** (MVP focus): Guide species through evolutionary stages
2. **Cultural Evolution** (Future): 4X-style gameplay with limited influence over civilization
3. **Technological Singularity** (Future): Reach interstellar capabilities

## Architecture

### Event Sourcing
The game uses event sourcing as its core architecture:
- Game history is an append-only event log
- Current state is a projection of all events
- Events are produced by player actions or LLM responses
- Event log is reordered for LLM consumption (by in-game time/category)

### Technology Stack
- **Frontend**: React + TypeScript + Vite
- **State Management**: Zustand (functional, minimal boilerplate)
- **Styling**: Tailwind CSS
- **API Layer**: Express.js (thin wrapper for LLM calls)
- **Persistence**: localStorage (MVP), potential backend storage later
- **Deployment**: TBD at v1.0.0

### State Types
- **Game State**: Persistent, stored in localStorage
- **UI State**: Transient, in-memory only (selected tabs, modals, etc.)

## Data Model

### Event Types
```typescript
type GameEvent = 
  | {
      type: 'CREATE_SPECIES'
      name: string
      description: string
      imagePrompt: string
      parentSpecies?: string  // For evolution tree
      evolutionYear: number
      time: number
    }
  | {
      type: 'EXTINCT_SPECIES'
      speciesName: string
      reason?: string
      time: number
    }
  | {
      type: 'SPECIES_ENTERS_REGION'
      speciesName: string
      regionName: string
      time: number
    }
  | {
      type: 'SPECIES_LEAVES_REGION'
      speciesName: string
      regionName: string
      time: number
    }
  | {
      type: 'CREATE_REGION'
      name: string
      description: string
      imagePrompt: string
      center: { lat: number, lon: number }  // Spherical coordinates
      weight?: number  // For weighted Voronoi if needed
      time: number
    }
  | {
      type: 'CREATE_FEATURE'
      name: string  // e.g. "Apex Predation: Munchus hunts Fishies"
      description: string
      category: 'ecology' | 'geology' | 'technology' | 'culture'
      regionName: string  // Features belong to regions
      time: number
    }
  | {
      type: 'DELETE_FEATURE'
      featureName: string
      regionName: string
      time: number
    }
  | {
      type: 'CHOICE_SELECTED'
      choiceId: string
      playerId: string
      selection: number[]  // Multi-dimensional choices
      time: number
    }
  | {
      type: 'TURN_PROCESSED'
      turnNumber: number
      outcomes: any[]  // LLM-generated results
      time: number
    }
```

### Projected State (Built from Events)
```typescript
interface GameState {
  species: Map<string, Species>
  regions: Map<string, Region>
  features: Map<string, Feature>
  activeChoices: Choice[]
  currentTurn: number
  gamePhase: 'biological' | 'cultural' | 'technological'
}

interface Species {
  name: string
  description: string
  imagePrompt: string
  parentSpecies?: string
  evolutionYear: number
  extinct: boolean
  regions: Set<string>  // Where this species lives
}

interface Region {
  name: string
  description: string
  imagePrompt: string
  center: { lat: number, lon: number }
  weight?: number
  adjacentRegions: Set<string>  // Computed from Voronoi
  species: Set<string>
  features: Set<string>
}

interface Feature {
  name: string
  description: string
  category: 'ecology' | 'geology' | 'technology' | 'culture'
  regionName: string
}
```

## UI Components

### Navigation Bar
- Top navigation: [Planet Select] [Tree of Life] [Map] [Tech Tree (future)]
- Navigation tabs sparkle when they contain pending choices
- Clean, minimal design with current view highlighted

### Tree of Life View
- **Fullscreen** visualization with time on Y-axis
- Species displayed as interactive cards connected by curved edges
- Cards show species image, name, brief stats
- **Choice Interactions**:
  - Species with choices have sparkly gold borders
  - Click species to see mutation/evolution choices
  - Preview cards for potential speciations
  - Quick action buttons on card corners (accept/deny)
- Allows interaction with entire ecosystem, not just player species

### Map View
- **3D globe** (Three.js) with spherical Voronoi regions
- **Bottom panel** appears on hover/selection:
  - Shows features and species for selected region
  - Shows global features when nothing selected
  - **Card sorting**: Open choices → Current turn choices → Other features by recency
- Clean visualization - regions colored by biome
- Uniform game lighting for clarity

### Choice System
- Choices are feature cards with additional UI
- Can appear in any view (map features, species mutations, etc.)
- Maximized cards show selectable response options
- Visual hierarchy guides player to pending decisions

### ✅ **DECIDED**: Information Architecture
- Fullscreen views with top navigation
- Context-sensitive bottom panel for details
- Choices integrated into relevant views (not separate)
- Visual sparkles guide attention to pending decisions

## LLM Integration

### Input Format
- JSON representation of game state
- Reordered by in-game time for better context
- Include recent player choices and AI player states

### Output Format
- JSON with schema validation
- Array of events to apply
- Guaranteed parseability via JSON schema constraints

### Development Mode
```typescript
// Mock LLM for fast iteration
const llmService = {
  async processTurn(gameState, playerChoices) {
    if (DEV_MODE) {
      return mockEventLog[currentTurn++] || generateDefaultEvents()
    }
    return await callRealLLM(gameState, playerChoices)
  }
}
```

### 🔴 **NEEDS DECISION**: LLM Provider
- Which LLM API? (OpenAI, Anthropic, etc.)
- Cost considerations for long game sessions
- Response time requirements
- Prompt caching strategies

## MVP Scope

### Included
- Biological evolution phase only
- Tree of Life visualization
- 2D Region Map
- Basic choice card system
- Event sourcing with localStorage
- Mock LLM mode for development

### Excluded (Future Features)
- Cultural/technological phases
- Complex spatial movement (army figurines, etc.)
- Multiplayer support
- Authentication/user accounts
- Save file management beyond localStorage

## Technical Considerations

### ✅ **DECIDED**: Region Representation
- **Spherical Voronoi tessellation** based on lat/lon center points
- Natural borders without manual adjacency specification
- Handles polar regions correctly
- Easy 2D projection for map view
- Optional weighted Voronoi for variable region sizes

### 🔴 **NEEDS DECISION**: Image Generation
- When/how to generate images for species and regions?
- Caching strategy for generated images
- Fallback for failed generations
- Style consistency across images

### 🔴 **NEEDS RESEARCH**: Performance
- Event log size limits in localStorage
- Projection performance with large histories
- UI rendering optimization for complex trees/maps

### 🔴 **NEEDS DESIGN**: Choice Complexity
- How to present choices with many dimensions clearly?
- Example: A war event with choices for:
  - Military response (5 options)
  - Diplomatic stance (4 options)
  - Resource allocation (3 options)
  - Population mobilization (3 options)
- This creates 5×4×3×3 = 180 possible combinations!

## Project Structure
```
src/
  components/
    TreeOfLife/
    RegionMap/
    ChoiceCard/
  services/
    llm/          # LLM integration
    storage/      # Event log persistence
  stores/
    gameStore.ts  # Zustand store
    uiStore.ts    # Transient UI state
  types/
    events.ts     # Event type definitions
    state.ts      # State type definitions
  utils/
    projection.ts # Event → State projection
    layout.ts     # Tree/map layout algorithms
    voronoi.ts    # Spherical Voronoi computation
    mapProjection.ts # Sphere → 2D projections
```

## Development History & Decisions

*This section documents key technical decisions made during development, including alternatives considered and rationale. This helps future developers understand the project's evolution and avoid repeating past investigations.*

### Project Setup (2025-07-17)

**React Version Choice: 18.3 over 19.1**
- **Decision**: Use React 18.3.1 instead of latest React 19.1.0
- **Attempted**: Initially tried `create-vite@latest` which gave React 19
- **Reason**: AI agents (including Claude) have better training data for React 18. React 19 is very new with potential breaking changes
- **Solution**: Used `create-vite@5` to get React 18 template

**Vite Configuration**
- **Decision**: Vite 5.4.10 over Vite 7.0.4
- **Reason**: Config file compatibility - major version changes often break configurations
- **Learning**: Can't just change version numbers in package.json; config syntax changes between major versions

**Scaffolding Approach**
- **Attempted**: Looked for all-in-one templates with React + Three.js + TypeScript + Tailwind + Zustand
- **Finding**: No single template had all our requirements
- **Decision**: Start with official Vite React-TS template, add dependencies incrementally
- **Benefit**: Clean setup, no hidden configurations, full control over versions

**Port Configuration**
- **Issue**: Vite defaults to port 5173, but our .ports file expected 3000
- **Solution**: Configure Vite to read from environment variables with fallbacks
- **Code**: `port: parseInt(process.env.DEV_PORT || '3000')`

**Dependency Versions Selected**
```json
{
  "react": "^18.3.1",           // Stable, well-documented
  "three": "^0.160.0",          // Recent but established
  "@react-three/fiber": "^8.15.0",
  "zustand": "^4.4.0",          // v4 API is stable
  "tailwindcss": "^3.3.0",      // v3 is mature
  "vite": "^5.4.10",            // Excellent HMR, stable
  "typescript": "~5.6.2"        // Recent but well-supported
}
```

**Key Learnings**
1. **Version Compatibility**: Always check actual generated configs before assuming version changes will work
2. **AI Agent Compatibility**: Prefer versions that have been around 6+ months for better AI assistance
3. **Incremental Setup**: Better to start simple and add complexity than to untangle a complex template
4. **Documentation**: Document decisions immediately - future developers (including yourself) will thank you

### Configuration Management (2025-07-17)

**Environment File Strategy**
- **Decision**: Use Vite's standard env file loading instead of custom `.ports` file
- **Attempted**: Custom `.ports` file that would need manual sourcing
- **Problem**: Non-standard, requires extra tooling or scripts to load
- **Solution**: 
  - `.env.example` (committed) - Shows required variables
  - `.env` (git-ignored) - Actual values including secrets
  - `.env.local` (git-ignored) - Worktree-specific overrides
- **Benefits**:
  - Standard Vite approach, auto-loaded
  - Clear separation of secrets vs config
  - No manual sourcing needed
  - Works with git worktrees (each can have different ports)
- **Learning**: Don't commit `.env` files - it trains bad security habits

### Testing Setup (2025-07-17)

**Vitest over Jest**
- **Decision**: Use Vitest instead of Jest for testing
- **Reason**: 
  - Native Vite integration (same config, transformers)
  - Faster execution (no separate build step)
  - Jest-compatible API (familiar to AI agents)
  - Better TypeScript support out of the box
- **Setup**: Minimal config in `vitest.config.ts`, reuses Vite plugins
- **Commands**: `npm test`, `npm run test:ui`, `npm run test:coverage`

### Build Configuration

**TypeScript Node Types**
- **Issue**: Build failed with "Cannot find name 'process'" in vite.config.ts
- **Solution**: Install `@types/node` even for frontend projects
- **Learning**: Vite config runs in Node environment, needs Node types

**Port Configuration**
- **Issue**: Vite defaults to 5173, but project convention expects 3000
- **Solution**: Configure ports via environment variables in vite.config.ts
- **Note**: Vite auto-restarts when config files change

### Initial Setup Verification (2025-07-17)

**Minimal Landing Page**
- Created simple Tetraspore landing page with Tailwind
- Removed default Vite template styling
- Verified: HMR, dev server, tests, production build
- **Purpose**: Establish working DevOps before adding complexity

### Why Document Development History?

Software projects accumulate implicit knowledge over time. Without documentation:
- Developers waste time re-investigating already-explored options
- The rationale behind "weird" decisions gets lost
- New team members lack context for architectural choices
- The same mistakes get repeated

This specification serves as both a design document AND a development journal, capturing not just what we built, but why we built it this way.

## Next Steps

1. **Immediate TODO**:
   - Finalize region representation approach
   - Choose LLM provider and design prompt format
   - Create mock event data for development
   - Design UI layout and navigation

2. **Implementation Order**:
   - Basic React setup with TypeScript
   - Event sourcing system with localStorage
   - State projection logic
   - Tree of Life visualization
   - Region Map visualization
   - Choice card system
   - Turn processing flow
   - LLM integration

## Open Questions Summary

1. **UI/UX**:
   - Information architecture for multiple views?
   - How to present complex multi-dimensional choices?
   - Mobile responsiveness considerations?

2. **Technical**:
   - Which LLM provider and pricing model?
   - Region representation (hex vs Voronoi)?
   - Performance limits for event log size?
   - Image generation strategy?

3. **Game Design**:
   - Balance between player agency and randomness?
   - How many AI players? How smart should they be?
   - Win conditions beyond reaching singularity?
   - Difficulty settings?

---

*This specification captures the current design decisions for the Tetraspore game. Sections marked with 🔴 require further discussion and decision-making. The Development History section documents technical decisions and learnings to help future developers understand the project's evolution.*