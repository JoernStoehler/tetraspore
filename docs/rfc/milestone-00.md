# RFC: Milestone 0 - Development Infrastructure

## Summary
Milestone 0 establishes the foundational development infrastructure for the Tetraspore project, providing a comprehensive environment for multi-agent AI development with modern web technologies.

## Status
**Completed**: January 22, 2025

## Motivation
Before beginning feature development, we need a solid foundation that supports:
- Consistent development environments across all contributors
- AI agent development with issue-based workflows
- Modern React/TypeScript development with best practices
- Comprehensive testing and quality assurance
- GitHub-based communication and task management

## Detailed Design

### 1. DevContainer Configuration
- **Purpose**: Ensure all developers and AI agents work in identical environments
- **Implementation**:
  - VS Code DevContainer with Node.js environment
  - Pre-configured environment variables system
  - Automatic setup of development tools on container start
  - Support for Honeycomb telemetry and MCP servers

### 2. Core Technology Stack
- **Frontend Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite for fast HMR and optimized builds
- **Styling**: Tailwind CSS with PostCSS
- **State Management**: Zustand (pre-installed for future use)
- **Testing**: Vitest + Playwright + React Testing Library
- **Code Quality**: ESLint with React/TypeScript rules

### 3. AI Agent Development Tools
- **workagent**: Simplified issue-based agent spawner
  - One issue = One branch = One worktree = One agent principle
  - Automatic port allocation for parallel development
  - TUI mode for interactive agent sessions
  - Integrated with GitHub issue workflow
- **gh (GitHub CLI)**: GitHub issue and PR interaction
  - Pre-installed in DevContainer for all agents
  - Enables agents to read issue details and comments
  - Allows agents to comment on issues for questions/updates
  - Supports PR creation with issue references
  - Central communication hub replacing inter-agent mail

### 4. Pre-installed Libraries
Strategic selection of libraries for future features:
- **D3.js**: Data visualization
- **Three.js + React Three Fiber**: 3D graphics
- **Framer Motion**: Animations
- **React Router**: Navigation

### 5. Development Workflow
- **Storybook**: Component-driven development
- **Hot Module Replacement**: Instant feedback during development
- **Absolute imports**: Clean import paths from `src/`
- **Git hooks**: Pre-commit quality checks

## Implementation Details

### Directory Structure
```
tetraspore/
├── .devcontainer/        # Container configuration
│   └── bin/workagent    # Issue-based agent spawner
├── .github/             # GitHub configuration
│   └── ISSUE_TEMPLATE/  # Task templates
├── .claude/             # Claude commands
│   └── commands/        # /implement-issue, /write-issue
├── docs/                # Documentation
│   ├── rfc/            # Milestone RFCs
│   ├── style-guide-*.md # Writing guidelines
│   └── templates/      # Document templates
├── src/                # Application source
│   ├── components/     # React components
│   └── App.tsx         # Main app
├── tests/              # E2E tests
└── package.json        # Dependencies
```

### Port Allocation
Each agent workspace gets unique ports:
- Dev server: 3000 + (n*3)
- Preview: 3001 + (n*3)
- Debug: 3002 + (n*3)

### Environment Variables
- `.env`: Default configuration (git-ignored, copied from main branch)
- `.env.local`: Worktree-specific overrides (git-ignored, generated for each worktree)
- Container environment: API keys and telemetry (read on container restart)

## Rationale and Alternatives

### Why This Stack?
1. **Vite over Create React App**: Faster builds, better HMR, modern defaults
2. **Tailwind over styled-components**: Utility-first, smaller bundles, better performance
3. **Vitest over Jest**: Native Vite integration, faster test runs
4. **Zustand over Redux**: Simpler API, less boilerplate, TypeScript-first

### Why Issue-Based Agent Workflow?
1. **Clear Task Definition**: Each issue defines exactly what needs to be built
2. **GitHub Integration**: Leverages existing GitHub workflow and tools
3. **Isolation**: Each agent has its own workspace, preventing conflicts
4. **Transparency**: All communication visible in issue comments
5. **Human Oversight**: Easy to monitor progress and intervene when needed

## Success Metrics
- ✅ DevContainer starts successfully
- ✅ All development tools functional
- ✅ Build completes without errors
- ✅ Multi-agent workflows tested and documented
- ✅ Clear documentation for all tools
- ✅ GitHub CLI (gh) installed and configured
- ✅ Agents can interact with GitHub issues/PRs

## Unresolved Questions
None - Milestone 0 is complete

## Security Considerations
- API keys stored in container environment, not in code
- Git-ignored files for sensitive configuration
- Telemetry opt-in with clear documentation

## Future Work
This infrastructure supports future milestones:
- Component library development
- Complex state management
- Real-time collaboration features
- Advanced visualizations
- Production deployment