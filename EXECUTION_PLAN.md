# Tetraspore Execution Plan with Model Optimization

## Model Selection Strategy

### Opus 4 Tasks (Deep Intelligence Required)
- Architecture design and planning
- Complex visualizations (Tree of Life, 3D Globe)
- State management and event sourcing
- Integration and merge conflict resolution
- Debugging complex issues

### Sonnet 4 Tasks (Clear Specs, Fast Execution)
- Implementing UI components from specs
- Simple CRUD operations
- Mock data creation
- Test writing
- Documentation updates

## Revised Execution Plan

### Wave 0: Core Infrastructure (**Opus 4** - Architecture Critical)
Single task on main branch - requires deep understanding of event sourcing pattern:
```bash
# I'll do this myself as orchestrator
agent --model opus "Implement core event system and state management per TASK_WAVE0_CORE.md"
```

### Wave 1: Parallel Development (After Core)

#### 1. UI Layout (**Sonnet 4** - Clear Spec)
Simple component work following clear requirements:
```bash
workagent prepare --branch feat/ui-layout --task "@/workspaces/tetraspore/TASK_WAVE1_UI_LAYOUT.md"
workagent spawn --branch feat/ui-layout --model sonnet
```

#### 2. Choice Cards (**Sonnet 4** - Standard Components)
Card components with defined styling:
```bash
workagent prepare --branch feat/choice-cards --task "@/workspaces/tetraspore/TASK_WAVE1_CHOICE_CARDS.md"
workagent spawn --branch feat/choice-cards --model sonnet
```

#### 3. Tree Visualization (**Opus 4** - Complex Visualization)
Requires algorithmic thinking for tree layout:
```bash
workagent prepare --branch feat/tree-viz --task "@/workspaces/tetraspore/TASK_WAVE1_TREE_VIZ.md"
workagent spawn --branch feat/tree-viz --model opus
```

#### 4. LLM Service (**Sonnet 4** - Clear Interface)
Service implementation with defined interface:
```bash
workagent prepare --branch feat/llm-service --task "@/workspaces/tetraspore/TASK_WAVE1_LLM_SERVICE.md"
workagent spawn --branch feat/llm-service --model sonnet
```

## Merge Strategy

### Phase 1: Core (Day 1 Morning)
1. Complete Wave 0 on main
2. Test event system works
3. Commit and push

### Phase 2: Parallel Sprint (Day 1 Afternoon)
1. Spawn all Wave 1 agents simultaneously
2. Monitor via `workagent status` and `mail inbox`
3. Answer clarification questions quickly

### Phase 3: Integration (Day 1 Evening)
1. **Simple merges first** (Sonnet agents likely finish faster):
   - feat/ui-layout → main
   - feat/choice-cards → main
   - feat/llm-service → main

2. **Complex merge** (Opus agent):
   - feat/tree-viz → main

3. **Integration testing**:
   ```bash
   agent --model opus "Test all components work together, fix integration issues"
   ```

## Wave 2 Planning (If Time Permits)

### Game Loop (**Opus 4** - Core Logic)
Complex state transitions and event flow:
```bash
workagent prepare --branch feat/game-loop --task "Implement turn processing and event generation"
workagent spawn --branch feat/game-loop --model opus
```

### Region Map Basic (**Sonnet 4** - Simple 2D)
Basic 2D map following UI patterns:
```bash
workagent prepare --branch feat/region-map-2d --task "Create 2D region map placeholder"
workagent spawn --branch feat/region-map-2d --model sonnet
```

## Communication Protocol

### For Sonnet Agents
Include in task descriptions:
- "Follow the existing patterns in the codebase"
- "If architecture questions arise, use mail to contact orchestrator"
- "Focus on implementation, not redesign"

### Architecture Questions
Sonnet agents should mail orchestrator for:
- Missing type definitions
- Unclear interfaces
- Integration questions
- Performance concerns

## Expected Timeline

With model optimization:
- Wave 0: 1-2 hours (Opus)
- Wave 1: 2-3 hours parallel
  - UI Layout: 1-2 hours (Sonnet - faster)
  - Choice Cards: 1-2 hours (Sonnet - faster)
  - LLM Service: 1-2 hours (Sonnet - faster)
  - Tree Viz: 2-3 hours (Opus - complex)
- Integration: 1 hour (Opus)

Total: ~5 hours vs ~8 hours if all Opus

## Cost Savings
- 3 Sonnet agents instead of Opus: ~66% cost reduction
- No quality loss on well-specified tasks
- Faster iteration cycles

## Risk Mitigation
- Clear task specs prevent Sonnet agents from making architecture decisions
- Mail system for escalation
- Orchestrator reviews all PRs before merge
- Integration agent (Opus) catches any issues