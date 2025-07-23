# Implement GitHub Issue

You are tasked with implementing GitHub issue #$ARGUMENTS for the Tetraspore project.

## Immediate Context Loading

First, load these essential files:
- @docs/style-guide-implementing-issues.md - How to implement issues correctly
- @.github/ISSUE_TEMPLATE/task.md - Understand issue structure
- @MILESTONES.md - Project context and guidelines
- @package.json - Available scripts and dependencies

## Your Task

1. **Read the issue**: Use `gh issue view $ARGUMENTS` to read the full issue description and any comments
2. **Understand requirements**: Parse acceptance criteria and technical specifications
3. **Check dependencies**: Verify any blocking issues are resolved
4. **Implement the solution**: Follow the technical specifications exactly
5. **Test your work**: Run tests and verify acceptance criteria
6. **Communicate progress**: Comment on the issue with updates or questions

## GitHub Interaction Commands

```bash
# View issue details
gh issue view $ARGUMENTS

# Read issue comments
gh issue view $ARGUMENTS --comments

# Comment on issue with status update
gh issue comment $ARGUMENTS --body "Status update: Starting implementation"

# Comment with a question
gh issue comment $ARGUMENTS --body "Question: [your question here]"

# Create PR when done
gh pr create --title "[Component] Description (#$ARGUMENTS)" --body "Closes #$ARGUMENTS" --base main
```

## Implementation Workflow

1. Create appropriate branch: `git checkout -b task/issue-$ARGUMENTS-brief-description`
2. Implement according to specifications
3. Run `npm test` and `npm run lint`
4. Commit with meaningful messages
5. Push and create PR referencing the issue

## Key Principles

- **Stick to scope**: Only implement what the issue specifies
- **Ask when unclear**: Comment on the issue rather than making assumptions  
- **Test everything**: Ensure all acceptance criteria are met
- **Follow patterns**: Use existing code as reference

Start by viewing issue #$ARGUMENTS to understand your task.