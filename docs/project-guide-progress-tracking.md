# Project Guide: Progress Tracking

This guide explains how to track project progress and maintain continuity across multiple orchestrators and development sessions.

## Overview

Two key documents track project state:
1. **coordination-log.md** - Tactical history of agent coordination
2. **project-status.md** - Strategic view of current and target state

Together, these prevent context loss and ensure consistent progress toward project goals.

## Coordination Log

### Purpose
- Track which agents were spawned when and why
- Record architectural decisions and their rationale
- Document integration outcomes and lessons learned
- Provide context for future orchestrators

### When to Update
- **Before spawning agents**: Document the plan
- **After integration**: Record outcomes and decisions
- **When making architectural choices**: Explain the reasoning

### Format
```markdown
## YYYY-MM-DD - Feature Name (Orchestrator: Name)

### Agents Spawned
- `feat/branch-name` (model) - Task description
- `feat/other-branch` (model) - Task description

### Work Completed/In Progress
- What was accomplished
- Current status of branches

### Decisions
- Architecture choices made
- Rationale for parallelization strategy
- Model selection reasoning

### Integration
- Merge strategy used
- Conflicts resolved
- Testing outcomes
```

## Project Status Updates

### Project State Section
The project-status.md contains a "Project State" section with two parts:

**Current State**: What's implemented and working
- Infrastructure components (✅ complete, ⏳ in progress)
- Game features status
- Active branches/agents

**Target State**: What we're building toward
- Core functionality goals
- Technical requirements
- Performance targets

### When to Update
- **After feature completion**: Move items from ⏳ to ✅
- **When spawning agents**: List them in "Active Branches/Agents"
- **After integration**: Update current state with new capabilities
- **When requirements change**: Update target state

### Example Update
```markdown
### Current State (2025-07-20)
**Game Features**:
- ✅ Event sourcing system - Basic implementation complete
- ⏳ Tree of Life visualization - IN PROGRESS (feat/tree-viz)
- ⏳ Region Map visualization - NOT STARTED

**Active Branches/Agents**:
- feat/tree-viz (opus) - Implementing D3.js tree visualization
- feat/event-store (sonnet) - Adding localStorage persistence
```

## Benefits

1. **Context Preservation**: New orchestrators understand what's been done
2. **Decision History**: Rationale for choices is preserved
3. **Progress Tracking**: Clear view of what's complete vs remaining
4. **Coordination**: See what agents are currently active
5. **Learning**: Past mistakes and solutions are documented

## Best Practices

1. **Update Immediately**: Don't wait until "later" - you'll forget details
2. **Be Specific**: Include branch names, models used, specific decisions
3. **Explain Why**: Document reasoning, not just actions
4. **Stay Concise**: Bullet points over paragraphs
5. **Include Failures**: Document what didn't work and why

## Quick Checklist

When starting as orchestrator:
- [ ] Read coordination-log.md for recent history
- [ ] Check project-status.md Project State section
- [ ] Note any active branches/agents

Before spawning agents:
- [ ] Update coordination-log.md with plan
- [ ] Add branches to project-status.md active list

After integration:
- [ ] Update coordination-log.md with outcomes
- [ ] Update project-status.md current state
- [ ] Remove completed branches from active list

## Example Workflow

```bash
# 1. Start by understanding current state
cat coordination-log.md | tail -50
cat project-status.md | grep -A 20 "Current State"

# 2. Plan and document
echo "## 2025-07-21 - Event System (Orchestrator: Claude)" >> coordination-log.md
# ... add plan details ...

# 3. Spawn agents
workagent prepare --branch feat/event-store
workagent spawn --branch feat/event-store --model sonnet

# 4. Update project-status.md active branches
# Edit: Add "- feat/event-store (sonnet) - Event persistence"

# 5. After completion, update both documents
# Move feature from ⏳ to ✅, document integration
```

This state management system ensures that the project maintains momentum and clarity even as different orchestrators take over across time.