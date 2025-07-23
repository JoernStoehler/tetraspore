# Milestone Style Guide

This guide defines how to write milestones, break them into tasks, and manage the GitHub issue workflow for AI agent development.

## Milestone Structure

### 1. Milestone Definition
Each milestone should be:
- **Focused**: One major feature or system
- **Measurable**: Clear success criteria
- **Time-boxed**: Reasonable scope (1-2 weeks of work)
- **Independent**: Minimal dependencies on other milestones

### 2. Milestone Documentation
Create an RFC document in `docs/rfc/milestone-XX.md` with:
- Summary (1-2 sentences)
- Motivation (why this milestone matters)
- Detailed design (what will be built)
- Task breakdown (how work is divided)
- Success criteria (definition of done)
- Dependencies (what must exist first)

## Task Design Principles

### 1. Task Granularity
- **Size**: 2-4 hours of focused work
- **Scope**: Single file or tightly related files
- **Output**: Concrete deliverable (component, function, test suite)
- **Independence**: Minimal coordination with other tasks

### 2. Task Specification
Each task must include:
- **Clear title**: "Implement X component with Y functionality"
- **File paths**: Exact locations for new/modified files
- **Interfaces**: TypeScript interfaces or function signatures
- **Test requirements**: Specific test cases to implement
- **Dependencies**: Links to prerequisite tasks/issues

### 3. Information Architecture
Structure tasks to minimize context needs:
- **Self-contained**: All needed info in the issue
- **Links not prose**: Reference other issues/docs rather than duplicating
- **Code examples**: Show expected patterns and style
- **Visual references**: Include mockups or diagrams when relevant

## GitHub Issue Workflow

### 1. Issue Creation
```markdown
Title: [Milestone X.Y] Brief task description

## Task Overview
One paragraph explaining what this task accomplishes.

## Specifications
### Files to Create/Modify
- `src/components/FeatureName/index.tsx`
- `src/components/FeatureName/FeatureName.test.tsx`

### Interfaces
```typescript
export interface FeatureProps {
  data: DataType;
  onAction: (id: string) => void;
}
```

### Implementation Requirements
- [ ] Component renders data correctly
- [ ] Handles edge cases (empty data, errors)
- [ ] Responds to user interactions
- [ ] Follows project styling conventions

### Test Cases
1. Renders without crashing
2. Displays all data items
3. Calls onAction when clicked
4. Shows empty state when no data

## Dependencies
- Requires: #123 (Data types defined)
- Blocks: #125 (Integration task)

## Acceptance Criteria
- [ ] All tests pass
- [ ] No linting errors
- [ ] Component documented with examples
- [ ] PR submitted with clean commit history
```

### 2. Agent Assignment
When starting an agent on a task:
```bash
# Use workagent to prepare worktree and show agent command
workagent 124 --model sonnet

# Then run the displayed command to start the agent
cd ../tetraspore-issue-124 && agent --model sonnet '/implement-issue 124'
```

### 3. Agent Communication
Agents should use issue comments for:
- **Status updates**: "Started implementation, reviewing requirements"
- **Questions**: "Should the empty state show a message or just blank?"
- **Blockers**: "Need clarification on error handling approach"
- **Completion**: "Task complete, PR #126 submitted"

### 4. Pull Request Flow
```markdown
PR Title: Implement Feature X component (#124)

## Summary
Brief description of what was implemented.

## Changes
- Added FeatureName component with props interface
- Implemented comprehensive test suite
- Created Storybook stories for component states

## Testing
- [x] Unit tests pass
- [x] Linting passes
- [x] Manual testing completed

Closes #124
```

## Task Chunking Strategies

### 1. Vertical Slicing
Break features into full-stack slices:
- Task 1: Data types and interfaces
- Task 2: UI component with mock data
- Task 3: State management integration
- Task 4: API connection
- Task 5: Error handling and edge cases

### 2. Horizontal Layers
Separate by technical concerns:
- Task 1: All TypeScript interfaces
- Task 2: All UI components
- Task 3: All state management
- Task 4: All tests
- Task 5: Documentation

### 3. Feature Flags
Enable incremental delivery:
- Each task completes a working subset
- Features hidden behind flags until complete
- Integration happens continuously

## Best Practices

### 1. Information Density
- **High signal-to-noise**: Every word should help the agent
- **Code > Description**: Show examples rather than explaining
- **Concrete > Abstract**: Specific file paths, not "somewhere in components"

### 2. Dependency Management
- **Explicit prerequisites**: List issue numbers
- **Mock interfaces**: Provide temporary implementations
- **Progressive enhancement**: Each task adds value independently

### 3. Error Prevention
- **Clear boundaries**: Define what's in and out of scope
- **Anti-patterns**: Show what NOT to do
- **Common pitfalls**: Warn about likely mistakes

### 4. Agent-Friendly Writing
- **Bullet points**: Easier to parse than paragraphs
- **Code blocks**: Properly formatted with language tags
- **Checklists**: Clear progress tracking
- **Links**: Direct references to related resources

## Example Task Breakdown

### Milestone 1: User Dashboard
Total work: ~40 hours
Target: 10-12 tasks of 3-4 hours each

1. **Data Types** (3h)
   - Define TypeScript interfaces
   - Create mock data generators
   - Write type validation tests

2. **Layout Component** (4h)
   - Create responsive grid layout
   - Add theme support
   - Test on multiple screen sizes

3. **Widget System** (4h)
   - Define widget interface
   - Create widget container
   - Implement drag-and-drop

4. **Chart Widget** (3h)
   - Integrate D3.js
   - Create reusable chart component
   - Add interactive features

5. **Data Widget** (3h)
   - Display tabular data
   - Add sorting/filtering
   - Implement pagination

[... continue for all tasks]

## Communication Templates

### Status Update
```markdown
## Status Update - Issue #124

**Progress**: 60% complete
**Completed**:
- ✅ Component structure created
- ✅ Basic rendering working
- ✅ Unit tests for happy path

**In Progress**:
- 🔄 Error handling implementation

**Next Steps**:
- Edge case testing
- Documentation

**Blockers**: None
**ETA**: 2 hours
```

### Question Template
```markdown
## Question - Issue #124

I need clarification on the error handling approach:

**Current Understanding**:
The component should handle network errors gracefully.

**Options I'm Considering**:
1. Show inline error message
2. Use toast notifications
3. Fallback to cached data

**Recommendation**: Option 1 for consistency with existing patterns

Could you confirm the preferred approach?
```

### Completion Notice
```markdown
## Task Complete - Issue #124

✅ All requirements implemented
✅ Tests passing (12/12)
✅ Linting clean
✅ Documentation added

**PR**: #126
**Summary**: Implemented FeatureX component with full test coverage and error handling

Ready for review.
```

## Quality Checklist

Before marking a task ready for agent:
- [ ] Clear, specific title
- [ ] All file paths specified
- [ ] Interfaces/types defined
- [ ] Test cases listed
- [ ] Dependencies linked
- [ ] Success criteria explicit
- [ ] Examples provided where helpful
- [ ] Common errors warned against