# Write GitHub Issue

Create a GitHub issue for the Tetraspore project based on these requirements:

  $ARGUMENTS

## Instructions

1. **Analyze requirements**: If $ARGUMENTS are unclear or insufficient, ask the user for clarification before proceeding.

2. **Read documentation**:
   - @docs/style-guide-writing-issues.md - Writing standards and examples
   - @.github/ISSUE_TEMPLATE/task.md - Template to fill out completely

3. **Generate issue content**:
   - Fill out EVERY section of the template (no placeholders)
   - Reference specific existing components by name when applicable
   - Ensure the task is self-contained and takes 2-4 hours

4. **Create on GitHub**:
   ```bash
   gh issue create \
     --title "[Component] Your specific title" \
     --body "$(cat <<'EOF'
   Your complete markdown content here
   EOF
   )" \
     --label "task"
   ```

The issue must be implementable by an AI agent without additional context.