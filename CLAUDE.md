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

### Environment Setup for New Worktrees

When creating a new git worktree, you need to set up environment files:

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
- **`.env`** - Actual configuration with secrets (git-ignored, copy from main)
- **`.env.local`** - Worktree-specific overrides like ports (git-ignored)
- **`.devcontainer/.env`** - Container-specific Honeycomb config
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
npm test                    # Run tests in watch mode
npm test -- --run          # Run tests once
npm run test:ui            # Open Vitest UI
npm run test:coverage      # Generate coverage report

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
- [ ] `npm test -- --run` - All tests pass
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

## Notes for Agents
- Always use `agent` command for Claude with telemetry
- Check `.ports` file for your assigned ports
- Start dev server non-blocking with log redirection
- Use cloudflared for external sharing when needed
- **REMEMBER**: Update this file when you learn new requirements or make mistakes that others should avoid