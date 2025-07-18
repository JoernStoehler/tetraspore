# Tetraspore Feature Dependency Analysis

## Core Infrastructure (MUST BE FIRST)
These need to be on main before other work can branch off:

### Wave 0: Foundation (Sequential on main)
1. **Event System & Store Setup**
   - Event types and validation
   - Event store with localStorage
   - Zustand stores (game, ui)
   - State projection from events
   - Files: `src/types/`, `src/stores/`, `src/services/events.ts`

2. **Core Game Types**
   - Species, Region, Feature interfaces
   - Game state structure
   - Already defined in spec, just needs implementation

## Parallel Development Opportunities

### Wave 1: Can start after Wave 0 (Parallel branches)
These can all branch from main once stores exist:

1. **UI Layout & Navigation** (branch: feat/ui-layout)
   - App layout with top navigation
   - View switching (Tree, Map, Choices)
   - Basic responsive design
   - Mock data for testing
   - Dependencies: Just the store structure

2. **Choice Card Component** (branch: feat/choice-cards)
   - Card display component
   - Category filtering
   - Selection handling
   - Can use mock choices initially
   - Dependencies: Just React

3. **Tree of Life Visualization** (branch: feat/tree-viz)
   - D3.js or custom React tree
   - Feature nodes display
   - Category coloring
   - Can work with mock species data
   - Dependencies: None really

4. **LLM Service with Mocks** (branch: feat/llm-service)
   - Gemini API integration
   - Mock mode for development
   - Service interface definition
   - Dependencies: None

### Wave 2: Needs Wave 1 components (Some parallel possible)

5. **Region Map - Basic** (branch: feat/region-map-basic)
   - 2D placeholder map (not 3D yet)
   - Region display
   - Selection handling
   - Dependencies: UI Layout

6. **Game Loop & Turn Processing** (branch: feat/game-loop)
   - Turn flow implementation
   - Event generation
   - State updates
   - Dependencies: Event System, Choice Cards

### Wave 3: Integration & Polish

7. **3D Globe Visualization** (branch: feat/3d-globe)
   - Three.js setup
   - Spherical Voronoi
   - Camera controls
   - Dependencies: Region Map Basic

8. **Full LLM Integration** (branch: feat/llm-integration)
   - Connect to choice generation
   - Connect to narration
   - Dependencies: Game Loop, LLM Service

## Recommended First Wave Plan

Start these in parallel after core setup:
1. **Core Agent**: Event system + stores (on main)
2. **UI Agent**: Layout + Choice Cards 
3. **Tree Agent**: Tree of Life component
4. **LLM Agent**: Service + mocks

## Risk Mitigation

- Keep PRs small and focused
- Define interfaces clearly upfront
- Use mock data liberally
- Merge frequently to avoid drift
- If a task seems too dependent, split it

## Task Sizing

Small (1-2 hours):
- Choice Card component
- UI Layout
- LLM Service interface

Medium (2-4 hours):
- Event System
- Tree Visualization
- Game Loop

Large (4+ hours):
- 3D Globe
- Full game integration