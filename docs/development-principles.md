# Development Principles

This document outlines the core development principles and practices for the Tetraspore project.

## Core Principles

1. **Test-First Development**: Write tests, validate they fail, implement to pass
2. **Single Responsibility**: Each task changes only one module/component
3. **Minimal Cross-Module Changes**: Use dummy implementations when crossing boundaries
4. **Mark All TODOs**: Clearly mark dummy logic, unfinished tests, and issues
5. **High Code Quality**: Prioritize maintainability over speed
6. **AI-Friendly Documentation**: Code must be self-documenting for AI agents

## Code Quality Standards

### Functions
- Every function must have a clear single purpose
- Every interface must have JSDoc comments explaining its use
- Every file must have a header comment explaining its role
- No magic numbers - use named constants
- No `any` types - use `unknown` and narrow it down

### Error Handling
- Never use try/catch to hide errors during development
- Throw errors with descriptive messages for impossible states
- Use Result types or null returns for expected failures
- Document error cases in function comments

### File Organization
```
src/
└── components/
    └── ComponentName/
        ├── index.ts               (public exports only)
        ├── ComponentName.tsx      (main component)
        ├── ComponentName.test.tsx (tests)
        ├── ComponentName.stories.tsx (Storybook)
        ├── types.ts              (interfaces and types)
        ├── hooks.ts              (custom React hooks)
        ├── utils.ts              (pure helper functions)
        └── utils.test.ts         (utility tests)
```

### Import Rules
- Use absolute imports from `src/`
- Group imports: React, external libs, internal modules, types
- No circular dependencies - structure to avoid them

## React Component Guidelines

### Abstraction Boundaries
- **Props should contain only logical/game data**, not visual details
- Components decide their own internal rendering
- Parent passes what child needs to know, not how to display it

Examples:
- ✅ Pass: `items` array with data
- ❌ Don't pass: `x`, `y` coordinates (unless parent must coordinate)
- ✅ Pass: `selectedId`, `onSelect`
- ❌ Don't pass: `color`, `size` (unless part of application state)

**Exception**: Nested components that must coordinate visually
- Parent may need to pass some visual constraints
- Document WHY the exception is necessary

**Benefits**:
- Components are reusable with different visual styles
- Testing focuses on logic, not visual details
- Easier to modify visualization without changing callers

### State Management
- Components don't directly access Zustand store
- Use custom hooks that return only needed data
- Keep component logic pure and testable

## Testing Requirements

### Coverage Requirements
- Unit tests for all pure functions
- Component tests for all React components  
- Integration tests for store interactions
- Mock external dependencies (including Zustand)
- Test error cases and edge conditions

### Test Patterns
- Test user behavior, not implementation
- Cover edge cases (empty arrays, null values, errors)
- Use meaningful test descriptions
- Follow AAA pattern (Arrange, Act, Assert)

## Development Workflow

### When Implementing Features

1. **Understand Requirements**
   - Read issue/task specification completely
   - Check dependencies are satisfied
   - Ask questions if unclear

2. **Test-First Approach**
   - Write failing tests based on requirements
   - Implement to make tests pass
   - Refactor while keeping tests green

3. **Code Review Checklist**
   - All tests pass
   - No linting errors
   - Code follows project patterns
   - Documentation updated
   - No console.log statements
   - No commented-out code

### Dummy Implementations

When you need something from another module that doesn't exist yet:
```typescript
// TODO: Replace with actual implementation from Issue #X
const dummyFunction = () => { return []; }
```

Always mark with TODO and reference the issue that will implement it.

## Common Pitfalls to Avoid

### 1. Scope Creep
- ❌ "While I'm here, I'll also improve..."
- ✅ Do ONLY what the task specifies

### 2. Premature Optimization
- ❌ Complex performance optimizations
- ✅ Simple, readable code that works

### 3. Assuming Implementation
- ❌ "The other module probably exports..."
- ✅ Check the exact interface or use TODO

### 4. Breaking Existing Tests
- ❌ Modifying tests to make them pass
- ✅ Fix your implementation to satisfy tests

### 5. Forgetting Edge Cases
- ❌ Only testing the happy path
- ✅ Test empty arrays, null values, errors

## UI-First Development Pattern

When adding new features, follow this pattern:

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
6. **Extend mock** - Generate events from mock
7. **Feature complete** - Full pipeline working end-to-end

### Why This Works
- **Immediate visual feedback** - See the UI from day one
- **Clear interfaces** - Props define what data is needed
- **Incremental integration** - Move hardcoded data upstream gradually
- **Testable at each stage** - Each layer can be tested independently