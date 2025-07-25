# Tetraspore

A React-based static web application built with modern development practices and AI-assisted multi-agent workflows.

## Prerequisites

- Node.js 18+ and npm
- Git 2.20+ (for worktree support)
- tmux (required for workagent)
- VS Code with Dev Containers extension (recommended)

## Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd tetraspore

# Copy environment template
cp .env.example .env

# Install dependencies
npm install

# Verify setup
npm test -- --run

# Start development server
npm run dev
```

If `.devcontainer/.env` is missing, contact DevOps for Honeycomb telemetry setup.

## Documentation

- [CLAUDE.md](CLAUDE.md) - Development environment and agent orchestration guide
- [MILESTONES.md](MILESTONES.md) - Project roadmap, progress tracking, and known issues
- [docs/](docs/) - Tool guides and workflow documentation
  - `agent-orchestration-guide.md` - Multi-agent workflow patterns
  - `tool-guide-workagent.md` - workagent command reference
  - `tool-guide-mail.md` - mail command reference

## Development Tools

The project includes custom CLI tools for AI agent orchestration:

- **workagent** - Manage AI agent worktrees
- **mail** - Inter-agent communication
- **agent** - Run Claude with telemetry

See tool guides in `docs/` for detailed usage.

## Project Status

See [MILESTONES.md](MILESTONES.md) for current project state, completed features, and known issues.

This project uses git worktrees for parallel development with multiple AI agents. See [CLAUDE.md](CLAUDE.md) for complete setup and workflow instructions.# Test cache hit
