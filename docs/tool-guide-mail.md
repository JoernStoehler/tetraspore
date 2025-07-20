# Tool Guide: mail

Simple file-based messaging system for agent-to-agent communication.

## Overview

The `mail` tool provides asynchronous communication between agents and the orchestrator. Messages are stored as markdown files in a shared directory, making them easy to debug and grep.

## Key Features

- **Shared mailbox** at `/workspaces/.agent-shared/mail/`
- **Log-like ordering** - newest messages at bottom (use `tail`)
- **Self-contained lines** - no headers, grep-friendly
- **Automatic read tracking** - messages marked READ when viewed
- **Required branch filtering** - `--for` flag is mandatory for inbox and expects a git branch name
- **Archive functionality** - messages can be archived and restored

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

List messages for a specific git branch. **The --for flag is required and expects a branch name (not agent name).**

```bash
# Show messages for specific branch (as sender OR recipient)
# Note: Use git branch name, not agent name
mail inbox --for feat/ui        # Feature branch
mail inbox --for main            # Main branch

# Show last 20 messages for branch
mail inbox --for main | tail -20

# Show unread messages for branch
mail inbox --for main | grep UNREAD

# Show archived messages
mail inbox --for main --archive
```

Output format:
```
001 [READ   ] 2025-07-17T19:37:21 main->test/doc-agent: Task: Analyze the project structure
039 [UNREAD ] 2025-07-18T09:46:23 test/manual->main: Status Update
042 [ARCHIVED] 2025-07-19T10:15:00 test->main: Old test message
```

Each line contains:
- Message ID (e.g., `001`)
- Status (`[READ   ]`, `[UNREAD ]`, or `[ARCHIVED]`)
- Timestamp
- Sender->Recipient
- Subject (truncated to 50 chars)

### mail read

Read a specific message and mark it as read. Cannot read archived messages.

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

### mail archive

Archive a message. Archived messages are hidden from normal inbox view.

```bash
mail archive MESSAGE_ID

# Example - archive old messages
mail archive 001
mail archive 002
```

### mail unarchive

Restore a message from archive. Message will be marked as READ.

```bash
mail unarchive MESSAGE_ID

# Example
mail unarchive 001
```

## Message States

Messages can have three states:
- **UNREAD** - New message, not yet read
- **READ** - Message has been read at least once
- **ARCHIVED** - Message moved to archive (hidden from normal view)

State transitions:
- UNREAD → READ (when read)
- READ → ARCHIVED (when archived)
- UNREAD → ARCHIVED (when archived without reading)
- ARCHIVED → READ (when restored)

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

**Important**: Agents use their git branch name for mail, not a separate agent name.

```bash
# Agent on branch 'feat/ui' checking for new messages
# Use the git branch name, not agent name
mail inbox --for feat/ui | grep UNREAD | tail -10

# Read the latest unread message
mail inbox --for feat/ui | grep UNREAD | tail -1 | awk '{print $1}' | xargs mail read
```

### Orchestrator Monitoring

```bash
# See recent updates from all agents
mail inbox --for main | tail -20

# Check specific branch's progress (must use --for with branch name)
mail inbox --for main | grep "feat/api->" | tail -5

# Archive old messages
mail inbox --for main | head -20 | awk '{print $1}' | xargs -I {} mail archive {}
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

### Mailbox Maintenance

```bash
# View archived messages
mail inbox --for main --archive

# Archive old read messages (example: first 10)
mail inbox --for main | grep READ | head -10 | awk '{print $1}' | xargs -I {} mail archive {}

# Restore accidentally archived message
mail unarchive 042
```

## Tips

### Grep Patterns

The self-contained format makes grep very powerful:

```bash
# Find all messages about tasks (after getting inbox)
mail inbox --for main | grep -i task

# Find messages between specific agents  
mail inbox --for main | grep "feat/ui->feat/api"

# Find messages on specific date
mail inbox --for main | grep "2025-07-18"

# Find long subjects (might be cut off)
mail inbox --for main | grep "\.\.\.:"

# Count unread messages
mail inbox --for main | grep -c UNREAD
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

### Error Prevention

The `--for` flag requirement prevents:
- Accidentally viewing all messages in the system
- Missing messages intended for you
- Information overload from irrelevant messages

**Note**: The `--for` parameter expects a git branch name (e.g., `main`, `feat/ui`, `feature/auth`), not an agent ID or username.

## Integration with workagent

The `workagent prepare` command automatically sends a welcome mail to new agents with their task assignment. Agents are instructed to:

1. Run `mail inbox --for BRANCH` (where BRANCH is their branch name)
2. Read their task assignment
3. Send progress updates to main

This creates a natural workflow for task distribution and progress tracking.

## Changes from Previous Version

1. **Breaking Change**: `mail inbox` now requires `--for BRANCH_NAME` flag
2. **New Feature**: Messages can be archived and restored
3. **New Feature**: Archived messages viewable with `--archive` flag
4. **Terminology Update**: "trash" renamed to "archive" for clarity - old commands still work

These changes improve mailbox management and prevent accidental viewing of all system messages. The terminology change from "trash" to "archive" better reflects the intended use - these messages are saved for later reference, not deleted.