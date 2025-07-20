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

## General Development Pattern: UI-First Pipeline

When adding new features, follow this pattern to gradually expand the system:

### The Full Pipeline
```
mock => events => reducer => state => store => props => component => webapp
```

### Development Order (Right to Left)
1. **Start with UI** - Design component props and interfaces
2. **Add to webapp** - Insert component with hardcoded props
3. **Style and polish** - Make it look good with hardcoded data
4. **Connect to store** - Transform state to props, hardcode state
5. **Add to DSL** - Create events/actions, update reducer
6. **Extend mock** - Generate events from mock LLM
7. **Feature complete** - Full pipeline working end-to-end

### Why This Works
- **Immediate visual feedback** - See the UI from day one
- **Clear interfaces** - Props define what data is needed
- **Incremental integration** - Move hardcoded data upstream gradually
- **Testable at each stage** - Each layer can be tested independently

### Example: Tree of Life Feature
1. Define `TreeProps` interface
2. Create `<Tree props={hardcodedData} />` in webapp
3. Style the tree visualization
4. Create `useTreeData()` hook with hardcoded state
5. Add `parent_species` to DSL events
6. Update mock to generate lineage events
7. Tree updates dynamically from game events

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
**Approach**: UI-first development, gradual pipeline integration

### Task Breakdown

#### Task 2.1: Tree Component Props & Types
**Owner**: UI Agent  
**Module**: `src/components/TreeOfLife/types.ts`
```typescript
// Define interfaces for:
export interface TreeNode {
  id: string;
  name: string;
  parentId: string | null;
  children: TreeNode[];
  depth: number;
  // Visual properties
  x?: number;
  y?: number;
}

export interface TreeOfLifeProps {
  nodes: TreeNode[];
  width: number;
  height: number;
  onNodeClick?: (node: TreeNode) => void;
}
```
**Tests First**:
- Type validation tests
- Tree structure validation (no cycles, valid parent refs)

#### Task 2.2: Tree Component Scaffold with Hardcoded Data
**Owner**: UI Agent  
**Module**: `src/components/TreeOfLife/TreeOfLife.tsx`
**Dependencies**: Task 2.1
```typescript
// Barebone component with:
- SVG container
- Hardcoded sample tree data
- Basic render of nodes as circles
- TODO: D3 tree layout (Task 2.3)
- TODO: Styling (Task 2.3)
```
**Integration**: Add to GameUI.tsx with hardcoded props
**Tests First**:
- Component renders without crashing
- Displays all nodes from props
- SVG has correct dimensions

#### Task 2.3: Tree Layout & Styling
**Owner**: Visualization Agent  
**Module**: `src/components/TreeOfLife/` (multiple files)
**Dependencies**: Tasks 2.1, 2.2
```typescript
// Implement:
- D3 tree layout algorithm
- Node positioning
- Edge/path rendering
- Zoom/pan behavior
- Visual styling (colors, sizes)
```
**Tests First**:
- Layout positions nodes correctly
- Edges connect parent-child nodes
- Zoom/pan transforms work
- Style application tests

#### Task 2.4: State-to-Props Transformation
**Owner**: Data Agent  
**Module**: `src/components/TreeOfLife/hooks.ts`
**Dependencies**: Tasks 2.1-2.3
```typescript
// Create useTreeData hook that:
- Returns hardcoded tree structure (for now)
- TODO: Transform actual game state (Task 2.5)
```
**Update**: GameUI to use hook instead of hardcoded props
**Tests First**:
- Hook returns valid tree structure
- Tree has expected nodes

#### Task 2.5: DSL Extension for Species Lineage
**Owner**: DSL Agent  
**Module**: `src/dsl/types.ts` and related files
**Dependencies**: Task 2.4
```typescript
// Extend DSL with:
- parent_species field in species_added event
- Species state to track lineage
- Reducer logic for tree building
```
**Tests First**:
- Event validation includes parent_species
- Reducer builds correct parent-child relationships
- State maintains species tree

#### Task 2.6: Mock LLM Species Generation
**Owner**: LLM Agent  
**Module**: `src/llm/mock.ts`
**Dependencies**: Task 2.5
```typescript
// Update mock to:
- Generate species with parent relationships
- Create branching evolution patterns
- Remove hardcoded data from Task 2.4
```
**Tests First**:
- Mock generates valid parent references
- Creates reasonable evolution patterns
- No orphaned species

### Success Criteria
- [ ] Tree component renders with hardcoded data (Task 2.2)
- [ ] Tree has proper D3 layout and styling (Task 2.3)
- [ ] Component uses store hook for data (Task 2.4)
- [ ] DSL supports species lineage (Task 2.5)
- [ ] Mock LLM generates tree structure (Task 2.6)
- [ ] Full pipeline works: mock → events → state → UI

### Out of Scope (Future Milestones)
- Node interactions beyond basic click
- Animation on updates
- Species details panel
- Alternative tree layouts
- Performance optimization

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