# Tetraspore - Project Overview & Agent Instructions

## Quick Start
Tetraspore is a React-based static web application for evolutionary simulation. Multiple AI agents work on different git worktrees simultaneously, each requiring isolated development environments.

## Repository Structure

```
tetraspore/
├── .devcontainer/        # Development container configuration
│   ├── .env             # Container-specific config (Honeycomb telemetry, API keys)
│   ├── .config/         # Environment config files
│   └── bin/             # Custom tools (workagent, mail, agent wrapper)
├── docs/                # Detailed documentation
│   ├── agent-orchestration-guide.md    # Multi-agent workflow patterns
│   ├── tool-guide-workagent.md         # workagent command reference
│   ├── tool-guide-mail.md              # mail command reference
│   ├── tool-guide-agent.md             # agent (Claude CLI) details
│   ├── tool-guide-playwright.md        # MCP Playwright browser automation
│   └── templates/                      # Templates for agent tasks
├── src/                 # React application source
│   ├── components/      # React components (TreeOfLife, etc.)
│   ├── dsl/            # Domain-specific language for game events
│   ├── llm/            # LLM integration (mock and real)
│   └── store/          # Zustand state management
├── tests/              # E2E tests (Playwright)
├── CLAUDE.md           # This file - high-level overview
├── MILESTONES.md       # Project tracking - features, tasks, issues
├── package.json        # Dependencies and scripts
├── .env.example        # Template for environment variables
├── .env                # Actual configuration (git-ignored)
└── .env.local          # Worktree-specific overrides (git-ignored)
```

## Critical Agent Guidelines

### DevContainer Self-Contained Principle
**RULE**: ALL development environment files must be inside `.devcontainer/` directory structure.

**WHY**: Any developer should be able to clone the repo, open in VS Code, and have a working environment without needing files from outside `.devcontainer/`.

**IF YOU FIND**: Environment config files elsewhere (like `.config/`, `.vscode/settings.json`, etc.), move them into `.devcontainer/` and update any references.

### Basic Investigation Commands
**File system exploration**: Use `ls -la` command, NOT the LS tool. The LS tool does not show hidden files (files starting with `.`).

**When investigating missing files**: Always use shell commands like `ls -la`, `find`, or `tree -a` to see ALL files including hidden ones.

### Problem-Solving Approach
**Read requirements carefully**: If a human explains a principle or chooses an approach, follow it completely through to its logical conclusion.

**Don't create workarounds**: If the solution is "move file X to location Y", do exactly that - don't create duplicates or partial solutions.

**Ask before assuming**: If you're uncertain about project conventions, ask directly rather than guessing.

## Learning System

### When A Human Gives You New Project Requirements
1. **Add to Requirements Log below**: Add a new bullet point with date, requirement, and reasoning
2. **Do NOT modify the guideline sections above**: Leave "DevContainer Self-Contained Principle" and other guideline sections unchanged
3. **Commit with message**: "docs: add requirement - [brief description]"

### When You Make A Mistake That Future Agents Should Avoid
1. **Add to Common Mistakes Log below**: Add a new bullet point with date, what went wrong, and how to prevent it
2. **Do NOT modify the guideline sections above**: Leave "Basic Investigation Commands" and other guideline sections unchanged  
3. **Commit with message**: "docs: add common mistake - [brief description]"

### Requirements Log
*(New requirements get added here with date and reasoning)*

- 2025-07-16: DevContainer self-contained principle - all env files in `.devcontainer/` for consistent setup across developers
- 2025-07-20: Testing infrastructure - implemented Option B comprehensive testing with Playwright + MSW + Vitest coverage

### Common Mistakes Log
*(Mistakes and their prevention get added here)*

- 2025-07-16: Using LS tool instead of `ls -la` - LS tool doesn't show hidden files, always use shell commands for file investigation
- 2025-07-16: Creating duplicate files instead of moving - when told to relocate files, move them completely, don't create copies
- 2025-07-16: Hardcoding user paths like `/home/node/` - always use `$HOME` for user directories to work with any username
- 2025-07-19: Agents trying to cd into other directories - agents can only operate smoothly within a single top-level directory (their git worktree). Tools may malfunction if agent tries to cd elsewhere
- 2025-07-19: Claiming to monitor without actually monitoring - when waiting for agents to complete, use a bash loop with sleep, not just claim you're monitoring while sitting in input mode
- 2025-07-19: Trying to have one agent review multiple worktrees - agents are confined to their worktree, spawn separate review agents per branch
- 2025-07-19: Using unknown parameters with tools - always verify command syntax before use (e.g., workagent spawn had no --task parameter)
- 2025-07-20: Reusing existing branch names - violates 1:1:1 principle, always run `git branch -a | grep pattern` before naming branches
- 2025-07-20: Not instructing agents to send mail - agents only do what's explicitly requested, always include communication requirements in AGENT_BRANCH_TASK.md
- 2025-07-20: Passive monitoring without checking deliverables - don't just wait for mail, actively check for HANDOFF.md and git status
- 2025-07-20: Using `while true` loops - infinite loops are an anti-pattern, use bounded `for` loops with exit conditions instead
- 2025-07-21: Expecting HTML reports from E2E tests - Playwright is configured to use 'list' reporter by default (no browser windows), use `npx playwright test --reporter=html` if needed

## Key Files to Know

### For Project Status
- **@MILESTONES.md** - Current project state, completed features, planned tasks, known issues
- **@docs/agent-orchestration-guide.md** - Multi-agent workflow and patterns

### For Development
- **@package.json** - See available npm scripts
- **@src/** - Application source code
- **@.env.example** - Required environment variables

### For Agent Work
- **@docs/tool-guide-workagent.md** - How to manage agent workspaces
- **@docs/tool-guide-mail.md** - How to communicate between agents
- **AGENT_BRANCH_TASK.md** - Task specifications (in each worktree)

## DevOps Quick Reference

### Environment Setup
```bash
# Copy main .env file (contains secrets)
cp /path/to/main/worktree/.env .env

# For non-main branches, create port overrides
cp .env.local.example .env.local
# Edit .env.local to set unique ports
```

### Development Commands
```bash
# Start dev server (non-blocking)
npm run dev > .logs/dev.log 2>&1 &

# Run tests
npm test                   # Unit tests in watch mode
npm test -- --run          # Unit tests once (80 tests)
npm run test:e2e           # E2E tests (headless, no browser windows)
npm run test:all           # All tests once
npm run lint               # ESLint
npm run build              # Production build

# E2E Testing Notes:
# - Playwright runs headless by default (no browser windows)
# - Uses 'list' reporter for clean terminal output
# - To see browser: npx playwright test --headed
# - For HTML report: npx playwright test --reporter=html

# Use Claude with telemetry
agent [your-command]
```

### Multi-Agent Commands
```bash
# Prepare workspace and spawn agent
workagent prepare --branch feature/xyz --task "Your task"
workagent spawn --branch feature/xyz --model opus

# Monitor agents
workagent status
mail inbox --for main

# Continue work after agent stops
workagent run --branch feature/xyz --continue --message "Continue with..."
```

## AI-Specific Notes

### MCP Servers Available
- **tavily**: Web search (needs `TAVILY_API_KEY`)
- **context7**: Library documentation
- **playwright**: Browser automation

### Model Selection
- **opus**: Complex tasks, architecture, research
- **sonnet**: Implementation from specs, routine tasks

### Agent Best Practices
1. Always check `@MILESTONES.md` for current project state
2. Use `@file` references to preload context
3. Create HANDOFF.md when completing tasks
4. Send mail updates to orchestrator
5. Follow the UI-first development pipeline (see @MILESTONES.md)

## Where to Find More Information

- **Multi-agent orchestration**: @docs/agent-orchestration-guide.md
- **Tool documentation**: @docs/tool-guide-*.md
  - Browser automation: @docs/tool-guide-playwright.md
  - Agent management: @docs/tool-guide-workagent.md
  - Inter-agent mail: @docs/tool-guide-mail.md
- **Project milestones & tasks**: @MILESTONES.md
- **Task templates**: @docs/templates/
- **Development patterns**: See "Development Principles" in @MILESTONES.md

## Important Reminders

- **NEVER** create files unless necessary
- **ALWAYS** prefer editing existing files
- **NEVER** proactively create documentation unless requested
- **UPDATE** this file when you learn new requirements or make mistakes others should avoid