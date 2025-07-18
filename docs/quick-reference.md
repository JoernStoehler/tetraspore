# Multi-Agent Orchestration Quick Reference

## Most Common Commands

### Start an Agent
```bash
workagent prepare --branch feat/NAME --task "Build X"
workagent spawn --branch feat/NAME
```

### Check Status
```bash
workagent status                    # All agents
mail inbox --for main | tail       # Recent messages
workagent attach --branch NAME      # Watch agent (Ctrl+B D to exit)
```

### Communicate
```bash
mail send --to BRANCH --subject "SUBJECT" --body "MESSAGE"
mail read ID                        # Read and mark as read
```

### Stop Agent
```bash
workagent stop --branch NAME
git worktree remove ../tetraspore-NAME
```

## Mail Inbox Format
```
039 [UNREAD] 2025-07-18T09:46:23 test/manual->main: Status Update
```
- Newest messages at bottom (use `tail`)
- Grep-friendly: `| grep UNREAD`, `| grep "main->"`, etc.

## Useful Patterns

### Check Agent's Mail
```bash
mail inbox --for feat/ui | grep UNREAD | tail
```

### Recent Activity
```bash
mail inbox | tail -20
```

### Find Messages
```bash
mail inbox | grep "feat/api"     # From or to feat/api
mail inbox | grep Task           # Task assignments
mail inbox | grep "2025-07-18"   # By date
```

### Multiple Agents
```bash
# Start several
workagent prepare --branch feat/ui --task "UI work" && workagent spawn --branch feat/ui
workagent prepare --branch feat/api --task "API work" && workagent spawn --branch feat/api

# Monitor all
workagent status
```

## File Locations
- Mail: `/workspaces/.agent-shared/mail/`
- Ports: `/workspaces/.agent-shared/allocated-ports`
- Worktrees: `../tetraspore-BRANCH/`
- Agent status: `../tetraspore-BRANCH/.agent/`

## Tips
- Branch names are slugified: `feat/my-ui` → `feat-my-ui`
- Agents start by checking mail and reading TASK.md
- Each agent gets ports starting from their allocated base (e.g., 3010-3012)
- Use tmux commands: `tmux ls`, `tmux attach -t agent-NAME`