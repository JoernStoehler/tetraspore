# Tetraspore Development Conventions

This document defines the development conventions for the Tetraspore project. All contributors (human and AI) should follow these conventions to maintain consistency and quality.

## Table of Contents

1. [Code Style Conventions](#code-style-conventions)
2. [Test-Driven Development](#test-driven-development)
3. [Code Documentation](#code-documentation)
4. [Dependency Management](#dependency-management)
5. [General Documentation](#general-documentation)
6. [AI Agent Conventions](#ai-agent-conventions)
7. [File-Specific Conventions](#file-specific-conventions)

## Code Style Conventions

### TypeScript & React

1. **File Organization**

   ```
   src/components/ComponentName/
   ├── index.ts               # Public exports only
   ├── ComponentName.tsx      # Main component
   ├── ComponentName.test.tsx # Tests
   ├── ComponentName.stories.tsx # Storybook
   ├── types.ts              # TypeScript interfaces
   ├── hooks.ts              # Custom hooks
   └── utils.ts              # Helper functions
   ```

2. **Component Structure**

   ```typescript
   import { type FC } from 'react';

   interface ComponentNameProps {
     // Props contain only logical/game data
     // No visual details in props
   }

   export const ComponentName: FC<ComponentNameProps> = ({
     // destructured props
   }) => {
     // hooks first
     // derived state
     // handlers
     // early returns for edge cases

     return (
       <div className="semantic-tailwind-classes">
         {/* JSX */}
       </div>
     );
   };
   ```

3. **TypeScript Rules**
   - **Never use `any`** - use `unknown` and narrow down
   - Define explicit return types for functions
   - Use `interface` for component props, `type` for unions/intersections
   - Prefer `const` assertions for literals
   - Use strict null checks

4. **Naming Conventions**
   - Components: PascalCase (`GameBoard`, `PlanetView`)
   - Hooks: camelCase with `use` prefix (`useGameState`, `usePlanetData`)
   - Constants: UPPER_SNAKE_CASE (`MAX_PLANETS`, `TICK_DURATION`)
   - Files: match export name (`GameBoard.tsx` exports `GameBoard`)
   - Test files: `*.test.tsx` or `*.test.ts`

5. **Import Order**

   ```typescript
   // 1. External dependencies
   import React from "react";
   import { motion } from "framer-motion";

   // 2. Internal absolute imports
   import { useGameStore } from "@/stores/gameStore";

   // 3. Relative imports
   import { Button } from "../Button";

   // 4. Style imports
   import "./styles.css";

   // 5. Type imports
   import type { Planet } from "@/types";
   ```

6. **State Management**
   - UI state: Zustand store (not local React state for shared UI state)
   - Game state: Event sourcing with aggregates
   - Never mix UI and game state
   - Use selectors to prevent unnecessary re-renders
   - Example:

     ```typescript
     // Good - selective subscription
     const view = useUIStore((state) => state.currentView);

     // Bad - subscribes to all changes
     const store = useUIStore();
     ```

## Test-Driven Development

### Why We Test

1. **Confidence in Changes** - Refactor without fear
2. **Documentation** - Tests show how code should be used
3. **Design Tool** - Writing tests first improves API design
4. **AI-Friendly** - Tests help AI agents understand expected behavior

### Test Lifecycle

1. **Red Phase** - Write failing test for new feature
2. **Green Phase** - Write minimal code to pass
3. **Refactor Phase** - Improve code while keeping tests green

### Testing Tools

- **Unit Tests**: Vitest + React Testing Library
- **Integration Tests**: Vitest with mock services
- **E2E Tests**: Playwright
- **Component Development**: Storybook

### Testing Conventions

```typescript
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  // Group related tests
  describe('when rendered with default props', () => {
    it('displays the expected content', () => {
      render(<ComponentName />);
      expect(screen.getByText('Expected Text')).toBeInTheDocument();
    });
  });

  describe('when user interacts', () => {
    it('handles click events correctly', async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<ComponentName onClick={handleClick} />);
      await user.click(screen.getByRole('button'));

      expect(handleClick).toHaveBeenCalledOnce();
    });
  });
});
```

### Test Best Practices

1. **Test behavior, not implementation**
2. **Use semantic queries** (`getByRole`, `getByLabelText`)
3. **One assertion per test** (when reasonable)
4. **Descriptive test names** that read like sentences
5. **AAA Pattern**: Arrange, Act, Assert
6. **Mock external dependencies** at test boundaries

## Code Documentation

### Documentation Philosophy

- **Document the "why", not the "what"** - code shows what, comments explain why
- **Write for newcomers** - assume smart developers who are new to the codebase
- **AI-agent friendly** - explicit, clear, spell out implications

### Comment Conventions

```typescript
/**
 * Calculates evolution pressure based on environmental factors.
 *
 * Why: Evolution pressure needs to consider multiple factors to create
 * realistic species adaptation. This uses a weighted formula based on
 * research from evolutionary biology simulations.
 *
 * @param temperature - Current region temperature in Celsius
 * @param resources - Available resources (0-1 normalized)
 * @returns Evolution pressure coefficient (0-10 scale)
 */
function calculateEvolutionPressure(
  temperature: number,
  resources: number,
): number {
  // Temperature creates pressure outside optimal range (15-25°C)
  // This models how extreme climates force adaptation
  const tempPressure = Math.abs(temperature - 20) / 10;

  // Resource scarcity increases pressure non-linearly
  // Based on findings that evolution accelerates under stress
  const resourcePressure = Math.pow(1 - resources, 2) * 5;

  return Math.min(tempPressure + resourcePressure, 10);
}
```

### Documentation Requirements

1. **Public APIs** - Always document with JSDoc
2. **Complex Logic** - Explain the reasoning
3. **Non-obvious Decisions** - Document trade-offs
4. **Performance Optimizations** - Explain why needed
5. **Workarounds** - Link to issue/reason

## Dependency Management

### When to Add Dependencies

1. **Get Permission First** - Ask project owner before adding
2. **Provide Context** - Explain the need and alternatives
3. **Evaluate Options** - Compare size, maintenance, popularity

### Dependency Selection Criteria

```markdown
When proposing a dependency, provide:

1. **Problem it solves**
   - Current limitation
   - Why it can't be solved in-house
2. **Options considered**
   - Option A: [name] - pros/cons
   - Option B: [name] - pros/cons
   - Recommendation and why
3. **Impact assessment**
   - Bundle size impact
   - Type definitions available?
   - Maintenance status
   - License compatibility
```

### Approved Dependencies

- **State**: Zustand (not Redux - too much boilerplate)
- **Animation**: Framer Motion
- **3D**: Three.js + React Three Fiber
- **Data Viz**: D3.js (for complex visualizations)
- **Validation**: Zod

## General Documentation

### When to Document

1. **Architecture Decisions** - Document in `docs/rfc/`
2. **Complex Systems** - Create guide in `docs/`
3. **API Contracts** - Document in code and `docs/api/`
4. **Processes** - Document in relevant style guide

### Documentation Standards

````markdown
# Document Title

Brief description of what this covers.

## Overview

High-level explanation of the system/process.

## Key Concepts

- **Concept 1**: Definition and importance
- **Concept 2**: How it relates to the system

## Implementation

### Step 1: Clear Action

Explanation of what to do and why.

```typescript
// Code example if relevant
```
````

### Common Pitfalls

- **Pitfall 1**: What goes wrong and how to avoid it
- **Pitfall 2**: Why this happens and the fix

## Examples

Real-world usage examples.

````

### Removing Outdated Docs

- **ASAP Removal** - Delete false information immediately
- **Update References** - Fix all links to removed docs
- **Document Removal** - Note in commit why removed

## AI Agent Conventions

### CLAUDE.md Guidelines

1. **Project Overview** - Current state and purpose
2. **Quick Start** - Essential commands
3. **Critical Guidelines** - Must-follow rules
4. **Learning Logs** - Add new discoveries with dates
5. **Common Mistakes** - Document pitfalls to avoid

### Writing AI Instructions

```markdown
## Task: Component Implementation

### Context
[Why this task exists and its importance]

### Requirements
1. **Specific requirement** - Details and constraints
2. **File locations** - Exact paths to modify
3. **Interfaces** - TypeScript definitions to implement

### Implementation Order
1. First create types in `src/types/`
2. Then implement component in `src/components/`
3. Add tests
4. Create Storybook story

### Acceptance Criteria
- [ ] Tests pass
- [ ] No TypeScript errors
- [ ] Follows existing patterns
````

### AI Agent Best Practices

1. **Be Explicit** - Spell out all implications
2. **Provide Context** - Why, not just what
3. **Give Examples** - Show correct patterns
4. **Set Boundaries** - What NOT to do
5. **Enable Learning** - Encourage updating CLAUDE.md

## File-Specific Conventions

### JSON Files

```json
{
  "name": "descriptive-name",
  "version": "0.0.0",
  "config": {
    "nested": "use 2-space indentation",
    "arrays": [
      "one item per line for readability",
      "especially for long arrays"
    ]
  }
}
```

### Configuration Files

1. **Environment Variables**
   - Development: `.devcontainer/.env`
   - Never commit secrets
   - Document all variables in `.env.example`

2. **Build Configuration**
   - Comment non-obvious settings
   - Group related options
   - Link to documentation

3. **CI/CD Configuration**
   - Name steps clearly
   - Add comments for complex logic
   - Fail fast on errors

### Dockerfile Conventions

```dockerfile
# Use specific versions, not latest
FROM node:20.11-alpine

# Document why each layer exists
# Install only production dependencies first for better caching
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Then copy source and build
COPY . .
RUN npm run build

# Document exposed ports and volumes
EXPOSE 3000
# Port 3000: Vite dev server
```

## Enforcement

These conventions are enforced through:

1. **ESLint** - Code style rules
2. **Prettier** - Formatting
3. **TypeScript** - Type checking
4. **Husky** - Pre-commit hooks
5. **CI/CD** - Automated checks
6. **Code Review** - Human and AI review

## Additional Conventions

### Error Handling Strategy

Tetraspore follows a layered error handling approach with consistent patterns across all components and services.

#### 1. Error Casting Utility

Always use the standardized error casting function to ensure consistent error handling:

```typescript
// src/utils/errors.ts
export function toError(
  error: unknown,
  fallbackMessage = "An unknown error occurred",
): Error {
  if (error instanceof Error) return error;
  if (typeof error === "string") return new Error(error);
  return new Error(fallbackMessage);
}

// Usage throughout codebase
setError(toError(err, "Failed to load cutscene"));
```

#### 2. Error Boundaries

**Application-Level Error Boundary**

- Wrap the entire app with a global error boundary
- Provide user-friendly error reporting and recovery options
- Include error reporting to monitoring service

**Component-Level Error Boundaries**

- Use for protecting component subtrees that handle risky operations
- Place at strategic boundaries (feature modules, async data loaders)
- Always provide meaningful fallback UI with recovery actions
- Include user-friendly error messages and retry mechanisms

**Error Boundary Placement Strategy**:

```
App
├── GlobalErrorBoundary (catches all unhandled React errors)
│   ├── CutsceneErrorBoundary (protects cutscene features)
│   ├── ActionErrorBoundary (protects action processing)
│   └── AssetErrorBoundary (protects asset generation)
```

#### 3. Error Logging Strategy

**Development Logging**

```typescript
// Use structured logging with context
console.error("Action processing failed", {
  actionId,
  actionType,
  error: error.message,
  stack: error.stack,
  timestamp: new Date().toISOString(),
});
```

**Production Logging**

- No console statements in production builds
- Use centralized error reporting service
- Include component stack traces and user context
- Implement log levels: ERROR, WARN, INFO, DEBUG

#### 4. Component Error Handling Patterns

**Hook Error Handling**

```typescript
// Custom hooks should return error state
const useActionProcessor = () => {
  const [error, setError] = useState<Error | null>(null);

  const processAction = async (action: Action) => {
    try {
      setError(null);
      await actionService.process(action);
    } catch (err) {
      const error = toError(err, "Failed to process action");
      setError(error);
      logError("Action processing failed", { actionId: action.id, error });
    }
  };

  return { processAction, error };
};
```

**Component Error State**

```typescript
// Components should handle error display consistently
const ActionComponent: FC<ActionComponentProps> = ({ actionId }) => {
  const { processAction, error } = useActionProcessor();

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={() => processAction(actionId)}
        fallbackMessage="Unable to process action"
      />
    );
  }

  // Normal component rendering
};
```

#### 5. Service Layer Error Handling

**Retry Strategy with Exponential Backoff**

```typescript
// Follow BaseExecutor pattern for retryable operations
const retryWithBackoff = async <T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000,
): Promise<T> => {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = toError(error);

      if (attempt === maxRetries) {
        throw lastError;
      }

      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};
```

**Error Type Hierarchy**

- Extend existing custom error types for specific domains
- Use `retryable` flags for automatic retry decisions
- Include context information in error objects

#### 6. Error Recovery Strategies

**UI Error Recovery**

- Provide specific retry actions for different error types
- Show degraded functionality when possible
- Cache successful states for fallback display
- Guide users to alternative actions when operations fail

**Data Error Recovery**

- Use cached data when network requests fail
- Implement offline-first patterns for critical features
- Provide clear indicators when using stale data

#### 7. Error Message Standards

**User-Facing Messages**

- Use consistent, non-technical language
- Provide actionable guidance when possible
- Include contact information for persistent issues
- Avoid exposing internal error details

**Developer Messages**

- Include full context (action IDs, user IDs, timestamps)
- Preserve original error messages and stack traces
- Add debugging information for quick issue resolution

#### 8. Validation Error Patterns

**Schema Validation with Zod**

```typescript
// Use consistent validation error handling
const validateAction = (data: unknown): Action => {
  try {
    return ActionSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Invalid action data", error.errors);
    }
    throw toError(error, "Action validation failed");
  }
};
```

#### 9. Async Operation Error Handling

**Promise-based Operations**

```typescript
// Always handle both success and error cases
const loadCutscene = async (id: string): Promise<Cutscene> => {
  const controller = new AbortController();

  try {
    const response = await fetch(`/api/cutscenes/${id}`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Failed to load cutscene: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    // Handle AbortError specifically
    if (error.name === "AbortError") {
      throw new Error("Cutscene loading was cancelled");
    }

    throw toError(error, "Failed to load cutscene");
  } finally {
    // Cleanup logic
    controller.abort();
  }
};
```

#### 10. Testing Error Scenarios

**Error Boundary Testing**

```typescript
// Test error boundaries with intentional errors
it('catches and displays error when child component throws', () => {
  const ThrowingComponent = () => {
    throw new Error('Test error');
  };

  render(
    <CutsceneErrorBoundary>
      <ThrowingComponent />
    </CutsceneErrorBoundary>
  );

  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
});
```

**Error Hook Testing**

```typescript
// Test error state management in custom hooks
it("handles service errors correctly", async () => {
  const mockError = new Error("Service failure");
  vi.mocked(actionService.process).mockRejectedValue(mockError);

  const { result } = renderHook(() => useActionProcessor());

  await act(async () => {
    await result.current.processAction(mockAction);
  });

  expect(result.current.error).toEqual(mockError);
});
```

### Mock Data Organization

1. **Location**
   - Development mocks: `src/mocks/`
   - Test fixtures: `src/__fixtures__/`
   - Component-specific mocks: `ComponentName/mocks.ts`

2. **Naming**
   - Prefix with `mock` for clarity
   - Group by feature/domain

### Logging Strategy

1. **Development**
   - Use structured logging (no console.log in production code)
   - Implement logging service interface
   - Use log levels appropriately

2. **Production**
   - No console statements
   - Use error reporting service
   - Include context in error reports

### Async Operation Patterns

1. **Promise Handling**

   ```typescript
   // Prefer async/await over .then()
   const result = await operation();

   // Handle loading states explicitly
   const [isLoading, setIsLoading] = useState(true);
   ```

2. **Cleanup**
   - Always cleanup subscriptions/timers
   - Use abort controllers for cancellable operations
   - Handle component unmounting

### Performance Decisions

1. **When to Document**
   - Non-obvious optimizations
   - Trade-offs made for performance
   - Why specific algorithms were chosen

2. **Example**
   ```typescript
   // Performance: Using Map instead of object for O(1) lookups
   // with frequent additions/deletions
   const cache = new Map<string, CachedItem>();
   ```

## Updates

This document is living and should be updated when:

- New patterns emerge
- Better practices are discovered
- Tools or dependencies change
- Team decisions are made

Last updated: 2025-01-25
