# Style Guide: Writing Claude Commands

This guide explains how to write effective Claude commands (slash commands) that help AI agents quickly understand their context and task.

## What Are Claude Commands?

Claude commands are markdown files in `.claude/commands/` that:
- Define specific roles or tasks for the AI
- Preload relevant context using `@file` references
- Support placeholders like `$ARGUMENTS` for dynamic input
- Can be invoked with `/command-name` in Claude

## Command Structure

### 1. Clear Title and Purpose
Start with a descriptive heading that immediately explains the command's purpose.

```markdown
# Work on GitHub Issue

You are tasked with implementing GitHub issue #$ARGUMENTS for the Tetraspore project.
```

### 2. Immediate Context Loading
Use `@file` references to preload essential files without requiring the agent to search.

```markdown
## Immediate Context Loading

First, load these essential files:
- @.github/ISSUE_TEMPLATE/task.md - Understand issue structure
- @docs/style-guide-writing-issues.md - Issue conventions
- @MILESTONES.md - Project context and guidelines
- @package.json - Available scripts and dependencies
```

### 3. Step-by-Step Instructions
Provide clear, numbered steps for the agent to follow.

```markdown
## Your Task

1. **Read the issue**: Use `gh issue view $ARGUMENTS`
2. **Understand requirements**: Parse acceptance criteria
3. **Implement the solution**: Follow specifications
4. **Test your work**: Run tests and verify
5. **Submit PR**: Reference the issue number
```

### 4. Command Examples
Include specific command examples the agent can copy and use.

```markdown
## Commands You'll Need

```bash
# View issue
gh issue view $ARGUMENTS

# Run tests
npm test
npm run lint

# Create PR
gh pr create --title "Fix: Description (#$ARGUMENTS)"
```

## Best Practices

### 1. Front-Load Critical Information
Put the most important context at the beginning. Agents read sequentially.

✅ Good:
```markdown
You are implementing a React component for issue #$ARGUMENTS.

Key constraints:
- Use TypeScript with strict mode
- Follow existing patterns in @src/components
- Must include tests
```

❌ Bad:
```markdown
There are various ways to implement components. You might want to consider different approaches. By the way, this is for issue #$ARGUMENTS and should use TypeScript.
```

### 2. Use @file References Strategically
Reference files that provide context, patterns, or specifications.

```markdown
## Context Files
- @src/components/Button/Button.tsx - Pattern for components
- @docs/style-guide.md - Coding standards
- @tsconfig.json - TypeScript configuration
```

### 3. Include Placeholders Meaningfully
Use `$ARGUMENTS` and other placeholders where they make semantic sense.

```markdown
# Review PR #$ARGUMENTS

Your task is to review pull request #$ARGUMENTS focusing on:
- Code quality
- Test coverage
- Performance implications
```

### 4. Provide Executable Commands
Don't just describe what to do - show the exact commands.

✅ Good:
```markdown
## Setup Your Workspace
```bash
git checkout -b fix/issue-$ARGUMENTS
npm install
npm run dev
```

❌ Bad:
```markdown
Create a new branch and install dependencies.
```

### 5. Set Clear Boundaries
Explicitly state what the agent should and shouldn't do.

```markdown
## Scope
DO:
- Implement only what's specified in the issue
- Add comprehensive tests
- Follow existing code patterns

DON'T:
- Refactor unrelated code
- Add features not in the issue
- Change the build configuration
```

## Common Command Patterns

### Task-Specific Command
```markdown
# [Specific Task]

You are working on [specific aspect] of the Tetraspore project.

## Required Context
- @relevant/file1.ts - [Why needed]
- @relevant/file2.ts - [Why needed]

## Your Task
[Clear description of what to do]

## Success Criteria
- [ ] [Measurable outcome]
- [ ] [Another outcome]

[Specific instructions]
```

### Review Command
```markdown
# Review [What]

You are reviewing [what] for [purpose].

## Review Checklist
- [ ] Correctness: Does it work as intended?
- [ ] Style: Does it follow @docs/style-guide.md?
- [ ] Tests: Are there adequate tests?
- [ ] Performance: Any obvious inefficiencies?

## How to Review
1. Read the [what] carefully
2. Check against requirements
3. Run tests locally
4. Provide constructive feedback
```

### Debug Command
```markdown
# Debug [Issue Type]

You are debugging [specific issue description].

## Diagnostic Steps
1. Check @logs/error.log for stack traces
2. Review recent changes with `git log --oneline -10`
3. Run specific test: `npm test -- [test-name]`
4. Check @src/[relevant-file] for the implementation

## Common Causes
- [Cause 1]: Check [what]
- [Cause 2]: Verify [what]

## Fix Approach
1. Identify root cause
2. Implement minimal fix
3. Add test to prevent regression
4. Document the issue and fix
```

## File Reference Best Practices

### 1. Explain Why Each File Matters
```markdown
## Context Files
- @src/config/app.ts - Contains feature flags
- @tests/setup.ts - Test environment configuration
- @.env.example - Available environment variables
```

### 2. Use Folders for Broader Context
```markdown
## Explore These Directories
- @src/components/ - See all existing components
- @docs/ - Project documentation
- @tests/fixtures/ - Test data examples
```

### 3. Order by Importance
List files in order of relevance to the task:
1. Primary task files
2. Reference/pattern files
3. Configuration files
4. Documentation

## Anti-Patterns to Avoid

### 1. Vague Instructions
❌ "Do the usual setup"
❌ "You know what to do"
❌ "Standard implementation"

### 2. Missing Context
❌ Not including relevant file references
❌ Assuming knowledge of project structure
❌ Forgetting to mention available scripts

### 3. Information Overload
❌ Including every possible file
❌ Long philosophical discussions
❌ Unstructured wall of text

### 4. Rigid Prescriptions
❌ Micromanaging every step
❌ Not allowing for agent judgment
❌ Over-specifying implementation details

## Testing Your Command

Before finalizing a command:
1. **Read it fresh**: Does it make sense without prior context?
2. **Check references**: Do all @file paths exist?
3. **Verify commands**: Do the bash commands work?
4. **Test placeholders**: Does $ARGUMENTS substitution make sense?
5. **Consider edge cases**: What if the argument is invalid?

## Example: Complete Command

```markdown
# Implement Component

You are implementing a new React component for issue #$ARGUMENTS.

## Quick Context
- @src/components/Card/Card.tsx - Follow this component pattern
- @docs/style-guide-components.md - Component guidelines
- @tailwind.config.js - Available style utilities

## Implementation Steps

1. **Read the Issue**
   ```bash
   gh issue view $ARGUMENTS
   ```

2. **Create Component Structure**
   ```bash
   mkdir -p src/components/NewComponent
   touch src/components/NewComponent/{index.ts,NewComponent.tsx,NewComponent.test.tsx,NewComponent.stories.tsx}
   ```

3. **Implement Following the Pattern**
   - Use functional component with FC type
   - Props interface in the same file
   - Export through index.ts
   - Style with Tailwind classes

4. **Test Your Implementation**
   ```bash
   npm test NewComponent
   npm run lint
   npm run storybook
   ```

5. **Submit Your Work**
   ```bash
   git add -A
   git commit -m "feat: implement NewComponent (#$ARGUMENTS)"
   gh pr create --title "Add NewComponent (#$ARGUMENTS)" --body "Closes #$ARGUMENTS

---
🤖 _Posted by AI Agent_"
   ```

## Success Criteria
- [ ] All acceptance criteria from issue met
- [ ] Tests pass with >80% coverage
- [ ] Storybook story showcases all states
- [ ] No linting errors
- [ ] PR created and linked to issue

Remember: Implement exactly what's specified in the issue - no more, no less.
```

## Summary

Effective Claude commands:
- Start with clear purpose
- Load context immediately with @references
- Provide step-by-step guidance
- Include executable examples
- Set clear boundaries
- Use placeholders meaningfully

The goal is to minimize the time from command invocation to productive work!