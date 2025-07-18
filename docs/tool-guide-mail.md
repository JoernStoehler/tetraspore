# Tool Guide: mail

Simple file-based messaging system for agent-to-agent communication.

## Overview

The `mail` tool provides asynchronous communication between agents and the orchestrator. Messages are stored as markdown files in a shared directory, making them easy to debug and grep.

## Key Features

- **Shared mailbox** at `/workspaces/.agent-shared/mail/`
- **Log-like ordering** - newest messages at bottom (use `tail`)
- **Self-contained lines** - no headers, grep-friendly
- **Automatic read tracking** - messages marked READ when viewed
- **Simple filtering** - `--for` option to see specific agent's mail

## Commands

### mail send

Send a message to another agent or orchestrator.

```bash
mail send --to RECIPIENT --subject "SUBJECT" --body "BODY"

# Optional: specify sender (defaults to current context)
mail send --from SENDER --to RECIPIENT --subject "SUBJECT" --body "BODY"

# Examples
mail send --to main --subject "Task complete" --body "Button component ready for review"
mail send --to feat/api --subject "API needed" --body "Need endpoint for user preferences"
```

### mail inbox

List all messages in log format (newest last).

```bash
# Show all messages
mail inbox

# Show last 20 messages
mail inbox | tail -20

# Show messages for specific agent (as sender OR recipient)
mail inbox --for feat/ui

# Show unread messages
mail inbox | grep UNREAD

# Show messages from main
mail inbox | grep "main->"
```

Output format:
```
001 [READ  ] 2025-07-17T19:37:21 main->test/doc-agent: Task: Analyze the project structure
039 [UNREAD] 2025-07-18T09:46:23 test/manual->main: Status Update
```

Each line contains:
- Message ID (e.g., `001`)
- Status (`[READ  ]` or `[UNREAD]`)
- Timestamp
- Sender->Recipient
- Subject (truncated to 50 chars)

### mail read

Read a specific message and mark it as read.

```bash
mail read MESSAGE_ID

# Example
mail read 039
```

Output:
```
Message 039
--------------------------------------------------------------------------------
from: test/manual
to: main
subject: Status Update
date: 2025-07-18T09:46:23Z
--------------------------------------------------------------------------------
Hello from test/manual agent. Task is complete.
```

## Architecture

### Storage Format

Messages are stored as markdown files with YAML frontmatter:
```markdown
---
id: 039
from: test/manual
to: main
subject: Status Update
date: 2025-07-18T09:46:23Z
status: UNREAD
---

Message body goes here...
```

### File Structure
```
/workspaces/.agent-shared/mail/
├── messages/
│   ├── 001.md
│   ├── 002.md
│   └── ...
├── index.json    # Message index (legacy)
└── seq           # Next message ID
```

## Common Patterns

### Agent Checking Its Mail

```bash
# Agent feat/ui checking for new messages
mail inbox --for feat/ui | grep UNREAD | tail -10

# Read the latest unread message
mail inbox --for feat/ui | grep UNREAD | tail -1 | awk '{print $1}' | xargs mail read
```

### Orchestrator Monitoring

```bash
# See recent updates from all agents
mail inbox --for main | tail -20

# Check specific agent's progress
mail inbox | grep "feat/api->" | tail -5
```

### Task Assignment Flow

```bash
# 1. Orchestrator assigns task
mail send --to feat/auth --subject "Task" --body "Implement login flow with JWT"

# 2. Agent acknowledges
mail send --to main --subject "Task received" --body "Starting work on login flow"

# 3. Agent sends updates
mail send --to main --subject "Progress update" --body "JWT integration complete, testing endpoints"

# 4. Agent completes
mail send --to main --subject "Task complete" --body "Login flow ready. See auth.ts and tests."
```

### Inter-Agent Communication

```bash
# UI agent needs API
mail send --from feat/ui --to feat/api \
  --subject "Need user endpoint" \
  --body "Please create GET /api/user/:id endpoint"

# API agent responds
mail send --from feat/api --to feat/ui \
  --subject "Re: user endpoint" \
  --body "Endpoint ready at GET /api/user/:id. Returns {id, name, email}"
```

## Tips

### Grep Patterns

The self-contained format makes grep very powerful:

```bash
# Find all messages about tasks
mail inbox | grep -i task

# Find messages between specific agents  
mail inbox | grep "feat/ui->feat/api"

# Find messages on specific date
mail inbox | grep "2025-07-18"

# Find long subjects (might be cut off)
mail inbox | grep "\.\.\.:"
```

### Message IDs

- Sequential starting from 001
- Unique across all agents
- Never reused
- Padded to 3 digits in file names

### Performance

- Messages are just text files
- No database or daemon needed
- Fast even with hundreds of messages
- Easy to back up or version control

## Integration with workagent

The `workagent prepare` command automatically sends a welcome mail to new agents with their task assignment. Agents are instructed to:

1. Run `mail inbox --for BRANCH`
2. Read their task assignment
3. Send progress updates to main

This creates a natural workflow for task distribution and progress tracking.