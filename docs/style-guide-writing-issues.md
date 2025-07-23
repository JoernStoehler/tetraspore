# Style Guide: Writing GitHub Issues for AI Agents

This guide defines best practices for writing GitHub issues that AI agents can effectively understand and implement.

## Core Principles

### 1. Clarity Over Brevity
- Be explicit about requirements
- Use concrete examples
- Define edge cases upfront
- Spell out assumptions

### 2. Structure Over Prose
- Use consistent formatting
- Leverage markdown features
- Create scannable sections
- Minimize narrative text

### 3. Code Over Description
- Show, don't tell
- Include type definitions
- Provide usage examples
- Reference existing patterns

## Issue Structure

### Title Format
```
[Component] Action + Subject
```

Examples:
- `[Button] Add loading state animation`
- `[API] Implement user authentication endpoint`
- `[Dashboard] Create widget drag-and-drop system`

### Essential Sections

#### 1. Description
- One paragraph maximum
- State the "what" and "why"
- Link to parent epic/milestone if applicable

#### 2. Acceptance Criteria
- Use checkboxes for clear requirements
- Make criteria testable and specific
- Include non-functional requirements

#### 3. Technical Specifications
- List exact file paths
- Define interfaces/types
- Specify dependencies
- Include code examples

#### 4. Testing Requirements
- Unit test scenarios
- Integration test needs
- Manual testing steps

## Writing Guidelines

### Use Precise Language
❌ "Make the button look better"
✅ "Add hover state with 10% darker background color"

❌ "Handle errors properly"
✅ "Show toast notification for network errors, log to console for validation errors"

### Provide File Paths
❌ "Create a new component"
✅ "Create `src/components/UserProfile/UserProfile.tsx`"

❌ "Add some tests"
✅ "Create `src/components/UserProfile/UserProfile.test.tsx` with unit tests"

### Include Type Definitions
```typescript
// Always include complete interfaces
interface UserProfileProps {
  userId: string;
  onUpdate?: (user: User) => void;
  className?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}
```

### Reference Patterns
```markdown
Follow the pattern established in `src/components/Card/Card.tsx`:
- Functional component with FC type
- Props destructuring in parameters
- Tailwind classes for styling
```

## Code Examples

### Good: Specific Implementation Guidance
```typescript
// When implementing the click handler:
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault();
  
  // Disable button during loading
  setIsLoading(true);
  
  try {
    await onSubmit(formData);
  } catch (error) {
    console.error('Submit failed:', error);
    showToast({ type: 'error', message: 'Failed to submit' });
  } finally {
    setIsLoading(false);
  }
};
```

### Bad: Vague Instructions
```
Add a click handler that submits the form and handles errors.
```

## Dependency Specification

### Internal Dependencies
```markdown
## Dependencies
- Uses `Button` component from #45
- Requires `useAuth` hook from #38
- Extends `BaseCard` interface from #42
```

### External Dependencies
```markdown
## External Libraries
- react-hook-form: Form validation (already installed)
- date-fns: Date formatting (need to install)
```

## Testing Specifications

### Clear Test Scenarios
```markdown
## Test Cases
1. **Initial Render**
   - Component renders without crashing
   - Shows loading skeleton when data is undefined
   - Displays user name and email when data provided

2. **Interactions**
   - Clicking edit button calls onUpdate with user object
   - Disabled state prevents all interactions
   - Hover shows tooltip with last updated time

3. **Edge Cases**
   - Handles missing optional fields gracefully
   - Long names truncate with ellipsis
   - Invalid email shows warning icon
```

## Anti-Patterns to Avoid

### 1. Ambiguous Scope
❌ "Improve performance"
❌ "Make it work better on mobile"
❌ "Fix the bug"

### 2. Missing Context
❌ "Like the login page but for registration"
❌ "Similar to what we did last sprint"
❌ "Use the usual pattern"

### 3. Incomplete Specifications
❌ "Add validation"
❌ "Make it accessible"
❌ "Handle edge cases"

### 4. Assumed Knowledge
❌ "You know what to do"
❌ "Standard implementation"
❌ "As discussed"

## Issue Templates

### Component Task
```markdown
## Description
Create a [Component] that [does what] for [purpose].

## Acceptance Criteria
- [ ] Component renders [what] based on [props]
- [ ] Handles [interaction] by [behavior]
- [ ] Shows [state] when [condition]
- [ ] Responsive from 320px to 4K
- [ ] Keyboard accessible
- [ ] Dark mode compatible

## Technical Specifications
### Files
- `src/components/[Name]/[Name].tsx`
- `src/components/[Name]/[Name].test.tsx`
- `src/components/[Name]/[Name].stories.tsx`
- `src/components/[Name]/index.ts`

### Props Interface
```typescript
interface ComponentProps {
  // definitions
}
```

### Implementation Notes
- Use pattern from [reference component]
- Style with Tailwind utilities
- Export from index.ts

## Testing Requirements
- [ ] Unit tests: 80% coverage
- [ ] Storybook: all states documented
- [ ] Manual: test on Chrome, Firefox, Safari
```

### API Endpoint Task
```markdown
## Description
Implement [method] endpoint at [path] that [purpose].

## Acceptance Criteria
- [ ] Endpoint responds to [METHOD] requests
- [ ] Validates [inputs] according to [rules]
- [ ] Returns [response format] on success
- [ ] Returns appropriate error codes
- [ ] Includes rate limiting
- [ ] Updates OpenAPI spec

## Technical Specifications
### Endpoint
- Path: `/api/v1/[resource]`
- Method: GET/POST/PUT/DELETE
- Auth: Required/Optional

### Request Schema
```typescript
interface RequestBody {
  // fields
}
```

### Response Schema
```typescript
interface SuccessResponse {
  // fields
}
```

### Error Responses
- 400: Invalid input
- 401: Unauthorized
- 404: Resource not found
- 500: Server error

## Testing Requirements
- [ ] Unit tests for validators
- [ ] Integration tests for full flow
- [ ] Load test: 100 req/sec
```

## Checklist for Issue Authors

Before submitting an issue:
- [ ] Title follows `[Component] Action + Subject` format
- [ ] All file paths are absolute from project root
- [ ] TypeScript interfaces are complete
- [ ] Acceptance criteria are measurable
- [ ] Test scenarios are specific
- [ ] Dependencies are linked
- [ ] Examples show desired behavior
- [ ] Edge cases are documented
- [ ] No ambiguous language used

## Tips for Success

1. **Pretend the implementer has never seen the codebase** - be explicit
2. **Include "non-goals"** - what NOT to do can be as important
3. **Link to visual designs** - screenshots, Figma links, or ASCII diagrams
4. **Specify the happy path first** - then add edge cases
5. **Use consistent terminology** - define terms if needed

Remember: A well-written issue saves more time than it takes to write!