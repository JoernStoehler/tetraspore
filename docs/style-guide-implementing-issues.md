# Style Guide: Implementing GitHub Issues

This guide helps AI agents effectively implement tasks described in GitHub issues.

## Core Principles

### 1. Understand Before Acting
- Read the entire issue first
- Check all linked dependencies
- Review acceptance criteria
- Understand the scope boundaries

### 2. Follow Specifications Exactly
- Implement only what's specified
- Don't add extra features
- Don't refactor unrelated code
- Ask if requirements are unclear

### 3. Communicate Proactively
- Comment when starting work
- Ask questions when blocked
- Update on significant progress
- Announce completion clearly

## Implementation Workflow

### 1. Initial Setup
```bash
# View the issue
gh issue view $ISSUE_NUMBER

# Read all comments
gh issue view $ISSUE_NUMBER --comments

# Verify you're on the correct branch (should be issue-$ISSUE_NUMBER in a worktree)
git branch --show-current
pwd  # Should show ../tetraspore-issue-$ISSUE_NUMBER

# Comment that you're starting
gh issue comment $ISSUE_NUMBER --body "🤖 Starting implementation of this issue.

---
_Posted by AI Agent_"
```

### 2. Understand Requirements

#### Parse the Issue Structure
Look for these key sections:
- **Description**: Overall goal
- **Acceptance Criteria**: Checklist of requirements
- **Technical Specifications**: Files, interfaces, patterns
- **Testing Requirements**: What tests to write
- **Dependencies**: Linked issues that must be complete

#### Verify Dependencies
```bash
# Check if dependency issues are closed
gh issue view $DEPENDENCY_NUMBER --json state
```

### 3. Implementation Strategy

#### Start with Interfaces
If the issue specifies TypeScript interfaces, create them first:
```typescript
// Start with the contract
export interface ComponentProps {
  // Exactly as specified in the issue
}
```

#### Follow TDD When Possible
1. Write failing tests based on requirements
2. Implement to make tests pass
3. Refactor while keeping tests green

#### Use Existing Patterns
```bash
# Find similar components to follow
find src/components -name "*.tsx" -type f

# Look for the pattern mentioned in the issue
grep -r "pattern from" --include="*.tsx"
```

### 4. Common Implementation Tasks

#### Creating a React Component
```bash
# Create component structure
mkdir -p src/components/ComponentName
touch src/components/ComponentName/{index.ts,ComponentName.tsx,ComponentName.test.tsx,ComponentName.stories.tsx}

# Follow this order:
# 1. index.ts - exports
# 2. ComponentName.tsx - implementation
# 3. ComponentName.test.tsx - tests
# 4. ComponentName.stories.tsx - Storybook stories
```

#### Component Template
```typescript
// ComponentName.tsx
import { type FC } from 'react';

interface ComponentNameProps {
  // From issue specifications
}

export const ComponentName: FC<ComponentNameProps> = ({ 
  // props 
}) => {
  // Implementation
  return (
    <div className="tailwind-classes">
      {/* JSX */}
    </div>
  );
};
```

#### Writing Tests
```typescript
// ComponentName.test.tsx
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('renders without crashing', () => {
    render(<ComponentName />);
    // assertions
  });
  
  // Test each acceptance criterion
});
```

### 5. Verification

#### Run All Checks
```bash
# Run tests
npm test ComponentName

# Check linting
npm run lint

# Build to ensure no TypeScript errors
npm run build

# Run Storybook to verify visual appearance
npm run storybook
```

#### Verify Acceptance Criteria
Go through each checkbox in the issue and verify:
- [ ] Feature works as specified
- [ ] All tests pass
- [ ] No linting errors
- [ ] Edge cases handled
- [ ] Documentation added

### 6. Communication

#### When to Comment

**Ask Questions**
```markdown
🤖 I need clarification on the error handling approach:

**Current Understanding**: The component should handle network errors gracefully.

**Options**:
1. Show inline error message
2. Use toast notifications
3. Fall back to cached data

**Recommendation**: Option 1 for consistency with existing error patterns.

Could you confirm the preferred approach?

---
_Posted by AI Agent_
```

**Report Blockers**
```markdown
🤖 I'm blocked on this issue:

**Problem**: The UserAPI type referenced in the specifications doesn't exist yet.

**Dependency**: This seems to require #45 to be completed first.

**Options**:
1. Wait for #45
2. Create a temporary mock interface
3. Implement without TypeScript types for now

How would you like me to proceed?

---
_Posted by AI Agent_
```

**Update Progress**
```markdown
🤖 Progress update:

**Completed**:
- ✅ Component structure created
- ✅ Basic props interface defined
- ✅ Unit tests written (currently failing)

**In Progress**:
- 🔄 Implementing component logic

**Next**:
- Add Storybook stories
- Handle edge cases

ETA: 1 hour

---
_Posted by AI Agent_
```

### 7. Submitting Work

#### Final Checklist
Before creating PR:
- [ ] All acceptance criteria met
- [ ] All tests pass
- [ ] Linting passes
- [ ] Build succeeds
- [ ] Code follows project patterns
- [ ] No console.log statements
- [ ] No commented-out code

#### Create Pull Request
```bash
# Stage and commit
git add -A
git commit -m "feat: implement ComponentName (#$ISSUE_NUMBER)

- Add ComponentName with full TypeScript support
- Include comprehensive test suite
- Create Storybook stories for all states
- Handle edge cases as specified"

# Push branch (should already be set up by workagent)
git push

# Create PR (see .github/pull_request_template.md for format)
gh pr create \
  --title "Implement ComponentName (#$ISSUE_NUMBER)" \
  --body "$(cat << 'EOF'
## Summary
Implements ComponentName as specified in #$ISSUE_NUMBER

## Related Issue
Closes #$ISSUE_NUMBER

## Changes
- Created new component with TypeScript interfaces
- Added unit tests with 100% coverage
- Added Storybook stories
- Followed existing Card component pattern

## Testing
- [x] All unit tests pass
- [x] Linting passes
- [x] Manual testing completed
- [x] Storybook stories verified

---
🤖 _Posted by AI Agent_
EOF
)" \
  --base main
```

#### Comment on Issue
```bash
gh issue comment $ISSUE_NUMBER --body "🤖 Implementation complete! PR submitted: #$PR_NUMBER

All acceptance criteria have been met and tests are passing.

---
_Posted by AI Agent_"
```

## Common Pitfalls

### 1. Scope Creep
❌ "While I'm here, I'll improve this other component"
✅ Implement only what the issue specifies

### 2. Making Assumptions
❌ "This probably should also handle X"
✅ Ask for clarification on unclear requirements

### 3. Skipping Tests
❌ "I'll add tests later"
✅ Write tests as specified in the issue

### 4. Ignoring Patterns
❌ "I'll do it my way"
✅ Follow existing patterns mentioned in the issue

### 5. Silent Struggles
❌ Working for hours while blocked
✅ Comment on the issue asking for help

## Best Practices

### Code Quality
- Keep functions small and focused
- Use descriptive variable names
- Add JSDoc comments for complex logic
- Follow existing code style

### Git Commits
- Make atomic commits
- Use conventional commit messages
- Reference issue number

### Testing
- Test user behavior, not implementation
- Cover edge cases
- Use meaningful test descriptions
- Follow AAA pattern (Arrange, Act, Assert)

### Communication
- Over-communicate rather than under-communicate
- Be specific about blockers
- Provide context in questions
- Update regularly on long tasks

## Quick Reference

### Essential Commands
```bash
# Issue interaction
gh issue view $NUMBER
gh issue comment $NUMBER --body "🤖 message

---
_Posted by AI Agent_"

# Development
npm test -- ComponentName
npm run lint
npm run build

# Git workflow (branch already created by workagent)
git status
git add -A
git commit -m "type: message (#$NUMBER)"
git push

# PR creation
gh pr create --title "Title (#$NUMBER)" --body "Description

---
🤖 _Posted by AI Agent_"
```

### When Stuck
1. Re-read the issue
2. Check linked issues
3. Look for similar code
4. Ask specific questions
5. Provide options with recommendations

Remember: The goal is to implement exactly what's asked for, no more, no less!