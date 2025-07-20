# Tetraspore - Static Web App Development

## Project Overview
Tetraspore is a React-based static web application for [purpose TBD]. Multiple agents work on different git worktrees simultaneously, each requiring isolated development environments.

## Critical Agent Guidelines

### DevContainer Self-Contained Principle
**RULE**: ALL development environment files must be inside `.devcontainer/` directory structure.

**WHY**: Any developer should be able to clone the repo, open in VS Code, and have a working environment without needing files from outside `.devcontainer/`.

**IF YOU FIND**: Environment config files elsewhere (like `.config/`, `.vscode/settings.json`, etc.), move them into `.devcontainer/` and update any references.

### Basic Investigation Commands
**File system exploration**: Use `ls -la` command, NOT the LS tool. The LS tool does not show hidden files (files starting with `.`).

**When investigating missing files**: Always use shell commands like `ls -la`, `find`, or `tree -a` to see ALL files including hidden ones.

### Problem-Solving Approach
**Read requirements carefully**: If a human explains a principle or chooses an approach, follow it completely through to its logical conclusion.

**Don't create workarounds**: If the solution is "move file X to location Y", do exactly that - don't create duplicates or partial solutions.

**Ask before assuming**: If you're uncertain about project conventions, ask directly rather than guessing.

## Learning System

### When A Human Gives You New Project Requirements
1. **Add to Requirements Log below**: Add a new bullet point with date, requirement, and reasoning
2. **Do NOT modify the guideline sections above**: Leave "DevContainer Self-Contained Principle" and other guideline sections unchanged
3. **Commit with message**: "docs: add requirement - [brief description]"

### When You Make A Mistake That Future Agents Should Avoid
1. **Add to Common Mistakes Log below**: Add a new bullet point with date, what went wrong, and how to prevent it
2. **Do NOT modify the guideline sections above**: Leave "Basic Investigation Commands" and other guideline sections unchanged  
3. **Commit with message**: "docs: add common mistake - [brief description]"

### Requirements Log
*(New requirements get added here with date and reasoning)*

- 2025-07-16: DevContainer self-contained principle - all env files in `.devcontainer/` for consistent setup across developers
- 2025-07-20: Testing infrastructure - implemented Option B comprehensive testing with Playwright + MSW + Vitest coverage

### Common Mistakes Log
*(Mistakes and their prevention get added here)*

- 2025-07-16: Using LS tool instead of `ls -la` - LS tool doesn't show hidden files, always use shell commands for file investigation
- 2025-07-16: Creating duplicate files instead of moving - when told to relocate files, move them completely, don't create copies
- 2025-07-16: Hardcoding user paths like `/home/node/` - always use `$HOME` for user directories to work with any username
- 2025-07-19: Agents trying to cd into other directories - agents can only operate smoothly within a single top-level directory (their git worktree). Tools may malfunction if agent tries to cd elsewhere
- 2025-07-19: Claiming to monitor without actually monitoring - when waiting for agents to complete, use a bash loop with sleep, not just claim you're monitoring while sitting in input mode
- 2025-07-19: Trying to have one agent review multiple worktrees - agents are confined to their worktree, spawn separate review agents per branch
- 2025-07-19: Using unknown parameters with tools - always verify command syntax before use (e.g., workagent spawn had no --task parameter)
- 2025-07-20: Reusing existing branch names - violates 1:1:1 principle, always run `git branch -a | grep pattern` before naming branches
- 2025-07-20: Not instructing agents to send mail - agents only do what's explicitly requested, always include communication requirements in AGENT_BRANCH_TASK.md
- 2025-07-20: Passive monitoring without checking deliverables - don't just wait for mail, actively check for HANDOFF.md and git status
- 2025-07-20: Using `while true` loops - infinite loops are an anti-pattern, use bounded `for` loops with exit conditions instead

## DevOps Setup

### Agent Management

Use the `workagent` command to manage AI coding agents:

```bash
# Prepare workspace
workagent prepare --branch feature/new-ui

# Create task file (optional but recommended)
Write('../tetraspore-feature-new-ui/AGENT_BRANCH_TASK.md', 'Build the UI component...')

# Run agent with message
workagent run --branch feature/new-ui --message "Read AGENT_BRANCH_TASK.md and implement"

# Continue conversation after agent stops
workagent run --branch feature/new-ui --continue --message "Add responsive design"

# Monitor agents
workagent status
workagent attach --branch feature/new-ui
```

Key design principles:
- **One branch = One agent = One lifecycle** (no reuse)
- **Explicit --continue** required to resume vs start fresh  
- **Print mode only** - agents terminate naturally
- **Clear ownership** - worktree belongs to one agent forever
- **Fail fast** - errors on unknown parameters

The tool automatically:
- Creates git worktree with branch
- Copies `.env` from main worktree
- Auto-allocates unique ports in `.env.local`
- Runs `npm install`
- Creates `.agent/` metadata directory
- Manages agent lifecycle with tmux sessions

### Manual Environment Setup (if needed)

1. **Copy the main `.env` file** (contains secrets like API keys):
   ```bash
   cp /path/to/main/worktree/.env .env
   ```

2. **Create `.env.local` for port overrides** (only for non-main branches):
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local to set unique ports for this worktree
   ```

### Environment Files Overview
- **`.env.example`** - Template showing required variables (committed)
- **`.env`** - Actual configuration (git-ignored, copy from main)
- **`.env.local`** - Worktree-specific overrides like ports (git-ignored)
- **`.devcontainer/.env`** - Container-specific config: Honeycomb telemetry, API keys (git-ignored)
- **`.logs/`** - Directory for development server logs (git-ignored)

### Port Management
Vite automatically loads environment files. Each worktree uses different ports:
- Main branch: Default ports (3000, 3001, 3002, 8080)
- Other branches: Override in `.env.local`

Example `.env.local` for a feature branch:
```bash
# Override default ports to avoid conflicts
VITE_DEV_PORT=3010
VITE_PREVIEW_PORT=3011
VITE_DEBUG_PORT=3012
```

### Development Commands

#### Starting Development Server
```bash
# Start dev server (non-blocking, logs to file)
npm run dev > .logs/dev.log 2>&1 &

# Check if server started successfully
tail -f .logs/dev.log
```

#### Common Tasks
```bash
# Install dependencies
npm install

# Run tests
npm test                    # Run unit tests in watch mode
npm test -- --run          # Run unit tests once (25 tests)
npm run test:ui            # Open Vitest UI
npm run test:coverage      # Generate coverage report

# E2E testing
npm run test:e2e           # Run Playwright E2E tests (requires dev server)
npm run test:e2e:ui        # Open Playwright UI
npm run test:e2e:headed    # Run tests with browser UI visible
npm run test:e2e:debug     # Debug E2E tests
npm run test:all           # Run all tests (unit + E2E)

# Build for production
npm run build              # TypeScript check + Vite build
npm run preview            # Preview production build

# Linting
npm run lint               # Run ESLint

# Use Claude with telemetry
agent [your-command]
```

#### DevOps Verification Checklist
After setting up a new worktree or major changes:
- [ ] `npm install` - Dependencies installed
- [ ] `npm run dev` - Dev server starts on correct port
- [ ] `npm test -- --run` - All unit tests pass (25 tests)
- [ ] `npm run test:e2e` - E2E tests pass (requires dev server running)
- [ ] `npm run build` - Production build succeeds
- [ ] Check `.env` exists (copy from main worktree)
- [ ] Check `.env.local` for port overrides (if needed)

### Cloudflared Tunneling
Use cloudflared to expose your dev server via `tetraspore.joernstoehler.com`:

```bash
# Tunnel your dev server (replace 3010 with your DEV_PORT)
cloudflared tunnel --url http://localhost:3010
```

### Development Workflow

1. **Setup**: DevOps team configures `.devcontainer/.env`
2. **Port Assignment**: Each worktree gets unique ports via `.ports` file
3. **Start Development**: `npm run dev > .logs/dev.log 2>&1 &`
4. **Tunnel (Optional)**: Use cloudflared to share with others
5. **Use Agent**: Run `agent` command for Claude with telemetry

### Git Worktree Isolation
- Each worktree has its own `.ports` file (git-ignored)
- Logs are stored in `.logs/` directory (git-ignored)
- Development servers run on unique ports to avoid conflicts
- Agents can work simultaneously without interference

### Troubleshooting

#### Port Conflicts
If you get "port already in use" errors:
1. Check `.ports` file for your assigned ports
2. Ensure no other process uses those ports
3. Update `.ports` if needed

#### Missing Environment
If you see telemetry warnings:
1. Check `.devcontainer/.env` exists
2. Verify `HONEYCOMB_API_KEY` is set
3. Contact DevOps team if missing

#### Development Server Issues
```bash
# Check server logs
tail -f .logs/dev.log

# Kill stuck processes
pkill -f "npm run dev"

# Restart server
npm run dev > .logs/dev.log 2>&1 &
```

### File Structure
```
tetraspore/
├── .devcontainer/
│   ├── .env              # Honeycomb config (DevOps managed)
│   ├── .config/          # Environment config files
│   └── ...
├── .ports                # Port assignments (git-ignored)
├── .logs/                # Development logs (git-ignored)
├── src/                  # React source code
├── package.json          # Dependencies and scripts
└── CLAUDE.md            # This file
```

## AI-Specific DevOps

### MCP Servers Configuration
The `.mcp.json` file configures additional capabilities for AI agents:
- **tavily**: Fast web search (requires `TAVILY_API_KEY` in `.devcontainer/.env`)
- **context7**: Library documentation access
- **puppeteer**: Browser automation for testing live website

### Agent Command
The `agent` command is aliased to include telemetry and permissions:
```bash
# Runs claude with Honeycomb telemetry and --dangerously-skip-permissions
agent [your-command]
```

### AI Development Tips
- Use `workagent` to manage isolated agent workspaces
- MCP servers provide enhanced search and documentation access
- The `--dangerously-skip-permissions` flag is set by default for smoother workflows
- Always document decisions in project-status.md Development History

## Notes for Agents
- Always use `agent` command for Claude with telemetry
- Use `workagent` for creating workspaces and spawning agents (installed as command in .devcontainer/bin/)
- Use `mail` for inter-agent communication (installed as command in .devcontainer/bin/)
- Start dev server non-blocking with log redirection
- Use cloudflared for external sharing when needed
- **REMEMBER**: Update this file when you learn new requirements or make mistakes that others should avoid

## Multi-Agent Orchestration

### Overview
Tetraspore uses multiple AI agents working in parallel on different git worktrees. This enables rapid development while avoiding conflicts.

**IMPORTANT**: All agents (orchestrator and workers) should read the [Agent Orchestration Guide](docs/agent-orchestration-guide.md) to understand the workflow and patterns for parallel development.

### Project Tracking Documents
Two key documents track project progress and coordination:
- **[coordination-log.md](coordination-log.md)** - History of who coordinated what work and key decisions
- **[project-status.md](project-status.md)** - Current project state and target features (see "Project State" section)

Orchestrators must update these documents when spawning agents and completing features. See [Project Progress Tracking Guide](docs/project-guide-progress-tracking.md) for details.

### Quick Agent Commands

```bash
# Create and spawn agent for specific component
# Complex visualization needs deep intelligence
workagent prepare --branch feature/tree-ui --task "Implement Tree of Life visualization"
workagent spawn --branch feature/tree-ui --model opus

# Simple data fetching can use sonnet
workagent prepare --branch feature/api-client --task "Implement API client per spec"
workagent spawn --branch feature/api-client --model sonnet

# Monitor agent progress
workagent status
mail inbox

# Research agent (in main branch) - research needs opus
agent --model opus "Research: Find all LLM integration points. Document in HANDOFF.md"

# Integration (after features complete) - complex integration needs opus
agent --model opus "@HANDOFF.md Integrate tree-ui and tree-data branches"
```

#### Model Selection:
- **opus**: Claude Opus 4 - Slower, expensive, deep intelligence for complex tasks
- **sonnet**: Claude Sonnet 4 - Faster, cheaper, effective for routine tasks

### Agent Division Strategy

Divide work along architectural boundaries:

**UI Agent**: React components, visualizations, user interactions
- Tree of Life, Region Map, Choice Cards
- D3.js and Three.js visualizations
- Event handlers and UI state

**Event Agent**: Event sourcing and state management
- Event types and validation
- Event store and persistence  
- State projection from events

**LLM Agent**: AI integration
- LLM service wrapper
- Prompt formatting
- Response parsing
- Mock mode

**3D Agent**: Three.js and spatial calculations
- Globe rendering
- Spherical Voronoi
- Camera controls

### Agent Handoffs

Always create HANDOFF.md when transitioning work:

```markdown
# Feature Name Handoff
## Completed by: [agent-name]
## Date: [date]
## Status: [what's done, what's not]

### What was implemented:
- List completed items
- Key files created/modified

### Integration points:
- How it connects to other systems
- Required interfaces

### Next steps:
- Remaining work
- Known issues

### How to test:
- Commands to run
- Expected behavior
```

### Common Multi-Agent Patterns

**Fork-Join** (parallel then integrate):
```bash
workagent prepare --branch feat/ui --task "Build UI"
workagent spawn --branch feat/ui
workagent prepare --branch feat/backend --task "Build backend"
workagent spawn --branch feat/backend
# Later: integrate both branches
```

**Pipeline** (sequential):
```
design-agent → implement-agent → test-agent
```

**Research-Implementation**:
```
research-agent (read-only) → implementation-agents
```

### Best Practices

1. **Clear Boundaries**: Each agent owns specific files/directories
2. **Explicit Interfaces**: Document contracts between components
3. **Frequent Integration**: Merge related work often
4. **HANDOFF.md**: Required for all transitions
5. **Clean Commits**: One feature per commit
6. **Mail Communication**: Use `mail` for all agent coordination
7. **Model Selection**: Choose models based on task complexity:
   - **Opus 4** for: Architecture design, complex algorithms, research, integration
   - **Sonnet 4** for: Implementation from specs, tests, CRUD, simple UI components
   - Consider cost (~3x difference) and time requirements

### Troubleshooting

**Agent gets stuck**: 
```bash
workagent attach --branch feat/stuck  # Check what's happening
workagent stop --branch feat/stuck    # Stop if needed
```

**Check agent logs**:
```bash
cd ../tetraspore-feat-branch
tail -f .agent/session.log
```

**Integration issues**: Use integration agent to resolve

See `docs/` for detailed guides:
- [Agent Orchestration Guide](docs/agent-orchestration-guide.md) - Multi-agent workflow and patterns
- [WorkAgent Tool Guide](docs/tool-guide-workagent.md) - workagent command reference
- [Mail Tool Guide](docs/tool-guide-mail.md) - mail command reference