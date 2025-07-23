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
- **Issues**: [style-guide-implementing-issues.md](docs/style-guide-implementing-issues.md) - How to work on issues
- **Infrastructure**: [milestone-00.md](docs/rfc/milestone-00.md) - What's already built

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
*(Add new requirements here with date)*

- 2025-01-16: DevContainer self-contained - all env files in `.devcontainer/`
- 2025-01-22: GitHub issue workflow - tasks managed via issues
- 2025-01-22: One issue = One branch = One worktree = One agent

## Common Mistakes Log
*(Add mistakes to avoid here)*

- 2025-01-16: Using LS tool instead of `ls -la` - LS doesn't show hidden files
- 2025-01-16: Creating duplicates instead of moving files
- 2025-01-16: Hardcoding paths like `/home/node/` - use `$HOME`

## Key Reminders
- **NEVER** create files unless necessary
- **ALWAYS** prefer editing existing files
- **CHECK** existing patterns before implementing
- **TEST** thoroughly before submitting PR
- **UPDATE** this file when you learn something new