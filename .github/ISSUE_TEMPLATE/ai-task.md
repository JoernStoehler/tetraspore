---
name: Development Task
about: Create a task for AI agent implementation
title: "[Component] "
labels: task
assignees: ""
---

## Description

<!-- One paragraph explaining what this task accomplishes and why it's needed -->

## Acceptance Criteria

<!-- Specific, measurable requirements -->

- [ ]
- [ ]
- [ ]

## Technical Specifications

### Files to Create/Modify

<!-- List all files with their purposes -->

- `src/components/` -
- `src/components/` -

### TypeScript Interfaces

```typescript
// Define all interfaces needed for this task
```

### Implementation Notes

<!-- Patterns to follow, specific requirements -->

- Follow pattern from ``
- Use Tailwind CSS for styling
-

## Testing Requirements

<!-- Specific test cases to implement -->

### Unit Tests

- [ ] Component renders without crashing
- [ ]
- [ ]

### Integration Tests

- [ ]
- [ ]

### Manual Testing

- [ ] Test on Chrome, Firefox, Safari
- [ ] Verify responsive design (320px - 4K)
- [ ] Check keyboard navigation

## Agent Verification Checklist

<!-- This section ensures proper implementation and verification -->

**Before submitting PR, the AI agent must verify:**

- [ ] **Local checks pass**: `npm test -- --run && npm run lint && npm run build`
- [ ] **E2E tests pass**: `npm run test:e2e` (if applicable)
- [ ] **Pre-commit hooks work**: Commit triggers all checks automatically
- [ ] **CI status verified**: Use `gh pr checks <PR_NUMBER>` to confirm all GitHub Actions pass
- [ ] **Git configured**: `git config push.autoSetupRemote true` set to avoid upstream errors

**Communication reminder**: If you discover broader improvements needed during implementation, ASK before expanding scope beyond this issue.

## Dependencies

<!-- Link to other issues that must be completed first -->

- Requires: #
- Blocks: #

## Resources

<!-- Links to designs, documentation, examples -->

- Design:
- Similar component:
- Documentation:

## Non-Goals

<!-- Explicitly state what should NOT be done -->

- Do not
- This task does not include

## Code Examples

<!-- Optional: Include specific code patterns or examples -->

```typescript

```
