# Write GitHub Issue

You are tasked with creating a well-structured GitHub issue for the Tetraspore project. The issue should be clear enough for an AI agent to implement independently.

## Immediate Context Loading

First, load these essential files:
- @docs/style-guide-writing-issues.md - Complete guide for writing issues
- @.github/ISSUE_TEMPLATE/task.md - Issue template to follow
- @MILESTONES.md - Current project state and patterns
- @src/components/ - See existing component patterns

## Your Task

1. **Understand the requirement** from the user
2. **Break it down** into a single, focused task (2-4 hours of work)
3. **Write a clear issue** following the template
4. **Ensure it's self-contained** with all necessary information

## Issue Writing Process

### 1. Clarify Scope
Before writing, ensure you understand:
- What exactly needs to be built
- What's in scope and what's not
- Dependencies on other work
- Expected behavior and edge cases

### 2. Use the Template
Follow the structure from @.github/ISSUE_TEMPLATE/task.md:
- Clear, specific title
- One-paragraph description
- Measurable acceptance criteria
- Complete technical specifications
- Specific testing requirements

### 3. Include Code Examples
Always provide:
```typescript
// Complete interfaces
interface ComponentProps {
  data: DataType;
  onAction: (id: string) => void;
}

// Usage examples
<Component data={data} onAction={handleAction} />

// Pattern references
// Follow pattern from src/components/Card/Card.tsx
```

### 4. Specify Files Exactly
```markdown
### Files to Create/Modify
- `src/components/NewFeature/index.ts` - Public exports
- `src/components/NewFeature/NewFeature.tsx` - Main component
- `src/components/NewFeature/NewFeature.test.tsx` - Unit tests
- `src/components/NewFeature/NewFeature.stories.tsx` - Storybook stories
```

### 5. Define Clear Acceptance Criteria
```markdown
## Acceptance Criteria
- [ ] Component renders data based on props
- [ ] Clicking items calls onAction with item ID
- [ ] Empty state shows when data array is empty
- [ ] Loading state displays while isLoading is true
- [ ] Responsive from 320px to 4K screens
- [ ] Keyboard accessible with arrow keys
- [ ] Dark mode compatible using dark: variants
```

## Creating the Issue

### Option 1: Generate Markdown
Create the complete issue content in markdown format that can be copied and pasted into GitHub.

### Option 2: Use GitHub CLI
```bash
# Create issue with generated content
gh issue create \
  --title "[Component] Clear action description" \
  --body "$(cat <<'EOF'
## Description
[Your generated issue content here]
EOF
)" \
  --label "task"
```

## Quality Checklist

Before finalizing the issue:
- [ ] Title follows `[Component] Action + Subject` format
- [ ] All file paths are absolute from project root
- [ ] TypeScript interfaces are complete and correct
- [ ] Acceptance criteria are specific and testable
- [ ] Test scenarios cover happy path and edge cases
- [ ] Dependencies are identified and linked
- [ ] Examples show desired behavior clearly
- [ ] Non-goals explicitly state what NOT to do

## Example Issue

```markdown
Title: [UserCard] Add loading skeleton state

## Description
Add a loading skeleton state to the UserCard component that displays while user data is being fetched. This improves perceived performance and prevents layout shift.

## Acceptance Criteria
- [ ] Skeleton shows when `isLoading` prop is true
- [ ] Skeleton matches the shape of loaded content
- [ ] Smooth transition from skeleton to loaded state
- [ ] Skeleton uses neutral gray colors that work in dark mode
- [ ] No layout shift when content loads

## Technical Specifications

### Files to Create/Modify
- `src/components/UserCard/UserCard.tsx` - Add skeleton rendering logic
- `src/components/UserCard/UserCard.test.tsx` - Add skeleton tests
- `src/components/UserCard/UserCard.stories.tsx` - Add loading story

### Props Interface Update
```typescript
interface UserCardProps {
  user?: User;
  isLoading?: boolean; // New prop
  onEdit?: (user: User) => void;
  className?: string;
}
```

### Implementation Notes
- Use Tailwind's animate-pulse for skeleton animation
- Follow pattern from `src/components/PostCard/PostCard.tsx`
- Skeleton should maintain same height as loaded content

## Testing Requirements

### Unit Tests
- [ ] Renders skeleton when isLoading is true
- [ ] Renders user content when isLoading is false
- [ ] Does not call onEdit while loading
- [ ] Applies animate-pulse class to skeleton elements

### Storybook Story
- [ ] Add "Loading" story showing skeleton state
- [ ] Update existing stories to show transition

## Dependencies
- Uses existing UserCard component structure
- No external dependencies

## Non-Goals
- Do not implement data fetching (handled by parent)
- Do not add error states (separate issue)
- Do not modify the loaded state appearance
```

## Tips for Writing Issues

1. **Be specific**: "Add loading state" → "Add skeleton loader that shows while isLoading is true"
2. **Include examples**: Show the exact code pattern to follow
3. **Define boundaries**: Explicitly state what's out of scope
4. **Think edge cases**: What happens with empty data, errors, long content?
5. **Reference patterns**: Point to existing code that does something similar

Remember: A well-written issue saves more time than it takes to write!