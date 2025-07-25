# GitHub CLI (gh) Tool Guide

## Overview
The `gh` command is used for interacting with GitHub issues, PRs, and other GitHub features.

## Common Commands

### Issues
- `gh issue list` - List issues
- `gh issue view NUMBER` - View issue details
- `gh issue view NUMBER --comments` - View issue with all comments
- `gh issue comment NUMBER --body "message"` - Add a comment (use only for simple text)
- `gh issue comment NUMBER --body-file /path/to/file` - Add comment from file (ALWAYS use for complex content)

### Pull Requests
- `gh pr list` - List PRs
- `gh pr view NUMBER` - View PR details
- `gh pr view NUMBER --json state,mergeable,statusCheckRollup` - Check PR status
- `gh pr create` - Create a new PR
- `gh pr checks` - View CI status
- `gh pr diff NUMBER --name-only` - List files changed in PR

### Comments
- `gh api -X DELETE /repos/OWNER/REPO/issues/comments/COMMENT_ID` - Delete a comment

## CRITICAL: Always Use Files for Comments

**NEVER use `--body` directly for anything except the simplest messages!**

### Why Files Are Essential
1. **Shell Interpretation**: The shell interprets backticks, dollar signs, and other special characters
2. **Path Corruption**: File paths in backticks get executed as commands
3. **Missing Content**: Parts of your comment may disappear silently
4. **Dollar Signs**: Currency symbols like $0.10 become command substitutions

### Correct Workflow
```bash
# ALWAYS write to a file first
cat > /tmp/my_comment.md << 'EOF'
## Your Comment Title

Content with `code blocks` and $0.10 costs and paths like `src/services/actions/`

Any complex markdown content...
EOF

# Then post from file
gh issue comment NUMBER --body-file /tmp/my_comment.md
```

## Special Character Handling

### Characters That Need Escaping
- `$` - Use `\$` for dollar signs (e.g., `\$0.10`)
- `` ` `` - Backticks can cause command execution
- `!` - In some contexts, triggers history expansion

### Safe Practices
1. **Always use heredoc with quoted delimiter**: `cat << 'EOF'` (note the quotes!)
2. **Write to `/tmp/` files**: Use descriptive names like `/tmp/pr21_review.md`
3. **Check your comment**: View it after posting to ensure nothing was corrupted

## Agent Posting Guidelines

### Footer Requirements
All AI agent posts MUST include a footer:
```markdown
---
_Posted by AI Agent_
```

Exception: Only the project owner (JoernStoehler) may post without this footer.

### Duplicate Prevention
1. **Check before posting**: `gh issue view NUMBER --comments | tail -50`
2. **Delete corrupted comments**: `gh api -X DELETE /repos/JoernStoehler/tetraspore/issues/comments/ID`
3. **Never retry without checking**: A comment may have posted even if you got an error

## Best Practices

1. **Complex Content Workflow**:
   - Write to `/tmp/filename.md`
   - Review the file content
   - Post using `--body-file`
   - Check the posted comment
   - Delete and repost if corrupted

2. **View Recent Activity**: 
   ```bash
   gh issue view NUMBER --comments | tail -100
   ```

3. **Check PR Status**:
   ```bash
   gh pr view NUMBER --json state,mergeable,statusCheckRollup
   ```

4. **List Changed Files**:
   ```bash
   gh pr diff NUMBER --name-only
   ```

## Common Mistakes Log

- **2025-01-25**: Created duplicate comment by reposting after formatting error. Should check if original post succeeded first.
- **2025-01-25**: Bash code in markdown was interpreted by shell when using `--body`. Use `--body-file` for complex content.
- **2025-01-25**: Dollar signs in costs ($0.10) caused shell interpretation. Always escape or use files.
- **2025-01-25**: File paths in backticks were executed as commands. Always use files for complex markdown.
- **2025-01-25**: Missing agent footer on comments. All AI posts must be marked.

## Emergency Fixes

### Corrupted Comment Posted
```bash
# Find the comment ID from the URL or by viewing
gh issue view NUMBER --comments

# Delete the corrupted comment
gh api -X DELETE /repos/JoernStoehler/tetraspore/issues/comments/COMMENT_ID

# Repost correctly using a file
```

### Check What Was Actually Posted
```bash
# View the last few comments to see what actually appeared
gh issue view NUMBER --comments | tail -50
```