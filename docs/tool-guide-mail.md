# Tool Guide: mail

A simple mail system for agent-to-agent communication.

## Commands

### mail send
Send a message to another agent.

```bash
mail send --from SENDER --to RECIPIENT --subject "SUBJECT" --body "BODY"

# Example
mail send --from main --to feat/tree-ui \
  --subject "Task assignment" \
  --body "Please implement the Tree of Life component according to specification.md"
```

### mail inbox
Check inbox for messages.

```bash
mail inbox [--for RECIPIENT] [--unread] [--limit N]

# Examples
mail inbox --for feat/tree-ui
mail inbox --for main --unread
```

Output format:
```
TIMESTAMP            ID   STATUS  FROM           TO              SUBJECT
2025-01-17 20:06:05  017  UNREAD  main           feat/galaxy     Re: Bug: routing is broken
2025-01-17 18:30:10  014  READ    main           feat/galaxy     Progress checkin
```

### mail read
Read a specific message.

```bash
mail read ID

# Example
mail read 017
```

Output format:
```
ID: 017
From: main
To: feat/galaxy
Subject: Re: Bug: routing is broken
Date: 2025-01-17 20:06:05
Reply-To: 016
Status: UNREAD

Thanks for reporting. I've assigned feat/bug-fix-routing to handle issue #17.
```

### mail reply
Reply to a message.

```bash
mail reply ID --from SENDER --body "BODY"

# Example
mail reply 017 --from feat/galaxy \
  --body "Thanks! I'll continue with visualization while waiting."
```

## Storage

Messages are stored in `.agent-mail/`:
```
.agent-mail/
├── messages/
│   ├── 001.md     # Individual messages
│   ├── 002.md
│   └── ...
├── index.json     # Message metadata
└── seq            # Next message ID
```

## Common Patterns

### Task Assignment
```bash
# Orchestrator assigns task
mail send --from main --to feat/ui --subject "Task" --body "Build UI"

# Agent acknowledges
mail send --from feat/ui --to main --subject "Starting" --body "Acknowledged"

# Agent completes
mail send --from feat/ui --to main --subject "Done" --body "See HANDOFF.md"
```

### Asking Questions
```bash
# Agent needs help
mail send --from feat/ui --to feat/data \
  --subject "Question: data format" \
  --body "What's the interface for TreeNode?"

# Peer responds
mail reply 020 --from feat/data \
  --body "Use TreeNode from src/types/tree.ts"
```

## Tips for Agents

1. **Check mail regularly**: Run `mail inbox --for YOUR_BRANCH --unread`
2. **Include context**: Don't assume the recipient knows what you're working on
3. **Use clear subjects**: Help others prioritize messages
4. **Reply to threads**: Use `mail reply` to maintain conversation context