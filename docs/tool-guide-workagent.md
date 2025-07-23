# Tool Guide: workagent

Simplified issue-based agent spawner that implements the principle: One issue = One branch = One worktree = One agent.

## Overview

The `workagent` tool creates an isolated git worktree for each GitHub issue and shows you the command to spawn an AI agent to work on it. This replaces the previous complex orchestration system with a simple, human-driven workflow.

## Usage

```bash
workagent ISSUE_NUMBER [OPTIONS]
```

### Options

- `--model MODEL` - AI model to use (opus, sonnet, gemini, flash) [required unless --prepare-only]
- `--prepare-only` - Only set up the worktree, don't show the agent command
- `--help` - Show help message

### Examples

```bash
# Prepare worktree and show agent command
workagent 123 --model opus

# Only prepare the worktree
workagent 123 --prepare-only
```

## How It Works

1. **Validates the issue**: Checks that the GitHub issue exists and is open
2. **Creates a branch**: Named `issue-NUMBER` (or reuses existing)
3. **Sets up worktree**: At `../tetraspore-issue-NUMBER`
4. **Allocates ports**: Unique ports for dev server, preview, and debug
5. **Installs dependencies**: Runs `npm install` in the worktree
6. **Shows agent command**: Displays the command to run with `/implement-issue NUMBER`

## Workflow

### 1. Human Creates Issue
Create a GitHub issue following the template in `.github/ISSUE_TEMPLATE/task.md`

### 2. Prepare Worktree and Start Agent
```bash
# Prepare the worktree
workagent 123 --model opus

# Copy and run the displayed command
cd ../tetraspore-issue-123 && agent --model opus '/implement-issue 123'
```

### 3. Agent Works
- Agent reads issue with `gh issue view 123`
- Implements the solution
- Communicates via `gh issue comment`
- Submits PR when done

### 4. Cleanup
```bash
# From main worktree
git worktree remove ../tetraspore-issue-123
git branch -d issue-123
```

## Port Allocation

Each worktree gets unique ports to avoid conflicts:
- Dev server: 3000 + (n*3)
- Preview: 3001 + (n*3)
- Debug: 3002 + (n*3)

Ports are allocated automatically and stored in `.env.local` in each worktree.

## Model Selection

- **opus**: Complex tasks, architecture, research
- **sonnet**: Implementation from specs, routine tasks
- **gemini**: Alternative perspective, multi-modal tasks
- **flash**: Quick tasks, fast responses

## Directory Structure

```
tetraspore/                    # Main worktree
├── .env                      # Shared environment
└── .env.local               # Main worktree ports

../tetraspore-issue-123/      # Agent worktree
├── .env                     # Copied from main
├── .env.local              # Unique ports
└── [all project files]
```

## Error Handling

The script validates:
- Issue number is numeric
- Issue exists and is accessible
- Warns about uncommitted changes (won't be in new worktree)
- Offers options if branch/worktree already exists:
  - Use existing
  - Remove and recreate
  - Exit
- Running from main worktree (with override option)

## Tips

1. **Always run from main worktree** for consistency
2. **Check issue state** - script warns if issue is closed
3. **Use --prepare-only** if you want to set up manually
4. **Modify the command** if you want custom instructions instead of `/implement-issue`

## Comparison with Previous System

| Old System | New System |
|------------|------------|
| Complex orchestration | Simple spawning |
| Inter-agent mail | GitHub issue comments |
| Detached tmux sessions | Interactive TUI |
| Print mode | TUI mode |
| Manual prepare + spawn | Single setup command |

## Common Issues

**"Branch/worktree already exists"**
- The script now offers options:
  1. Use existing (continue work)
  2. Remove and recreate (start fresh)
  3. Exit

**"Could not fetch issue"**
- Check issue number is correct
- Ensure you're authenticated: `gh auth status`

**Port conflicts**
- The script automatically finds free ports
- If issues persist, check `.env.local` files in other worktrees