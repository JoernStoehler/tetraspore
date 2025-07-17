# Tool Guide: workagent

Complete lifecycle management for AI coding agents, including workspace preparation, agent spawning, and session management.

## Prerequisites

- GNU Screen (`sudo apt-get install screen`)
- Git with worktree support
- Node.js and npm

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
3. Allocates unique ports in `.env.local`
4. Runs `npm install`
5. Creates `TASK.md` with assignment details
6. Sends welcome mail to agent

Output shows each step:
```
→ Preparing worktree for branch: feat/nav
→ Creating worktree at ../tetraspore-feat-nav
  Created new branch: feat/nav
✓ Worktree created
→ Setting up environment
  Copied .env file
  Allocated ports: dev=3010, preview=3011, debug=3012
→ Installing dependencies
✓ Dependencies installed
→ Creating task documentation
  Created TASK.md
→ Sending task assignment via mail
Mail sent. ID: 001
✓ Worktree prepared successfully!

Next step:
  workagent spawn --branch feat/nav
```

### workagent spawn
Start an agent in a detached screen session.

```bash
workagent spawn --branch BRANCH

# Example
workagent spawn --branch feat/nav
```

What it does:
1. Creates screen session named `agent-<branch-slug>`
2. Starts agent with instructions to check mail and read task
3. Logs all output to `.agent/session.log`
4. Runs in background (detached)

### workagent attach
Connect to a running agent's session.

```bash
workagent attach --branch BRANCH

# Example
workagent attach --branch feat/nav
```

- Attaches to the agent's screen session
- See live agent output and interactions
- Press `Ctrl+A` then `D` to detach without stopping agent

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
feat/nav            DETACHED        agent-feat-nav (PID 12345)    ../tetraspore-feat-nav
feat/api            ATTACHED        agent-feat-api (PID 12346)    ../tetraspore-feat-api
```

### workagent stop
Stop a running agent.

```bash
workagent stop --branch BRANCH

# Example
workagent stop --branch feat/nav
```

## Complete Workflow

```bash
# 1. Prepare workspace and task
workagent prepare --branch feat/button --task "Create reusable Button component with variants"

# 2. Spawn the agent
workagent spawn --branch feat/button

# 3. Optional: Watch the agent work
workagent attach --branch feat/button
# (Press Ctrl+A then D to detach)

# 4. Monitor from orchestrator side
mail inbox --for main
workagent status

# 5. Communicate with agent
mail send --from main --to feat/button --subject "Update" --body "Please add hover states"

# 6. When complete, stop agent
workagent stop --branch feat/button

# 7. Review and integrate
cd ../tetraspore-feat-button
git diff
cat HANDOFF.md
cd ../tetraspore
git merge feat/button

# 8. Clean up
git worktree remove ../tetraspore-feat-button
```

## Screen Session Management

Each agent runs in a named GNU Screen session:
- Session name: `agent-<branch-slug>`
- Logs: `.agent/session.log` in worktree
- Can have multiple agents running in parallel
- Sessions persist even if you disconnect

## Tips

1. **Multiple agents**: Run each in its own screen session
2. **Monitoring**: Use `workagent status` to see all agents
3. **Debugging**: Check `.agent/session.log` for full history
4. **Recovery**: If agent crashes, just `workagent spawn` again

## Benefits

- Actually spawns agent processes in background
- Integrated workflow in one tool
- Clear status reporting at each step
- Proper session management with GNU Screen
- Explicit operations with no hidden magic