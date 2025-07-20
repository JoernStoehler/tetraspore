# Tetraspore Project Milestones

## Overview
This document tracks project milestones with a focus on maintainable, test-driven development. Each milestone is broken into delegatable tasks that can be completed independently by AI agents.

## How to Use This Document

### For AI Agents Reading This
1. **Find your assigned task** by searching for your agent type (Data Agent, UI Agent, etc.)
2. **Read ALL dependencies** before starting - you cannot begin until dependencies are complete
3. **Follow the task specification EXACTLY** - do not add extra features or improvements
4. **Create all files in the specified module path** - do not deviate from the structure
5. **Mark your task as complete** by updating this document when ALL success criteria are met

### For Orchestrators Adding Milestones/Tasks

#### Milestone Structure
```markdown
## Milestone N: [Clear Feature Name]
**Status**: Planning|In Progress|Completed  
**Module**: `src/path/to/module/`  (if applicable)
**Focus**: One-sentence description of the milestone's purpose
**Dependencies**: List other milestones that must be complete first
```

#### Task Structure
```markdown
#### Task N.M: [Specific Component/Feature]
**Owner**: [Agent Type] Agent  
**Module**: `exact/file/path.ts`  
**Dependencies**: Task N.X, N.Y (list all tasks that MUST be complete first)
**Constraints**: Any limitations or rules for this task
```

#### Task Specification Must Include:
1. **Exact file paths** - No ambiguity about where code goes
2. **Clear interfaces** - If creating types/interfaces, show the structure
3. **Test requirements** - List specific test cases that must pass
4. **TODO markers** - Explicitly state what should be marked as TODO
5. **Integration points** - How this connects to other modules (if at all)

### Writing Rules for Tasks

1. **Test-First Development**
   - ALWAYS write tests before implementation
   - Tests must fail initially (proves they're testing something)
   - Implementation is complete when all tests pass
   - If tests need adjustment, document WHY in comments

2. **Single Module Responsibility**
   - Each task modifies files in ONE module only
   - Exception: Integration tasks can modify multiple modules
   - If you need to touch another module, create a separate task

3. **Dummy Implementations**
   - When you need something from another module that doesn't exist yet:
     ```typescript
     // TODO: Replace with actual implementation from Task X.Y
     const dummyFunction = () => { return []; }
     ```
   - ALWAYS mark with TODO and reference the task that will implement it

4. **Cross-Module Communication**
   - Use interfaces/types for contracts between modules
   - Create the interface in the module that CONSUMES it
   - The providing module must implement that exact interface

5. **Code Quality Standards**
   - Every function must have a clear single purpose
   - Every interface must have JSDoc comments explaining its use
   - Every file must have a header comment explaining its role
   - No magic numbers - use named constants
   - No any types - use unknown and narrow it down

6. **Error Handling**
   - Never use try/catch to hide errors during development
   - Throw errors with descriptive messages for impossible states
   - Use Result types or null returns for expected failures
   - Document error cases in function comments

7. **File Organization**
   ```
   src/
   └── components/
       └── TreeOfLife/
           ├── index.ts          (public exports only)
           ├── TreeOfLife.tsx    (main component)
           ├── TreeOfLife.test.tsx
           ├── types.ts          (interfaces and types)
           ├── hooks.ts          (custom React hooks)
           ├── utils.ts          (pure helper functions)
           └── utils.test.ts
   ```

8. **Import Rules**
   - Use absolute imports from `src/`
   - Group imports: React, external libs, internal modules, types
   - No circular dependencies - structure to avoid them

9. **State Management**
   - Components don't directly access Zustand store
   - Use custom hooks that return only needed data
   - Keep component logic pure and testable

10. **Testing Requirements**
    - Unit tests for all pure functions
    - Component tests for all React components
    - Integration tests for store interactions
    - Mock external dependencies (including Zustand)
    - Test error cases and edge conditions

### Common Pitfalls to Avoid

1. **Scope Creep**
   - ❌ "While I'm here, I'll also improve..."
   - ✅ Do ONLY what the task specifies

2. **Premature Optimization**
   - ❌ Complex performance optimizations
   - ✅ Simple, readable code that works

3. **Assuming Implementation**
   - ❌ "The other module probably exports..."
   - ✅ Check the exact interface or use TODO

4. **Breaking Existing Tests**
   - ❌ Modifying tests to make them pass
   - ✅ Fix your implementation to satisfy tests

5. **Forgetting Edge Cases**
   - ❌ Only testing the happy path
   - ✅ Test empty arrays, null values, errors

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