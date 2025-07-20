# Agent Orchestration Guide

This guide explains how to use multiple AI agents for parallel development, with an orchestrator agent delegating tasks to specialized worker agents.

## System Architecture

```
Human (Jörn)
    ↓
Orchestrator Agent (main branch)
    ↓
Worker Agents (feature branches in tmux sessions)
- feat/ui
- feat/api  
- feat/data
```

The orchestrator breaks down complex projects into parallel tasks, delegates to worker agents, and coordinates their integration - all without filling its context with implementation details.

## Core Concepts

### The 1:1:1 Relationship
Each workagent has a **strict 1:1:1 relationship**:
- **1 Workagent** ↔ **1 Git Branch** ↔ **1 Git Worktree**

This means:
- Every workagent operates in its own isolated git worktree
- The workagent's lifecycle is tied to the branch/worktree
- Once a worktree is removed, that agent is gone forever
- No agent reuse across different branches

### Workagent Lifecycle
```
Start → Work → Stop → Continue → Work → Stop → ... → Finish → Worktree Removed
        ↑________________↑________________↑
        
        Append-only context persists across stop/continue cycles
```

Key points:
- Each workagent has an **append-only context window** that persists across stop/continue
- The PID changes after stop/continue, but it's conceptually the same agent
- Context accumulates - the agent remembers all previous conversations
- Resources (like ports) are allocated per active worktree

### Workagent Limitations
- **Cannot cd into another worktree** - they're confined to their own worktree
- Can access/modify files in other worktrees via relative or absolute paths if needed
- Ports and resources are allocated per active worktree via `.env.local`
- This isolation prevents accidental cross-contamination

## Model Selection Strategy

Choose models based on task complexity and budget:

### Opus 4 ($$$, Slow, Deep Intelligence)
Use for:
- Architecture design and system planning
- Complex algorithm development
- Research and technology evaluation
- Critical integration work
- Debugging complex issues
- Tasks requiring creativity or novel solutions

### Sonnet 4 ($, Fast, Effective)
Use for:
- Implementing from clear specifications
- Writing tests for existing code
- Simple CRUD operations
- UI components from mockups
- Documentation and comments
- Refactoring with clear goals
- Routine maintenance tasks

**Cost Reality**: Opus 4 is ~3x more expensive than Sonnet 4. Reserve it for tasks where intelligence truly matters.

## Before Spawning Any Agent

### Orchestrator Checklist
1. **Check branch name availability**:
   ```bash
   git branch -a | grep YOUR_PATTERN
   # If exists, use versioned name: feat/X-v2 or feat/X-2025-01-20
   ```

2. **Create AGENT_BRANCH_TASK.md from template**:
   ```bash
   cp docs/templates/AGENT_BRANCH_TASK_TEMPLATE.md ../tetraspore-BRANCH/AGENT_BRANCH_TASK.md
   # Fill in ALL sections, especially Communication Requirements
   ```

3. **Verify task file includes**:
   - [ ] Clear specifications and success criteria
   - [ ] Mail communication requirements (start/blocked/complete)
   - [ ] HANDOFF.md creation requirement
   - [ ] Expected files to create/modify
   - [ ] Testing instructions

4. **Use explicit spawn message**:
   ```bash
   workagent run --branch BRANCH --model MODEL --message "Read AGENT_BRANCH_TASK.md which contains your specifications and communication requirements. Start by sending mail to main confirming you've begun."
   ```

## Orchestrator Workflow

### 1. Analyze & Plan
Break down the feature into parallel tasks based on natural boundaries (UI/API/Data/Tests).

### 2. Delegate with Clarity
```bash
# Complex UI needs deep intelligence
workagent prepare --branch feat/login-ui
Write('../tetraspore-feat-login-ui/AGENT_BRANCH_TASK.md', '
Create login form component with validation
- Email and password fields
- Client-side validation
- Error handling
')
workagent run --branch feat/login-ui --model opus --message "Read AGENT_BRANCH_TASK.md and implement"

# API follows clear patterns
workagent prepare --branch feat/login-api
Write('../tetraspore-feat-login-api/AGENT_BRANCH_TASK.md', '
Create /auth/login endpoint with JWT
- POST endpoint
- Validate credentials
- Return JWT token
')
workagent run --branch feat/login-api --model sonnet --message "Read AGENT_BRANCH_TASK.md and implement"
```

### 3. Monitor & Coordinate
```bash
# Check status
workagent status
mail inbox --for main | tail

# Request updates
mail send --to feat/login-ui --subject "Status check" \
  --body "How's the login form coming along?"

# Share information between agents
mail send --to feat/login-ui --subject "API ready" \
  --body "Login endpoint ready at POST /auth/login"
```

### 4. Integrate
```bash
# After agents complete
git checkout -b integration/login
git merge feat/login-ui
git merge feat/login-api
npm test
```

## Worker Agent Essentials

Workers should:
1. **Check assignment**: `mail inbox --for BRANCH` and `cat AGENT_BRANCH_TASK.md`
2. **Stay focused**: Work only on assigned task, don't redesign the system
3. **Communicate progress**: Send updates, flag blockers, ask questions
4. **Document handoffs**: Create HANDOFF.md with API contracts and examples

## Common Patterns

### Fork-Join (Parallel Work)
```bash
# Start parallel work
workagent prepare --branch feat/header
workagent run --branch feat/header --model sonnet --message "Build header component"

workagent prepare --branch feat/sidebar
workagent run --branch feat/sidebar --model opus --message "Build complex sidebar with state"

# Later: integrate all branches
git merge feat/header feat/sidebar
```

### Pipeline (Sequential Phases)
```bash
# Phase 1: Research (needs opus)
workagent prepare --branch research/auth
workagent run --branch research/auth --model opus --message "Research auth strategies"

# Phase 2: Implementation (can use sonnet)
workagent prepare --branch feat/auth --from research/auth
workagent run --branch feat/auth --model sonnet --message "Implement auth per RESEARCH.md"
```

### Review (Fresh Perspective)
```bash
# Original implementation
workagent prepare --branch feat/complex-ui
workagent spawn --branch feat/complex-ui --model opus

# Independent review agent (branches from feat, not main)
workagent prepare --branch review/complex-ui --from feat/complex-ui
workagent spawn --branch review/complex-ui --model opus --message "Review the implementation"
```

Benefits of review pattern:
- Clean context without original agent's assumptions
- Fresh perspective catches issues
- No contamination from intermediate mistakes

## Quick Command Reference

### Essential Commands
```bash
# Start agent
workagent prepare --branch BRANCH [--from SOURCE]
workagent run --branch BRANCH --model MODEL --message "TASK"

# Monitor
workagent status                      # All agents
mail inbox --for main | tail         # Recent messages
workagent attach --branch BRANCH      # Watch live

# Communicate
mail send --to BRANCH --subject "SUBJECT" --body "MESSAGE"

# Stop/Continue
workagent stop --branch BRANCH
workagent run --branch BRANCH --continue --message "Continue work"
```

### Integration Checklist
- [ ] All agents report completion via mail
- [ ] Each branch has HANDOFF.md if needed
- [ ] Tests pass on each branch
- [ ] No anticipated merge conflicts

## Common Orchestrator Mistakes

### 1. Branch Name Reuse
**Mistake**: Using an existing branch name without checking
```bash
# WRONG: Just picking a name
workagent prepare --branch feat/tree-viz

# RIGHT: Check first
git branch -a | grep tree
# If feat/tree-viz exists, use feat/tree-viz-v2
```
**Impact**: Violates 1:1:1 principle, causes context contamination

### 2. Forgetting Communication Requirements
**Mistake**: Spawn message only mentions what to build
```bash
# WRONG: No communication instructions
workagent run --branch feat/api --message "Implement the API endpoints"

# RIGHT: Explicit communication
workagent run --branch feat/api --message "Read AGENT_BRANCH_TASK.md which contains specifications and communication requirements"
```
**Impact**: Agents complete work but never inform orchestrator

### 3. Passive Waiting
**Mistake**: Setting up monitoring loops without checking deliverables
```bash
# WRONG: Just waiting for mail that may never come
while true; do
  mail inbox --for main | tail
  sleep 600
done

# RIGHT: Check specific deliverables
while true; do
  # Check if agent stopped
  if workagent status | grep "feat/api.*STOPPED"; then
    # Check deliverables
    ls ../tetraspore-feat-api/HANDOFF.md || echo "WARNING: No HANDOFF.md"
    git -C ../tetraspore-feat-api status --porcelain | wc -l
  fi
  sleep 600
done
```

### 4. Incomplete Task Files
**Mistake**: Creating minimal AGENT_BRANCH_TASK.md
**Right**: Use the template and fill ALL sections, especially:
- Communication requirements
- Success criteria  
- Expected deliverables

## Key Success Factors

1. **Clear boundaries**: Each agent must know exactly what to build
2. **Right-sized tasks**: Not too big (overwhelming), not too small (overhead)
3. **Explicit interfaces**: Document how components connect
4. **Proactive communication**: Updates, blockers, questions
5. **Trust the process**: Let agents work independently within their scope

The orchestrator's job is coordination, not implementation. Stay high-level, delegate effectively, and trust your worker agents to deliver.