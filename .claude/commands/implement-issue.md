# Implement GitHub Issue

Implement a GitHub issue for the Tetraspore project.

ID/Instructions: $ARGUMENTS

## Instructions

1. **Read the issue and comment on it**:
   ```bash
   gh issue view ID --comments
   gh issue comment ID --body "🤖 Starting implementation of this issue.

---
_Posted by AI Agent_"
   ```

2. **Read documentation**:
   - @docs/style-guide-implementing-issues.md - Complete implementation guide
   - @package.json - Available scripts (test, lint, build)

3. **Verify branch and implement**:
   ```bash
   # You should already be on the correct branch (issue-ID) in a worktree
   git branch --show-current
   git status
   ```
   Then implement EXACTLY what the issue specifies - no more, no less.

4. **Verify and submit**:
   ```bash
   npm test
   npm run lint
   npm run build
   
   # If all pass, create PR (see docs/style-guide-implementing-issues.md for full template):
   gh pr create \
     --title "Implement [Component] (#ID)" \
     --body "$(cat <<'EOF'
## Summary
[Implementation summary]

## Related Issue
Closes #ID

## Changes
- [List key changes]

## Testing
- [x] All unit tests pass
- [x] Linting passes
- [x] Build succeeds

---
🤖 _Posted by AI Agent_
EOF
   )" \
     --base main
   
   # Wait for CI to pass and fix any failures:
   sleep 30  # Allow CI to start
   gh pr checks --watch
   
   # If CI fails, fix issues and push again:
   # npm test && npm run lint && npm run build
   # git add -A && git commit -m "fix: resolve CI failures"
   # git push
   ```

Ask questions via `gh issue comment` if requirements are unclear. Do NOT make assumptions.