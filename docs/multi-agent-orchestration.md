# Multi-Agent Orchestration System

## Overview

This system enables multiple AI agents to work in parallel on different aspects of a project, each in their own isolated environment with inter-agent communication.

## Key Components

### 1. **workagent** - Agent Lifecycle Management
- Prepares isolated git worktrees for each agent
- Spawns agents in tmux sessions with full TUI support
- Allocates unique ports to prevent conflicts
- Provides status monitoring and session attachment

### 2. **mail** - Inter-Agent Communication
- Simple file-based messaging system
- Shared mailbox at `/workspaces/.agent-shared/mail/`
- Automatic read/unread tracking
- Log-like format with newest messages last

### 3. **Shared Infrastructure**
- `/workspaces/.agent-shared/mail/` - Message storage
- `/workspaces/.agent-shared/allocated-ports` - Port registry
- Prevents conflicts between parallel agents

## Quick Start

### Single Agent Workflow
```bash
# 1. Prepare agent workspace
workagent prepare --branch feat/auth --task "Implement JWT authentication"

# 2. Start the agent
workagent spawn --branch feat/auth

# 3. Monitor progress
mail inbox --for main | tail
workagent attach --branch feat/auth  # Watch agent work

# 4. Communicate
mail send --to feat/auth --subject "Update" --body "Please add refresh tokens"

# 5. Clean up when done
workagent stop --branch feat/auth
git worktree remove ../tetraspore-feat-auth
```

### Multi-Agent Parallel Development
```bash
# Start UI agent
workagent prepare --branch feat/ui --task "Build dashboard components"
workagent spawn --branch feat/ui

# Start API agent
workagent prepare --branch feat/api --task "Create REST endpoints"
workagent spawn --branch feat/api

# Start data agent
workagent prepare --branch feat/data --task "Design database schema"
workagent spawn --branch feat/data

# Monitor all agents
workagent status
mail inbox --for main | tail -20
```

## Architecture Benefits

### Isolation
- Each agent works in its own git worktree
- No file conflicts between agents
- Independent dependency installations
- Unique port allocations

### Communication
- Asynchronous messaging via mail system
- Agents can coordinate without blocking
- Full conversation history preserved
- Easy to debug with simple text files

### Scalability
- Run as many agents as needed
- Each in its own tmux session
- Minimal resource overhead
- No complex infrastructure required

## Common Patterns

### Task Decomposition
Break large features into parallel work:
```bash
# Main feature
workagent prepare --branch feat/shopping-cart --task "Implement shopping cart"

# Sub-features in parallel
workagent prepare --branch feat/cart-ui --task "Build cart UI components"
workagent prepare --branch feat/cart-api --task "Create cart API endpoints"
workagent prepare --branch feat/cart-db --task "Design cart data model"
```

### Research and Implementation
```bash
# Research agent (read-only)
workagent prepare --branch research/patterns --task "Document current patterns"

# Implementation agents use research
workagent prepare --branch feat/refactor --task "Refactor using patterns from research/patterns"
```

### Sequential Handoffs
```bash
# Phase 1: Backend
workagent prepare --branch feat/backend --task "Build data models"
# ... agent completes work ...

# Phase 2: API (depends on backend)
workagent prepare --branch feat/api --task "Build API using models from feat/backend"
```

## Best Practices

### Clear Task Definitions
- Be specific about what each agent should do
- Include success criteria
- Reference related branches/work

### Regular Communication
- Agents should send progress updates
- Use clear subject lines
- Include context in messages

### Branch Naming
- Use descriptive prefixes (feat/, fix/, research/)
- Keep names short for readability
- Avoid special characters

### Monitoring
- Check `workagent status` regularly
- Review recent mail with `mail inbox | tail`
- Attach to agents to see live progress

## Troubleshooting

### Agent Not Responding
```bash
# Check if agent is running
workagent status

# Attach to see what it's doing
workagent attach --branch BRANCH

# Check for recent mail
mail inbox --for BRANCH | tail
```

### Port Conflicts
```bash
# Check allocated ports
cat /workspaces/.agent-shared/allocated-ports

# Each agent should have unique ports
```

### Mail Not Delivered
```bash
# Verify shared mail directory
ls -la /workspaces/.agent-shared/mail/messages/

# Check message format
mail read LAST_MESSAGE_ID
```

## Advanced Usage

### Custom Agent Commands
```bash
# Set custom agent command (default: agent)
AGENT_CMD="agent --model opus" workagent spawn --branch feat/complex
```

### Batch Operations
```bash
# Stop all agents
for branch in $(workagent status | grep DETACHED | awk '{print $1}'); do
  workagent stop --branch $branch
done
```

### Integration with CI/CD
Agents can:
- Run tests after implementation
- Create pull requests
- Update issue trackers
- Deploy to staging environments

## Summary

This system provides a robust framework for orchestrating multiple AI agents:
- **Isolated environments** via git worktrees
- **Reliable communication** via shared mail
- **Easy monitoring** via tmux sessions
- **Conflict prevention** via port allocation

The simplicity of file-based storage and standard Unix tools makes it debuggable, scriptable, and extensible.