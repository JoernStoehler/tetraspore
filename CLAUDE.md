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

### Common Mistakes Log
*(Mistakes and their prevention get added here)*

- 2025-07-16: Using LS tool instead of `ls -la` - LS tool doesn't show hidden files, always use shell commands for file investigation
- 2025-07-16: Creating duplicate files instead of moving - when told to relocate files, move them completely, don't create copies
- 2025-07-16: Hardcoding user paths like `/home/node/` - always use `$HOME` for user directories to work with any username

## DevOps Setup

### Environment Files
- **`.devcontainer/.env`** - Contains Honeycomb API key and telemetry config
- **`.ports`** - Git-ignored file containing port assignments for this worktree
- **`.logs/`** - Directory for development server logs (git-ignored)

### Required Environment Variables
```bash
# .devcontainer/.env
HONEYCOMB_API_KEY=your_actual_api_key_here
OTEL_SERVICE_NAME=tetraspore-claude
```

### Port Management
Each git worktree gets unique ports to avoid conflicts:
- Main branch: Default ports (3000, 3001, 3002, 8080)
- Other branches: Custom ports defined in `.ports` file

#### Port Configuration
Create `.ports` file in your worktree root:
```bash
# .ports
DEV_PORT=3010
PREVIEW_PORT=3011
DEBUG_PORT=3012
```

@.ports

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
npm test

# Build for production
npm run build

# Use Claude with telemetry
agent [your-command]
```

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

## Notes for Agents
- Always use `agent` command for Claude with telemetry
- Check `.ports` file for your assigned ports
- Start dev server non-blocking with log redirection
- Use cloudflared for external sharing when needed
- **REMEMBER**: Update this file when you learn new requirements or make mistakes that others should avoid