# Tetraspore - Project Overview & Agent Instructions

## Quick Start

Tetraspore is a React-based web application. AI agents work on GitHub issues in isolated git worktrees.

**Key principle**: One issue = One branch = One worktree = One agent

## Current State

- **Infrastructure**: ✅ Complete (see [milestone-00.md](docs/rfc/milestone-00.md))
- **Application**: Clean slate, ready for features
- **Workflow**: Issue-based development with GitHub integration

## Repository Structure

These folder listings may be outdated, but are useful for quick reference:

@.
@.devcontainer/
@.github/ISSUE_TEMPLATE/
@docs/
@docs/rfc/
@docs/templates/
@src/
@tests/e2e/

## Critical Guidelines

### File Investigation

- Use `ls -la` not the LS tool (LS doesn't show hidden files)
- Always investigate with shell commands

### Development

- Follow instructions exactly - no workarounds
- Ask when uncertain rather than assuming
- Update this file when learning new requirements

### Learning System

See [Requirements Log](#requirements-log) and [Common Mistakes Log](#common-mistakes-log) below.
Add new learnings there, not in the guidelines above.

## Documentation

### Key References

- **Development**: [development-principles.md](docs/development-principles.md) - Code standards, testing, patterns
- **Conventions**: [conventions.md](docs/conventions.md) - Comprehensive coding and documentation standards
- **Issues**: [style-guide-implementing-issues.md](docs/style-guide-implementing-issues.md) - How to work on issues
- **Infrastructure**: [milestone-00.md](docs/rfc/milestone-00.md) - What's already built
- **CI/CD**: [tool-guide-ci.md](docs/tool-guide-ci.md) - Continuous integration and automated testing

### Architecture Guides

- **Event Sourcing**: [event-sourcing.md](docs/architecture/event-sourcing.md) - Commands, events, and state management
- **Mock Data**: [mock-data-spec.md](docs/architecture/mock-data-spec.md) - Data structures for UI prototyping
- **Components**: [component-interfaces.md](docs/architecture/component-interfaces.md) - UI component contracts
- **Radix UI**: [radix-ui-setup.md](docs/guides/radix-ui-setup.md) - Component library integration

### Quick Links

- Issue template: [.github/ISSUE_TEMPLATE/task.md](.github/ISSUE_TEMPLATE/task.md)
- Workagent tool: [tool-guide-workagent.md](docs/tool-guide-workagent.md)
- All style guides: `docs/style-guide-*.md`
- All RFCs: `docs/rfc/*.md`

## AI Agent Workflow

### Working on an Issue

```bash
# From main worktree
workagent 123 --model opus  # Creates worktree and starts agent
```

The agent will:

1. Read issue via `gh issue view 123`
2. Work in `../tetraspore-issue-123/`
3. Communicate via `gh issue comment`
4. Submit PR when complete

### Key Commands

- `/implement-issue NUMBER` - Start work on an issue
- `/write-issue` - Create a new issue

## Development Commands

```bash
# Basics
npm run dev         # Start dev server
npm run build       # Production build
npm test           # Run tests
npm run lint       # Check code style
npm run storybook  # Component development

# GitHub
gh issue list      # See open issues
gh issue view 123  # Read issue details
gh pr create       # Submit your work
gh pr checks       # Check CI status
```

## Environment Notes

- Each worktree gets unique ports (automatic)
- API keys in `.devcontainer/.env`
- You're likely in a worktree named `tetraspore-issue-NUMBER`

## MCP Servers

- **gh**: GitHub CLI (pre-installed)
- **tavily**: Web search
- **context7**: Library docs
- **playwright**: Browser automation

## Requirements Log

_(Add new requirements here with date)_

- 2025-01-16: DevContainer self-contained - all env files in `.devcontainer/`
- 2025-01-22: GitHub issue workflow - tasks managed via issues
- 2025-01-22: One issue = One branch = One worktree = One agent
- 2025-01-25: Event Sourcing architecture - Commands (intent) vs DomainEvents (facts)
- 2025-01-25: Commands execute immediately - no batching, instant UI feedback
- 2025-01-25: Turn mechanics for phase separation - not for command batching
- 2025-01-25: Thin server architecture - game logic on client, server provides services only
- 2025-01-25: Rapid UI prototyping first - mock data before real game logic
- 2025-01-25: Use Radix UI for standard components - AI-friendly, accessible, tiny bundle
- 2025-01-25: Zod for validation - especially for command/event schemas

## Common Mistakes Log

_(Add mistakes to avoid here)_

- 2025-01-16: Using LS tool instead of `ls -la` - LS doesn't show hidden files
- 2025-01-16: Creating duplicates instead of moving files
- 2025-01-16: Hardcoding paths like `/home/node/` - use `$HOME`
- 2025-01-25: Missing `push.autoSetupRemote` causes upstream branch errors
- 2025-01-25: Claiming PR is merge-ready without checking actual CI status
- 2025-01-25: Skipping comprehensive local checks before PR creation
- 2025-01-25: Confusing Actions with Events - Actions are Redux, we use Commands
- 2025-01-25: Thinking turns batch commands - they just separate player/GM phases
- 2025-01-25: Not documenting conventions clearly - always create docs first

## Key Reminders

- **NEVER** create files unless necessary
- **ALWAYS** prefer editing existing files
- **CHECK** existing patterns before implementing
- **TEST** thoroughly before submitting PR
- **VERIFY** CI status with `gh pr checks` before claiming readiness
- **UPDATE** this file when you learn something new

## PR Verification Checklist

Before claiming a PR is merge-ready, ensure:

1. **Local checks pass**: `npm test -- --run && npm run lint && npm run build`
2. **E2E tests pass**: `npm run test:e2e` (if applicable)
3. **Git configured**: `git config push.autoSetupRemote true`
4. **CI status verified**: `sleep 30 && gh pr checks <PR_NUMBER>`
5. **All checks green**: No failing CI jobs

## Communication Guidelines

### When to Ask Questions

**ALWAYS ASK** when you encounter:

- **Scope uncertainty**: "Should I also implement X while fixing Y?"
- **Multiple solution paths**: "I see 3 approaches: A, B, C. Which do you prefer?"
- **Unclear requirements**: "The feedback mentions Z - should I implement that now?"
- **Broader implications**: "This fix could be improved with systemic changes. Should I do those too?"

### How to Ask Questions

Use this format:

```
I notice [situation]. I could:

1. [Option A - minimal approach]
2. [Option B - comprehensive approach]
3. [Option C - alternative approach]

Which approach would you prefer, or should I implement a combination?
```

### Common Misinterpretation Patterns to Avoid

- **"Think hard about X"** = Implement X, don't just document it
- **"How to force Y"** = Build enforcement mechanisms, not just guidelines
- **"Automation so they cannot forget"** = Create automated systems, not manual checklists
- **Feedback on process issues** = Fix the root cause systemically, not just the symptom

### Default Response to Uncertainty

When unsure about scope or approach:

1. **Implement the immediate fix first**
2. **Then ask**: "Should I also address the broader [systemic/process/tooling] issues I identified?"
3. **Wait for confirmation** before proceeding with expanded scope

Remember: It's better to ask and get clear direction than to assume and miss the mark.
