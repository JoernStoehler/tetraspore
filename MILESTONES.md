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

#### Orchestrator Responsibilities
1. **Before spawning agents**:
   - Create clear task specifications
   - Ensure dependencies are satisfied (previous tasks merged)
   - Prepare agent branches with workagent

2. **During agent execution**:
   - Monitor agent progress (use bounded loops, not input mode!)
   - Check for completion mail
   - Assist with blocked agents if needed
   - Tips: 
     - Use @file references in agent messages to preload context:
       ```bash
       workagent run --branch task/X.Y --message "Implement X. See @AGENT_BRANCH_TASK.md and @src/relevant/file.ts"
       ```
     - Monitor with bounded loops, NOT input mode:
       ```bash
       # Good: Bounded monitoring
       for i in {1..10}; do
         sleep 30
         workagent status | grep task/X.Y
         mail inbox --for main | grep "Task X.Y Complete" && break
       done
       
       # Bad: while true loops or waiting in input mode
       ```

3. **After agent completion**:
   - Review HANDOFF.md
   - Merge completed work into main
   - Clean up: `git worktree remove` and `git branch -d`
   - Update tracking documents if needed

Example cleanup sequence:
```bash
git merge task/X.Y-description
git worktree remove ../tetraspore-task-X.Y-description  
git branch -d task/X.Y-description
```

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
6. **Design decisions** - Document what has been decided and why
7. **Open questions** - List unresolved design questions with options
8. **Completion steps** - Remind agent to commit, create HANDOFF.md, and send mail

#### Writing Design Decisions and Open Questions

Each milestone should include a "Design Decisions & Open Questions" section that:

1. **Documents Decided Choices**
   - What was decided and the reasoning
   - Trade-offs that were considered
   - Constraints that influenced the decision

2. **Lists Open Questions**
   - Questions that need answers before/during implementation
   - Multiple viable options with pros/cons
   - Decisions that can be deferred until more context is available

3. **Why This Matters**
   - Prevents agents from making conflicting assumptions
   - Allows experimentation within defined boundaries
   - Creates a record of architectural evolution
   - Helps future agents understand context

Example format:
```markdown
### Design Decisions & Open Questions

#### Decided:
- **Flat data structures**: Easier to update than nested
- **Component boundaries**: Tree computes layout, caller provides topology

#### Open Questions:
1. **Layout algorithm**: D3 tree vs custom vs force-directed?
2. **State shape**: How to store for LLM read/write efficiency?
```

### Writing Rules for Tasks

1. **Test-First Development**
   - ALWAYS write tests before implementation
   - Tests must fail initially (proves they're testing something)
   - Implementation is complete when all tests pass
   - If tests need adjustment, document WHY in comments

2. **Task Completion Requirements**
   Every task MUST complete these steps before finishing:
   - [ ] All code changes committed with descriptive message
   - [ ] Branch is ready to merge (no uncommitted files)
   - [ ] HANDOFF.md created documenting the work
   - [ ] Mail sent to orchestrator or next agent
   - [ ] Agent session ends after sending mail
   
   Example completion sequence:
   ```bash
   git add -A
   git commit -m "feat: implement TreeOfLife types and tests"
   # Create HANDOFF.md
   mail send main "Task X.Y Complete" "Description. See HANDOFF.md"
   # Session ends
   ```

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

10. **React Component Abstraction Boundaries**
    - **Props should contain only logical/game data**, not visual details
    - Components decide their own internal rendering
    - Parent passes what child needs to know, not how to display it
    - Examples:
      - ✅ Pass: `nodes` array with topology
      - ❌ Don't pass: `x`, `y` coordinates (unless parent must coordinate multiple children)
      - ✅ Pass: `speciesId`, `turn`
      - ❌ Don't pass: `color`, `radius` (unless part of game state)
    - **Exception**: Nested components that must coordinate visually
      - Parent may need to pass some visual constraints
      - Document WHY the exception is necessary
    - **Benefits**:
      - Components are reusable with different visual styles
      - Testing focuses on logic, not visual details
      - Easier to modify visualization without changing callers

11. **Testing Requirements**
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

## Milestone 2: Tree of Life Visualization ✅
**Status**: Completed  
**Date**: January 20, 2025
**Module**: `src/components/TreeOfLife/`
**Focus**: D3.js-based evolutionary tree visualization
**Approach**: UI-first development, gradual pipeline integration

### Completed Features
1. **Tree Visualization Component**
   - D3.js-based evolutionary tree with zoom/pan capabilities
   - Visual representation of species evolution over turns
   - Color-coded nodes: Green (birth), Blue (alive), Red (extinction)
   - Turn numbers displayed on each node

2. **Type System for Tree Data**
   - TreeNode interface with flat parent-reference structure
   - Leveled tree design (one node per species per turn)
   - Node types for birth, alive, and extinction states

3. **Component Architecture**
   - TreeOfLife.tsx main component with D3 integration
   - layout.ts for tree layout calculations
   - hooks.ts for data transformation (currently hardcoded)
   - Comprehensive test coverage

4. **DSL Extensions**
   - Extended GameState to use Species objects instead of strings
   - Added parentId tracking for species lineage
   - Added parentSpecies field to species_added events
   - Updated reducer to handle species relationships

5. **Mock LLM Updates**
   - Enhanced mock LLM to generate species with parent relationships
   - Realistic evolution patterns over 6 turns
   - Proper extinction handling

### Known Issues / Future Work
- Tree visualization currently uses hardcoded data in hooks.ts
- TODO: Connect useTreeData hook to actual game state (deferred to Milestone 3)
- Some unit tests failing due to mock LLM refactoring (tests need updating)

### Task Breakdown

#### Task 2.1: Tree Component Props & Types
**Owner**: UI Agent  
**Module**: `src/components/TreeOfLife/types.ts`
```typescript
// Define interfaces for:
export interface TreeNode {
  id: string;
  name: string;
  parentId: string | null;  // Flat structure, no nested children
  turn: number;              // Which turn this node represents
  nodeType: 'birth' | 'alive' | 'extinction';
  speciesId: string;         // Reference to the species
}

export interface TreeOfLifeProps {
  nodes: TreeNode[];         // Flat array, topology only
  width: number;
  height: number;
  onNodeClick?: (node: TreeNode) => void;
}

// Note: Component computes x,y coordinates internally
// Note: Leveled tree - one node per species per turn
```
**Tests First**:
- Type validation tests
- Tree structure validation (no cycles, valid parent refs)
- Verify all nodes have valid turn numbers
- Ensure leveled structure (no skip-turn connections)

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
- Convert flat node array to D3 hierarchy
- Compute x,y coordinates from topology
- D3 tree layout algorithm (tidy tree)
- Edge/path rendering between turns
- Zoom/pan behavior
- Visual styling (colors, sizes, node types)
```
**Tests First**:
- Flat array converts to hierarchy correctly
- Layout assigns x,y to all nodes
- Edges connect parent-child across turns
- Zoom/pan transforms work
- Different node types styled differently

#### Task 2.4: State-to-Props Transformation
**Owner**: Data Agent  
**Module**: `src/components/TreeOfLife/hooks.ts`
**Dependencies**: Tasks 2.1-2.3
```typescript
// Create useTreeData hook that:
- Returns hardcoded flat node array (for now)
- Generates nodes for each species for each turn
- Ensures leveled structure (no skip-turn edges)
- TODO: Transform actual game state (Task 2.5)
```
**Update**: GameUI to use hook instead of hardcoded props
**Tests First**:
- Hook returns valid flat node array
- Every species has nodes for all turns it exists
- Parent references point to previous turn

#### Task 2.5: DSL Extension for Species Lineage
**Owner**: DSL Agent  
**Module**: `src/dsl/types.ts` and related files
**Dependencies**: Task 2.4
```typescript
// Extend DSL with:
- parentSpecies field in species_added event
- Update GameState to track species as objects not strings:
  species: Array<{
    id: string;
    name: string;
    parentId: string | null;
    birthTurn: number;
    extinctionTurn?: number;
  }>
- Reducer logic to maintain relationships
```
**Tests First**:
- Event validation accepts parentSpecies
- Reducer creates species objects with lineage
- State maintains parent-child relationships
- Can query descendants/ancestors

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

#### Task 2.7: Fix Post-Integration Issues ✅
**Owner**: Integration Agent  
**Module**: `src/llm/mock.test.ts`, `src/components/TreeOfLife/` test files
**Dependencies**: Tasks 2.1-2.6
**Purpose**: Fix failing tests and resolve remaining integration issues

**Specific Issues to Fix**:
1. **Mock LLM Tests** (`src/llm/mock.test.ts`):
   - Tests still expect old GameState structure with species as string array
   - Need to update to use new Species objects structure
   - Fix method signatures that now require GameState parameter

2. **Component Tests** (`src/components/TreeOfLife/*.test.tsx`):
   - React component tests failing with "document is not defined"
   - Need proper test environment setup for DOM rendering
   - May need to configure test environment or use different testing approach

3. **Integration Verification**:
   - Ensure all tests pass after fixes
   - Verify mock LLM generates proper Species objects
   - Confirm Tree visualization still works after test fixes

**Success Criteria**:
- [ ] All unit tests pass (`npm test -- --run`)
- [ ] Mock LLM tests work with new Species structure
- [ ] Component tests render without errors
- [ ] No regression in functionality

**Test Commands**:
```bash
npm test -- --run           # Run all tests
npm test mock.test         # Run just mock LLM tests
npm test TreeOfLife        # Run tree component tests
```

### Design Decisions & Open Questions

#### Decided Design Choices
1. **Abstraction Boundary**: Tree component receives only topology (nodes with parent IDs), computes coordinates internally
2. **Flat Data Structure**: Use array of nodes with parent pointers instead of recursive tree structure
   - Easier updates and transformations
   - Simpler for LLMs to generate
3. **Leveled Tree**: Every species has a node for every turn it exists
   - No skip-turn connections (T→T+2)
   - Consistent visual spacing
   - Shows continuous existence even without changes

#### Open Questions
1. **XY Layout Algorithm**
   - Option A: D3's built-in tree layout (simple, well-tested)
   - Option B: Custom algorithm for biological trees (more control)
   - Option C: Force-directed for organic look (may be unstable)
   
2. **Topology Specification**
   - Parent-only: Each node specifies only parentId (simple, no redundancy)
   - Parent+Children: Include childIds array (redundant but explicit)
   - Decision: Start with parent-only, add children if needed for performance

3. **DSL Species Storage**
   - How to store species relationships for easy LLM reading/writing?
   - Options:
     - Events carry parent info: `{ type: "species_added", name: "Bird", parentSpecies: "Dinosaur" }`
     - State tracks lineage: `species: { id: "bird-1", parent: "dino-1", ... }`
   - Challenge: LLM needs to read relationships but should only write one direction

4. **Node Generation Strategy**
   - When to create "alive" nodes vs just birth/extinction?
   - How to handle species that persist unchanged for many turns?
   - Consider: Generate nodes lazily vs eagerly creating full turn history

5. **Visual Representation**
   - How to distinguish node types visually (birth/alive/extinction)?
   - Color coding for species traits?
   - Line styles for different relationship types?

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

## Current Known Issues

### E2E Test Configuration
- **Issue**: Playwright tests may need configuration
- **Solution**: Run `npx playwright install` if E2E tests fail
- **Impact**: Low - only affects E2E testing

### Port Conflicts  
- **Issue**: Default ports (3000-3002) may be in use
- **Solution**: Override in `.env.local` (see CLAUDE.md)
- **Impact**: Low - only affects local development

### Remaining Technical Debt
- **MockLLM lint error**: Line 106 uses 'any' type (pre-existing)
- **Missing E2E tests**: No Playwright tests implemented yet
- **README references**: Points to non-existent docs (specification.md, ARCHITECTURE_DECISIONS.md, HOW_TO_ADD_FEATURES.md)