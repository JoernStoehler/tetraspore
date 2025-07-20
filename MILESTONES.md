# Tetraspore Project Milestones

## Overview
This document tracks project milestones with a focus on maintainable, test-driven development. Each milestone is broken into delegatable tasks that can be completed independently by AI agents.

## Development Principles
1. **Test-First Development**: Write tests, validate they fail, implement to pass
2. **Single Responsibility**: Each task changes only one module/component
3. **Minimal Cross-Module Changes**: Use dummy implementations when crossing boundaries
4. **Mark All TODOs**: Clearly mark dummy logic, unfinished tests, and issues
5. **High Code Quality**: Prioritize maintainability over speed
6. **AI-Friendly Documentation**: Code must be self-documenting for AI agents

## Milestone 1: Foundation & Core Architecture ✅
**Status**: Completed  
**Date**: July 20, 2025

### Completed Features
1. **Core Game Loop**
   - Turn-based system with state management
   - Event sourcing architecture (GameState → Events → Reducers)
   - Zustand store for global state management

2. **DSL System**
   - Event types: `turn_changed`, `species_added`, `species_removed`, `turn_ended`
   - Action validation system with error/warning handling
   - Reducer pattern for state updates

3. **LLM Integration Foundation**
   - LLM service interface defined
   - Mock LLM implementation for testing
   - Async action generation with validation

4. **Basic UI**
   - Simple React UI showing turn counter and species list
   - End Turn and Reset buttons
   - Loading states during LLM processing
   - Instructions panel for new users

5. **Development Infrastructure**
   - React + TypeScript + Vite setup
   - Tailwind CSS configured
   - Testing framework (Vitest + Playwright)
   - ESLint configuration
   - Multi-agent development workflow

## Milestone 2: Tree of Life Visualization 🚧
**Status**: Planning  
**Module**: `src/components/TreeOfLife/`
**Focus**: D3.js-based evolutionary tree visualization

### Task Breakdown

#### Task 2.1: Tree Data Model & Tests
**Owner**: Data Agent  
**Module**: `src/components/TreeOfLife/types.ts`
```typescript
// Define interfaces for:
- TreeNode (species with parent/children references)
- TreeLayout (positioning data)
- TreeInteraction (zoom/pan state)
```
**Tests First**:
- Test tree construction from species array
- Test parent-child relationship validation
- Test layout calculations

#### Task 2.2: Tree Component Shell
**Owner**: UI Agent  
**Module**: `src/components/TreeOfLife/TreeOfLife.tsx`
**Dependencies**: Task 2.1
```typescript
// Component that:
- Renders SVG container
- Sets up D3 zoom/pan
- Provides lifecycle hooks
- TODO: Actual tree rendering (Task 2.3)
```
**Tests First**:
- Component renders without crashing
- SVG dimensions respond to container
- Zoom/pan handlers attach correctly

#### Task 2.3: D3 Tree Layout Implementation
**Owner**: Visualization Agent  
**Module**: `src/components/TreeOfLife/layout.ts`
**Dependencies**: Task 2.1, 2.2
```typescript
// Pure functions for:
- Converting species to D3 hierarchy
- Calculating node positions
- Generating SVG paths for connections
```
**Tests First**:
- Layout algorithm with mock data
- Edge cases (single node, deep tree)
- Performance with 100+ nodes

#### Task 2.4: Tree-Store Integration
**Owner**: Integration Agent  
**Module**: `src/components/TreeOfLife/hooks.ts`
**Dependencies**: Tasks 2.1-2.3
```typescript
// Custom hooks:
- useTreeData() - transforms store species to tree
- useTreeInteractions() - zoom/pan state
```
**Tests First**:
- Hook returns correct tree structure
- Updates when species change
- Preserves zoom/pan on re-render

#### Task 2.5: Tree Integration into GameUI
**Owner**: Integration Agent  
**Module**: `src/components/GameUI.tsx`
**Dependencies**: Tasks 2.1-2.4
**Constraints**: Minimal changes only
```typescript
// Add TreeOfLife component to existing UI
// Position it appropriately
// TODO: Layout system (future milestone)
```

### Success Criteria
- [ ] All tests pass
- [ ] No ESLint errors
- [ ] Tree renders with mock data
- [ ] Zoom/pan works smoothly
- [ ] Updates when species change
- [ ] No performance issues <100 species

### Out of Scope (Future Milestones)
- Styling and visual polish
- Node interactions (click, hover)
- Animation on updates
- Species details panel
- Layout alternatives

## Milestone 3: Enhanced Species Model
**Status**: Future  
**Focus**: Extend species with attributes needed for visualization

## Milestone 4: Real LLM Integration
**Status**: Future  
**Focus**: Replace mock LLM with actual service

## Milestone 5: Basic Region System
**Status**: Future  
**Focus**: Geographic regions without visualization

## Milestone 6: UI Polish & Styling
**Status**: Future  
**Focus**: Tailwind styling, responsive design

## Milestone 7: 3D Globe Visualization
**Status**: Future  
**Focus**: Three.js planet with regions

## Milestone 8: Species-Region Integration
**Status**: Future  
**Focus**: Connect species to geographic locations

## Milestone 9: Advanced Interactions
**Status**: Future  
**Focus**: Player actions and choices

## Milestone 10: Production Ready
**Status**: Future  
**Focus**: Performance, deployment, monitoring