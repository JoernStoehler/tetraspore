# Agent Orchestration Guide

This guide explains how to use multiple AI agents for parallel development, with an orchestrator agent delegating tasks to specialized worker agents.

## System Overview

```
Human (you)
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

### 1. Task Parallelization
Instead of one agent doing everything sequentially, multiple agents work on different aspects simultaneously:
- **UI Agent**: React components, styling, user interactions
- **API Agent**: Endpoints, data fetching, error handling
- **Data Agent**: Models, database schema, migrations
- **Test Agent**: Test suites, integration tests

### 2. Context Preservation
The orchestrator stays high-level:
- Plans architecture and task breakdown
- Delegates specific implementation to workers
- Reviews progress via mail
- Coordinates integration
- Never gets bogged down in code details

### 3. Communication Flow
Agents communicate asynchronously via mail:
```bash
# Orchestrator assigns task
mail send --to feat/ui --subject "Task" --body "Build login form with email/password"

# Agent acknowledges
mail send --to main --subject "Starting login form" --body "Working on it"

# Agent completes
mail send --to main --subject "Login form complete" --body "See LoginForm.tsx"
```

## Orchestrator Workflow

### 1. Project Planning
```bash
# Orchestrator analyzes requirements
# Breaks down into parallel tasks
# Creates implementation plan
```

### 2. Task Delegation
```bash
# Prepare UI agent
workagent prepare --branch feat/login-ui \
  --task "Create login form component with validation"
workagent spawn --branch feat/login-ui

# Prepare API agent  
workagent prepare --branch feat/login-api \
  --task "Create /auth/login endpoint with JWT"
workagent spawn --branch feat/login-api

# Monitor progress
workagent status
mail inbox --for main | tail
```

### 3. Coordination
```bash
# Check progress
mail inbox --for main | grep "complete" | tail

# Request updates
mail send --to feat/login-ui --subject "Status check" \
  --body "How's the login form coming along?"

# Coordinate between agents
mail send --to feat/login-ui --subject "API ready" \
  --body "Login endpoint ready at POST /auth/login"
```

### 4. Integration
```bash
# After agents complete their tasks
git checkout -b integration/login
git merge feat/login-ui
git merge feat/login-api

# Test integration
npm test
npm run dev
```

## Worker Agent Workflow

### 1. Task Reception
Agents start by checking their assignment:
```bash
mail inbox --for BRANCH
cat TASK.md
```

### 2. Implementation
- Work on assigned task
- Stay focused on specific scope
- Create clean, tested code

### 3. Communication
```bash
# Send progress updates
mail send --to main --subject "Progress" --body "Login form 70% complete"

# Ask for clarification
mail send --to main --subject "Question" --body "Should forgot password be included?"

# Coordinate with peers
mail send --to feat/login-api --subject "Need API docs" --body "What's the login endpoint format?"
```

### 4. Completion
```bash
# Final update
mail send --to main --subject "Task complete" \
  --body "Login form ready with validation. See src/components/LoginForm.tsx"
```

## Best Practices

### For Orchestrators

1. **Clear Task Definition**
   - Be specific about deliverables
   - Include acceptance criteria
   - Reference designs/specs if available

2. **Avoid Micromanagement**
   - Trust agents to implement details
   - Check progress, not every line of code
   - Focus on integration points

3. **Maintain High-Level Context**
   - Keep architectural vision
   - Track overall progress
   - Plan next phases

### For Worker Agents

1. **Stay Focused**
   - Work only on assigned task
   - Don't redesign the whole system
   - Ask if scope unclear

2. **Communicate Proactively**
   - Send regular updates
   - Flag blockers early
   - Coordinate with dependent agents

3. **Document Handoffs**
   - Create clear HANDOFF.md if needed
   - Document API contracts
   - Include usage examples

## Common Patterns

### Fork-Join Pattern
Split work, then integrate:
```bash
# Fork: Start parallel work
workagent prepare --branch feat/header --task "Build header component"
workagent prepare --branch feat/footer --task "Build footer component"
workagent prepare --branch feat/sidebar --task "Build sidebar component"

# Work happens in parallel...

# Join: Integrate results
git merge feat/header feat/footer feat/sidebar
```

### Pipeline Pattern
Sequential phases with handoffs:
```bash
# Phase 1: Design
workagent prepare --branch design/ui --task "Create component designs"

# Phase 2: Implementation (after design)
workagent prepare --branch feat/ui --task "Implement designs from design/ui"

# Phase 3: Testing (after implementation)
workagent prepare --branch test/ui --task "Write tests for feat/ui components"
```

### Research Pattern
Exploration before implementation:
```bash
# Research agent explores options
workagent prepare --branch research/frameworks \
  --task "Evaluate form validation libraries"

# Implementation uses research results
workagent prepare --branch feat/forms \
  --task "Implement forms using library recommended by research/frameworks"
```

## Quick Reference

### Start Multiple Agents
```bash
# Orchestrator delegates tasks
workagent prepare --branch feat/auth --task "Complete auth system" && \
workagent spawn --branch feat/auth

workagent prepare --branch feat/profile --task "User profile page" && \
workagent spawn --branch feat/profile
```

### Monitor Everything
```bash
# See all agents
workagent status

# Recent updates
mail inbox --for main | tail -20

# Check specific agent
workagent attach --branch feat/auth
```

### Coordinate Work
```bash
# Broadcast to all
for agent in feat/auth feat/profile; do
  mail send --to $agent --subject "Deploy tomorrow" \
    --body "Please wrap up current work"
done
```

## Benefits

1. **Scalability**: Add more agents as needed
2. **Isolation**: No conflicts between parallel work
3. **Focus**: Each agent has clear, bounded scope
4. **Context**: Orchestrator maintains big picture
5. **Speed**: True parallel development

## Summary

This orchestration pattern enables efficient multi-agent development:
- Orchestrator maintains high-level context and coordinates
- Worker agents focus on specific implementation tasks
- Mail system enables asynchronous communication
- Git worktrees provide isolation
- Everyone stays productive without context overload

The key is clear task definition, good communication, and trusting agents to handle their assigned work independently.