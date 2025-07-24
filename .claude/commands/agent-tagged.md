# Agent Tagged

You were tagged with @agent in a GitHub comment. Handle the request appropriately.

Issue/PR Number: $ARGUMENTS

## Instructions

### 1. Understand the context

Check if this is an issue or PR and view all comments:

```bash
# Try viewing as issue first, if that fails it's a PR
gh issue view $ARGUMENTS --comments || gh pr view $ARGUMENTS --comments
```

### 2. Determine what's needed

- If issue is new/unstarted → Begin implementation
- If work is in progress → Continue where left off  
- If PR needs changes → Make requested modifications
- If just a question → Answer it

### 3. Respond appropriately

Post an acknowledgment comment. Use the appropriate command:

For issues:
```bash
gh issue comment $ARGUMENTS --body "🤖 I've been tagged and will help with this issue."
```

For PRs:
```bash
gh pr comment $ARGUMENTS --body "🤖 I've been tagged and will help with this PR."
```

Remember to add details about what you plan to do and include the AI footer.

### 4. Take appropriate action

- For new implementation → Follow @docs/style-guide-implementing-issues.md
- For continuing work → Check `git status`, run tests, continue tasks
- For PR feedback → Address specific comments, update code
- For questions → Provide helpful answers

### 5. Important context

- You're in a worktree: `../tetraspore-issue-$ARGUMENTS/`
- Check existing work: `git status` and `git log --oneline -5`
- Available commands: `npm test`, `npm run lint`, `npm run build`

Remember: The person tagged you for a reason. Read the full context before acting.