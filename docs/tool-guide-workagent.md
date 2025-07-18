# Tool Guide: workagent

Complete lifecycle management for AI coding agents using tmux sessions, git worktrees, and shared infrastructure.

## Overview

The `workagent` tool manages AI agents that work on separate git branches in isolated environments. Each agent:
- Gets its own git worktree
- Runs in a tmux session with full TUI support
- Has unique ports to avoid conflicts
- Communicates via shared mail system

## Prerequisites

- tmux (`sudo apt-get install tmux`)
- Git with worktree support
- Node.js and npm
- `agent` command (Claude CLI)

## Commands

### workagent prepare

Set up a new worktree with task documentation.

```bash
workagent prepare --branch BRANCH --task "TASK DESCRIPTION"

# Example
workagent prepare --branch feat/nav --task "Build navigation component with dropdown menus"
```

What it does:
1. Creates git worktree at `../tetraspore-<branch-slug>`
2. Copies `.env` from main worktree
3. Allocates unique ports in `.env.local` via shared registry
4. Runs `npm install`
5. Creates `TASK.md` with assignment details
6. Sends welcome mail to agent

### workagent spawn

Start an agent in a detached tmux session.

```bash
workagent spawn --branch BRANCH [--model MODEL]

# Example with default model
workagent spawn --branch feat/nav

# Example with specific model
workagent spawn --branch feat/nav --model opus
workagent spawn --branch feat/simple-ui --model sonnet
```

Model options:
- `opus` - Claude Opus 4: Slower, expensive, deep intelligence. Best for:
  - Designing architectures
  - Decomposing complex tasks
  - Research and analysis
  - Critical decision making
- `sonnet` - Claude Sonnet 4: Faster, cheaper, effective. Best for:
  - Implementing designed architectures
  - Straightforward coding tasks
  - Following clear specifications
  - Routine development work

Starts the agent with:
- Session name: `agent-<branch-slug>`
- Working directory: The worktree
- Initial prompt to check mail and read TASK.md
- Full TUI support with proper colors
- Background execution in tmux
- Specified AI model (or default if not provided)

### workagent attach

Connect to a running agent's interactive session.

```bash
workagent attach --branch BRANCH

# Example
workagent attach --branch feat/nav
```

- Connects to the agent's tmux session
- Shows agent's interactive TUI
- Press `Ctrl+B` then `D` to detach
- Full color support (better than screen)

### workagent status

Show all running agents.

```bash
workagent status
```

Output:
```
→ Agent Status

BRANCH              STATUS          SESSION                        WORKTREE
--------------------------------------------------------------------------------
feat/nav            DETACHED        agent-feat-nav                 ../tetraspore-feat-nav
feat/api            ATTACHED        agent-feat-api                 ../tetraspore-feat-api
```

### workagent stop

Stop a running agent.

```bash
workagent stop --branch BRANCH

# Example
workagent stop --branch feat/nav
```

## Complete Workflow Example

```bash
# 1. Prepare workspace and task
workagent prepare --branch feat/button --task "Create reusable Button component with hover states"

# 2. Spawn the agent (sonnet is good for straightforward implementation)
workagent spawn --branch feat/button --model sonnet

# 3. Optional: Watch the agent work
workagent attach --branch feat/button
# (Press Ctrl+B then D to detach)

# 4. Monitor from orchestrator side
mail inbox --for main | tail
workagent status

# 5. Communicate with agent
mail send --to feat/button --subject "Update" --body "Please add disabled state too"

# 6. When complete, stop agent
workagent stop --branch feat/button

# 7. Clean up worktree
git worktree remove ../tetraspore-feat-button
git branch -d feat/button
```

## Architecture

### Shared Infrastructure

All agents share common resources through `/workspaces/.agent-shared/`:
- `mail/` - Inter-agent communication
- `allocated-ports` - Port registry to prevent conflicts

### Port Allocation

Each agent gets 3 consecutive ports:
- `VITE_DEV_PORT` - Development server
- `VITE_PREVIEW_PORT` - Preview server  
- `VITE_DEBUG_PORT` - Debug port

Ports are allocated from a shared registry to prevent conflicts between parallel agents.

### Session Management

Agents run in tmux sessions named `agent-<branch-slug>`. Benefits over screen:
- Better color rendering
- More modern terminal emulation
- Same detach/attach workflow

## Tips & Troubleshooting

### Branch Names
- Automatically "slugified" for compatibility
- `feat/my-branch` becomes `feat-my-branch` in session names

### Finding Agent Output
- Agents run interactively in tmux (no automatic logging)
- Use `workagent attach` to see what agent is doing
- Check worktree for files agent creates

### Port Conflicts
- Check `/workspaces/.agent-shared/allocated-ports`
- Each line shows `branch:port` allocation
- Ports are reserved even after agent stops (prevents reuse issues)

### Mail Integration
- Agents start with instruction to check mail
- Use `mail inbox --for BRANCH` to see agent's messages
- See [mail tool guide](tool-guide-mail.md) for details

### Multiple Agents
- Run many agents in parallel on different branches
- Each gets isolated worktree and ports
- Monitor all with `workagent status`

## Common Patterns

### Research Agent
```bash
# Agent that analyzes without changing code
workagent prepare --branch research/architecture \
  --task "Document current architecture and suggest improvements"
```

### Parallel Feature Development
```bash
# Start multiple agents on related features
# Complex UI design needs opus
workagent prepare --branch feat/ui --task "Design and build complex interactive UI"
workagent spawn --branch feat/ui --model opus

# Straightforward API implementation can use sonnet
workagent prepare --branch feat/api --task "Build REST API endpoints per spec"  
workagent spawn --branch feat/api --model sonnet

# Monitor both
workagent status
```

### Agent Handoff
```bash
# Agent 1 completes initial work
workagent prepare --branch feat/backend --task "Build data models"
workagent spawn --branch feat/backend

# Later, prepare handoff for Agent 2
echo "Backend models complete. See models.py" > HANDOFF.md
git add . && git commit -m "Complete data models"

# Agent 2 continues the work
workagent prepare --branch feat/backend-api \
  --task "Build REST API using models from feat/backend branch"
```