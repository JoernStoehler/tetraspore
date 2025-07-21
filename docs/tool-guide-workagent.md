# Tool Guide: workagent

Git worktree and AI agent lifecycle management with explicit ownership and clear communication.

## Overview

The `workagent` tool manages AI agents working on separate git branches in isolated environments. Key principles:

- **One branch = One agent = One lifecycle** (no agent reuse)
- **Explicit over implicit** - fail fast on ambiguity
- **Append-only context** - use --continue or start fresh
- **Clear ownership** - each worktree belongs to one agent forever
- **Print mode execution** - agents terminate naturally, no stdin issues

## Prerequisites

- tmux (`sudo apt-get install tmux`)
- Git with worktree support
- Node.js and npm
- `agent` command (Claude CLI)

## Commands

### workagent prepare

Set up a new worktree with environment.

```bash
workagent prepare --branch BRANCH [--from SOURCE]

# Examples
workagent prepare --branch feat/auth                    # From main (when in main worktree)
workagent prepare --branch feat/auth --from develop     # From specific branch
workagent prepare --branch review/auth-v1 --from feat/auth  # For reviews
```

What it does:
1. Creates git worktree at `../tetraspore-<branch-slug>`
2. Creates new branch from SOURCE (or checks out existing)
3. Copies `.env` from main worktree
4. Allocates unique ports in `.env.local`
5. Runs `npm install`
6. Creates `.agent/` metadata directory

Smart defaults:
- In main worktree: `--from main` is implicit
- Elsewhere: `--from` is required for new branches
- Existing branches: just check out (no --from needed)

Output reminds you to create task file and shows run command.

### workagent run

Execute agent with a message.

```bash
workagent run --branch BRANCH --message "MESSAGE" [--continue] [--model MODEL]

# Start fresh (first run)
workagent run --branch feat/auth --message "Read AGENT_BRANCH_TASK.md and implement authentication"

# Continue conversation (after agent stopped)
workagent run --branch feat/auth --continue --message "Add input validation to the login endpoint"

# With specific model
workagent run --branch feat/auth --message "Design the auth architecture" --model opus

# Message from file
cat instructions.md | workagent run --branch feat/auth --message -
```

Key behaviors:
- **Must specify --continue** if agent has history
- **Must NOT use --continue** if starting fresh
- Runs with `agent --print` (no TUI, proper logs)
- Agent terminates when done (natural pause points)
- Creates `.agent/session.log` with full history
- Errors on unknown parameters

Model options:
- `opus` - Claude Opus 4: Deep intelligence for complex tasks
- `sonnet` - Claude Sonnet 4: Fast and efficient for routine tasks
- `gemini-2.5-pro` or `gemini` - Gemini 2.5 Pro: Advanced reasoning
- `gemini-2.5-flash` or `flash` - Gemini 2.5 Flash: Fast responses
- **Model parameter is required** - no default

### workagent status

Show all agents and their status.

```bash
workagent status
```

Output:
```
→ Agent Status

BRANCH                   STATUS       SESSION              LAST ACTIVITY
--------------------------------------------------------------------------------
feat/auth                RUNNING      agent-feat-auth      2025-07-19T10:30:00Z
review/auth-v1           STOPPED      agent-review-auth-v1 2025-07-19T10:45:00Z
```

Status values:
- **RUNNING** - Agent process is active
- **STOPPED** - No agent process

### workagent attach

Connect to a running agent's output.

```bash
workagent attach --branch BRANCH

# Example
workagent attach --branch feat/auth
```

- Shows agent's real-time output
- Press `Ctrl+B` then `D` to detach
- Read-only observation (no stdin to agent)

## Complete Workflow Examples

### New Feature Development

```bash
# 1. Prepare workspace
workagent prepare --branch feat/auth

# 2. Create task file (optional but recommended)
Write('../tetraspore-feat-auth/AGENT_BRANCH_TASK.md', '# Authentication Implementation

## Requirements
- JWT-based authentication
- Login/logout endpoints
- Session management
- Password hashing with bcrypt

## Success Criteria
- All tests pass
- Secure implementation
- Follows project patterns
')

# 3. Start agent
workagent run --branch feat/auth --message "Read AGENT_BRANCH_TASK.md and implement the authentication system"

# 4. Monitor progress
workagent status
mail inbox --for main

# 5. Continue conversation after agent stops
workagent run --branch feat/auth --continue --message "Good work! Now add rate limiting to prevent brute force attacks"

# 6. Attach to see output (if still running)
workagent attach --branch feat/auth
```

### Code Review Workflow

```bash
# 1. Create review branch from feature
workagent prepare --branch review/auth-v1 --from feat/auth

# 2. Run review
workagent run --branch review/auth-v1 --message "Review this branch for security vulnerabilities, code quality, and adherence to project patterns. Create REVIEW_REPORT.md with findings."

# 3. Fix issues based on review
workagent prepare --branch fix/auth-review --from feat/auth
workagent run --branch fix/auth-review --message "Read ../tetraspore-review-auth-v1/REVIEW_REPORT.md and fix all critical issues"
```

### Research and Architecture

```bash
# Use Opus for complex analysis
workagent prepare --branch research/performance
workagent run --branch research/performance --model opus --message "Analyze the codebase for performance bottlenecks. Focus on database queries, API endpoints, and React rendering. Document findings in PERFORMANCE_ANALYSIS.md"
```

## Key Differences from Old Design

| Old Behavior | New Behavior | Why |
|--------------|--------------|-----|
| `spawn` with hardcoded prompt | `run` with custom message | Flexibility |
| `--task` parameter on spawn | Manual task file creation | Explicit > implicit |
| Agents could be reused | One agent per branch forever | No context confusion |
| TUI mode (stdin issues) | Print mode only | Clean termination |
| Silent parameter failures | Errors on unknown args | Fail fast |
| ATTACHED/DETACHED status | RUNNING/STOPPED | Clarity |

## Architecture

### Directory Structure

Each worktree contains:
```
../tetraspore-feat-auth/
├── .agent/
│   ├── branch           # Branch name
│   ├── status           # RUNNING or STOPPED
│   ├── session.log      # Full agent history
│   ├── history.jsonl    # Conversation history
│   ├── prepared         # When worktree was prepared
│   ├── last_run         # Last run timestamp
│   └── stopped          # Stop timestamp
├── .env                 # Copied from main
├── .env.local           # Unique ports
├── AGENT_BRANCH_TASK.md # Task description (optional)
└── ... (project files)
```

### Port Allocation

Same as before - each agent gets 3 consecutive ports via shared registry.

### Communication Patterns

1. **Initial task**: Via message + optional task file
2. **During execution**: Via mail system
3. **Continuation**: Via --continue with new message
4. **Monitoring**: Via attach (output) and mail (messages)

## Tips & Best Practices

### Task Files

While optional, creating `AGENT_BRANCH_TASK.md` is recommended:
- Provides persistent reference for agent
- Documents requirements clearly
- Can be updated between runs

### Message Patterns

```bash
# Reference task file
--message "Read AGENT_BRANCH_TASK.md and implement"

# Direct instructions
--message "Fix the type errors in auth.service.ts"

# Continue with context
--continue --message "Great! Now add error handling"

# From file
cat detailed_instructions.md | workagent run --branch feat/ui --message -
```

### Model Selection

- **Opus**: Architecture, complex algorithms, security analysis, integration
- **Sonnet**: Implementation from specs, tests, documentation, simple fixes

### Avoiding Common Mistakes

1. **Don't reuse old worktrees** - Always use fresh branches for new tasks
2. **Check --continue carefully** - Script will error if used incorrectly  
3. **Create task files explicitly** - No hidden TASK.md creation
4. **One agent at a time** - Can't run multiple agents on same branch

### Debugging

- Check `.agent/session.log` for full history
- Use `workagent status` to see what's running
- Attach to see real-time output
- Check mail for agent messages

## Migration from Old Tool

```bash
# Old way (don't do this anymore)
workagent prepare --branch feat/ui --task "Build UI"  # Created TASK.md
workagent spawn --branch feat/ui                       # Fixed prompt

# New way
workagent prepare --branch feat/ui
Write('../tetraspore-feat-ui/AGENT_BRANCH_TASK.md', 'Build UI components...')
workagent run --branch feat/ui --message "Read AGENT_BRANCH_TASK.md and build the UI"
```

The new design prevents the context confusion issues we experienced with review agents!