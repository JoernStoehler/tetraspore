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

Choose models based on task complexity:

```bash
# Complex UI needs deep intelligence for design decisions
workagent prepare --branch feat/login-ui
Write('../tetraspore-feat-login-ui/AGENT_BRANCH_TASK.md', '
Create login form component with validation
- Email and password fields
- Client-side validation
- Error handling
')
workagent run --branch feat/login-ui --model opus --message "Read AGENT_BRANCH_TASK.md and implement"

# API implementation follows clear patterns
workagent prepare --branch feat/login-api
Write('../tetraspore-feat-login-api/AGENT_BRANCH_TASK.md', '
Create /auth/login endpoint with JWT
- POST endpoint
- Validate credentials
- Return JWT token
')
workagent run --branch feat/login-api --model sonnet --message "Read AGENT_BRANCH_TASK.md and implement"

# Monitor progress
workagent status
mail inbox --for main | tail
```

**Model Selection Guidelines:**
- **Opus 4** (slower, expensive, deep intelligence):
  - Architecture design and system planning
  - Complex problem decomposition
  - Research and analysis tasks
  - Critical integration work
  - Debugging complex issues
  
- **Sonnet 4** (faster, cheaper, effective):
  - Implementing from clear specifications
  - Routine CRUD operations
  - Simple UI components
  - Test writing
  - Documentation updates

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
cat AGENT_BRANCH_TASK.md
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

### Model Selection Strategy

As an orchestrator, choose models based on task requirements:

**Use Opus 4 for:**
- System architecture and design
- Complex algorithm development
- Multi-step problem decomposition
- Research and technology evaluation
- Integration of multiple components
- Debugging complex issues
- Tasks requiring creativity or novel solutions

**Use Sonnet 4 for:**
- Implementing from clear specifications
- Writing tests for existing code
- Simple CRUD operations
- UI components from mockups
- Documentation and comments
- Refactoring with clear goals
- Routine maintenance tasks

**Cost-Benefit Considerations:**
- Opus 4 is ~3x more expensive than Sonnet 4
- Reserve Opus 4 for tasks where intelligence matters
- Use Sonnet 4 for volume work and clear implementations
- Consider task criticality and budget constraints

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
# Simple components can use sonnet
workagent prepare --branch feat/header
workagent run --branch feat/header --model sonnet --message "Build header component with logo and navigation"

workagent prepare --branch feat/footer
workagent run --branch feat/footer --model sonnet --message "Build footer component with links and copyright"

# Complex interactive sidebar might need opus
workagent prepare --branch feat/sidebar
workagent run --branch feat/sidebar --model opus --message "Build collapsible sidebar with state management and animations"

# Work happens in parallel...

# Join: Integrate results
git merge feat/header feat/footer feat/sidebar
```

### Pipeline Pattern
Sequential phases with handoffs:
```bash
# Phase 1: Design (needs deep thinking)
workagent prepare --branch design/ui
workagent run --branch design/ui --model opus --message "Create component designs and architecture in DESIGN.md"

# Wait for completion...

# Phase 2: Implementation (follows design)
workagent prepare --branch feat/ui --from design/ui
workagent run --branch feat/ui --model sonnet --message "Implement components following DESIGN.md"

# Phase 3: Testing (straightforward)
workagent prepare --branch test/ui --from feat/ui
workagent run --branch test/ui --model sonnet --message "Write comprehensive tests for all components"
```

### Research Pattern
Exploration before implementation:
```bash
# Research needs deep analysis
workagent prepare --branch research/frameworks
workagent run --branch research/frameworks --model opus --message "Evaluate form validation libraries and document findings in RESEARCH.md"

# Wait for research completion...

# Implementation follows research guidance
workagent prepare --branch feat/forms --from research/frameworks
workagent run --branch feat/forms --model sonnet --message "Implement forms using the library recommended in RESEARCH.md"
```

## Quick Reference

### Start Multiple Agents
```bash
# Orchestrator delegates tasks with appropriate models
# Complex auth system design
workagent prepare --branch feat/auth
Write('../tetraspore-feat-auth/AGENT_BRANCH_TASK.md', 'Design and implement complete auth system...')
workagent run --branch feat/auth --model opus --message "Read AGENT_BRANCH_TASK.md and implement"

# Simple profile page
workagent prepare --branch feat/profile
workagent run --branch feat/profile --model sonnet --message "Create user profile page following the mockup in docs/profile.png"
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