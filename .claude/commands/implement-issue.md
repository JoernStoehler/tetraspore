# Implement GitHub Issue

Implement a GitHub issue for the Tetraspore project.

ID/Instructions: $ARGUMENTS

## Instructions

1. **Read the issue and comment on it**:
   ```bash
   gh issue view ID --comments
   gh issue comment ID --body "Starting implementation of this issue."
   ```

2. **Read documentation**:
   - @docs/style-guide-implementing-issues.md - Complete implementation guide
   - @package.json - Available scripts (test, lint, build)

3. **Create branch and implement**:
   ```bash
   git checkout -b task/issue-ID-brief-description
   ```
   Then implement EXACTLY what the issue specifies - no more, no less.

4. **Verify and submit**:
   ```bash
   npm test
   npm run lint
   npm run build
   
   # If all pass, create PR:
   gh pr create \
     --title "Implement [Component] (#ID)" \
     --body "$(cat <<'EOF'
   Closes #ID

   [Brief summary of changes]
   EOF
   )" \
     --base main
   ```

Ask questions via `gh issue comment` if requirements are unclear. Do NOT make assumptions.