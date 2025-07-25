# GitHub CLI (gh) Tool Guide

## Overview
The `gh` command is used for interacting with GitHub issues, PRs, and other GitHub features.

## Common Commands

### Issues
- `gh issue list` - List issues
- `gh issue view NUMBER` - View issue details
- `gh issue view NUMBER --comments` - View issue with all comments
- `gh issue comment NUMBER --body "message"` - Add a comment
- `gh issue comment NUMBER --body-file /path/to/file` - Add comment from file

### Pull Requests
- `gh pr list` - List PRs
- `gh pr view NUMBER` - View PR details
- `gh pr create` - Create a new PR
- `gh pr checks` - View CI status

## Important Warnings

### Avoid Duplicate Comments
When posting to GitHub issues, be careful not to create duplicate comments:

- ❌ **DON'T**: Post a comment, encounter formatting errors, then repost the same content
- ✅ **DO**: Check if your comment was posted before attempting to repost
- ✅ **DO**: Use `gh issue view NUMBER --comments | tail -20` to check recent comments

### Formatting Issues
When posting complex content with special characters:

- ❌ **DON'T**: Use inline code blocks with bash that might be interpreted
- ✅ **DO**: Write content to a temporary file first, then use `--body-file`
- ✅ **DO**: Escape special characters properly in markdown

Example of safe posting:
```bash
# Write content to file first
cat > /tmp/comment.md << 'EOF'
Your markdown content here...
EOF

# Post from file
gh issue comment 12 --body-file /tmp/comment.md
```

## Best Practices

1. **Check before reposting**: Always verify if a comment was successfully posted
2. **Use files for complex content**: Write to `/tmp/` first for complex markdown
3. **View recent activity**: Use `tail` to see just recent comments
4. **Test locally first**: For complex formatting, test in a local markdown file

## Common Mistakes Log

- **2025-01-25**: Created duplicate comment by reposting after formatting error. Should check if original post succeeded first.
- **2025-01-25**: Bash code in markdown was interpreted by shell when using `--body`. Use `--body-file` for complex content.