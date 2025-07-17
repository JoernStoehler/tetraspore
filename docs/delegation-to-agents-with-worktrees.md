# Delegating to Agents with Git Worktrees

This guide describes how to orchestrate multiple AI coding agents working in parallel using git worktrees and a mail-based communication system.

## Architecture Overview

```
Human Owner
    ↓
Orchestrator Agent (main branch)
    ↓
Coding Agents (feature branches in separate screen sessions)
- feat/tree-ui
- feat/galaxy  
- feat/data-layer
```

## Core Components

### 1. Mail System
Agents communicate asynchronously through a simple mail system:

```bash
# Send a message
mail send --from main --to feat/tree-ui \
  --subject "Task assignment" \
  --body "Please implement the Tree of Life component"

# Check inbox
mail inbox

# Read message
mail read 017
```

### 2. WorkAgent Tool
The `workagent` command handles the complete agent lifecycle:

```bash
# Prepare workspace and task
workagent prepare --branch feat/tree-ui \
  --task "Implement Tree of Life visualization"

# Spawn agent in background screen session
workagent spawn --branch feat/tree-ui

# Check all agents
workagent status

# Attach to see agent working
workagent attach --branch feat/tree-ui

# Stop agent when done
workagent stop --branch feat/tree-ui
```

## Workflow Examples

### Basic Task Assignment

```bash
# 1. Orchestrator prepares and spawns agent
workagent prepare --branch feat/tree-ui \
  --task "Build Tree of Life component with D3.js"
workagent spawn --branch feat/tree-ui

# 2. Agent automatically starts working
# (Checks mail, reads TASK.md, begins implementation)

# 3. Orchestrator monitors progress
workagent status
mail inbox
workagent attach --branch feat/tree-ui  # Optional: watch live

# 4. Agent sends updates (from inside agent session)
mail send --from feat/tree-ui --to main \
  --subject "Progress update" \
  --body "TreeNode component complete, working on interactions"

# 5. When complete, orchestrator stops agent
workagent stop --branch feat/tree-ui

# 6. Review and integrate
cd ../tetraspore-feat-tree-ui
git diff main...HEAD
cat HANDOFF.md
npm test
cd ../tetraspore
git merge feat/tree-ui
git worktree remove ../tetraspore-feat-tree-ui
```

### Parallel Development

```bash
# Spawn multiple agents for different components
workagent prepare --branch feat/ui --task "Build UI components"
workagent spawn --branch feat/ui

workagent prepare --branch feat/backend --task "Implement state management"
workagent spawn --branch feat/backend

workagent prepare --branch feat/data --task "Create data models"
workagent spawn --branch feat/data

# Monitor all agents
workagent status

# Agents can communicate with each other
mail send --from feat/ui --to feat/data \
  --subject "Need data interface" \
  --body "What's the TypeScript interface for Tree nodes?"
```

### Handling Blocked Agents

```bash
# Agent reports being blocked (from inside agent session)
mail send --from feat/galaxy --to main \
  --subject "Blocked: routing bug" \
  --body "Found bug #17 blocking my work"

# Orchestrator spawns bug fix agent
workagent prepare --branch fix/routing-17 \
  --task "Fix routing bug reported in issue #17"
workagent spawn --branch fix/routing-17

# When fixed, notify original agent
mail send --from main --to feat/galaxy \
  --subject "Bug #17 fixed" \
  --body "Routing bug fixed in main, please pull latest"
```

## Communication Patterns

### Task Assignment Pattern
```
main → feat/X: "Task: [description]"
feat/X → main: "Task acknowledged"
feat/X → main: "Progress: [update]"
feat/X → main: "Task complete, see HANDOFF.md"
```

### Clarification Pattern
```
feat/X → main: "Question: [specific question]"
main → feat/X: "Answer: [clarification]"
```

### Peer Collaboration Pattern
```
feat/ui → feat/data: "Need: [requirement]"
feat/data → feat/ui: "Here's: [solution]"
```


## Best Practices

### 1. Clear Task Boundaries
- One agent per feature/fix
- No overlapping file ownership
- Document interfaces in TASK.md

### 2. Regular Communication
- Agents should send progress updates
- Check mail periodically during work
- Report blockers immediately

### 3. Structured Handoffs
Every agent must create HANDOFF.md:
```markdown
# Feature Name Handoff
## Completed: 2025-01-17
## Branch: feat/tree-ui

### What was built
- TreeOfLife component with D3.js
- Node expansion/collapse
- Event integration

### Key files
- src/components/TreeOfLife/index.tsx
- src/components/TreeOfLife/TreeNode.tsx
- src/components/TreeOfLife/__tests__/

### Integration notes
- Listens to 'tree-data-updated' events
- Emits 'node-selected' events
- Requires TreeData from data service

### Testing
npm test -- TreeOfLife
```

### 4. Clean Failure Handling
```bash
# If agent produces bad code
spawn-agent stop --branch feat/broken
cd ../tetraspore
git worktree remove ../tetraspore-feat-broken --force
git branch -D feat/broken
```

## Orchestrator Responsibilities

1. **Task Definition**: Create clear, bounded tasks
2. **Agent Management**: Spawn, monitor, stop agents
3. **Communication Hub**: Route messages, answer questions
4. **Quality Control**: Review all work before merging
5. **Conflict Resolution**: Handle merge conflicts
6. **Resource Management**: Stop stuck agents, clean up

## Quick Reference

```bash
# Prepare and spawn agent
workagent prepare --branch feat/X --task "Description"
workagent spawn --branch feat/X

# Send mail
mail send --from A --to B --subject "S" --body "B"

# Check mail
mail inbox
mail read ID

# Monitor agents
workagent status              # See all agents
workagent attach --branch X   # Watch specific agent
workagent stop --branch X     # Stop agent

# Review work
cd ../tetraspore-feat-X && git diff main

# Integrate
git merge feat/X

# Cleanup
git worktree remove ../tetraspore-feat-X
```

## Constraints & Limitations

- Agents cannot cd outside their worktree
- Agents run interactively (TUI mode)
- No real-time communication (poll-based mail)
- One orchestrator at a time (no orchestrator hierarchy)

## See Also

- [WorkAgent Tool Guide](./tool-guide-workagent.md) - Complete agent lifecycle management
- [Mail Tool Guide](./tool-guide-mail.md) - Agent communication system