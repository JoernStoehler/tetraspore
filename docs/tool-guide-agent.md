# Tool Guide: agent

The `agent` command is an intelligent wrapper that routes to either Claude CLI or Gemini CLI based on model selection. This guide documents all features, model options, and usage patterns.

## Overview

The `agent` command provides a unified interface for AI assistants:
- **Claude models** (default): opus, sonnet
- **Gemini models**: gemini-2.5-pro, gemini-2.5-flash

The wrapper automatically:
- Detects which backend to use based on `--model` selection
- Configures telemetry for both backends
- Translates command-line arguments appropriately
- Sets up MCP servers (Tavily, Context7, Playwright)

## Model Selection

### Claude Models
```bash
agent --model opus      # Claude Opus 4 - Deep intelligence, complex tasks
agent --model sonnet    # Claude Sonnet 4 - Fast, efficient, routine tasks
```

### Gemini Models
```bash
agent --model gemini-2.5-pro    # Gemini 2.5 Pro - Advanced reasoning
agent --model gemini-2.5-flash  # Gemini 2.5 Flash - Fast responses

# Shortcuts
agent --model gemini      # Alias for gemini-2.5-pro
agent --model flash       # Alias for gemini-2.5-flash
agent --model gemini-pro  # Alias for gemini-2.5-pro
agent --model gemini-flash # Alias for gemini-2.5-flash
```

## Command-Line Options

### Common Options (Both Backends)
```bash
agent --model MODEL         # Select AI model (REQUIRED)
agent --verbose            # Enable verbose/debug output
agent --print "MESSAGE"    # Non-interactive mode (Claude)
agent -p "MESSAGE"         # Non-interactive mode (Gemini - translated)
```

### Claude-Specific Options
```bash
agent --continue           # Continue previous conversation
agent --output-format stream-json  # JSON output format
agent --dangerously-skip-permissions  # Skip permission prompts (default)
```

### Gemini-Specific Options
When using Gemini models, the wrapper translates options:
- `--print` → `-p` (non-interactive prompt)
- `--verbose` → `--debug`
- `--dangerously-skip-permissions` → `--yolo`

## Usage Patterns

### Basic Conversation
```bash
# Claude
agent --model sonnet --print "Create a hello.py file"
agent --model sonnet --print --continue "Now add error handling"

# Gemini
agent --model gemini --print "Create a hello.py file"
# Note: --continue not supported in Gemini non-interactive mode
```

### With Model Selection
```bash
# Complex architecture design (use Opus)
agent --model opus --print "Design the authentication system architecture"

# Implementation from specs (use Sonnet)
agent --model sonnet --print "Implement the login endpoint per the design"

# Using Gemini for variety
agent --model gemini-2.5-pro --print "Review this code for security issues"
agent --model flash --print "Generate unit tests for auth.service.ts"
```

### Interactive Mode
```bash
# Claude interactive
agent --model opus

# Gemini interactive  
agent --model gemini
# In Gemini, use /chat save <tag> and /chat resume <tag> for sessions
```

## Session Management

### Claude Session Management
- Automatic history in `~/.claude/projects/[slugified-path]/*.jsonl`
- Use `--continue` to resume the last conversation
- History persists across invocations in the same directory

### Gemini Session Management
- Manual save/resume in interactive mode:
  ```
  /chat save mytag     # Save current conversation
  /chat resume mytag   # Resume saved conversation
  /chat list          # List saved conversations
  ```
- **Limitation**: No `--continue` support in non-interactive mode
- For automation requiring continuity, use Claude models

## Telemetry Configuration

Both backends support telemetry via Honeycomb:

### Environment Variables (Loaded from `.devcontainer/.env`)
```bash
HONEYCOMB_API_KEY=your_key_here
OTEL_EXPORTER_OTLP_ENDPOINT=https://api.eu1.honeycomb.io
OTEL_SERVICE_NAME=tetraspore-claude  # or tetraspore-gemini
```

### Claude Telemetry
- Automatically configured via environment variables
- Service name: `tetraspore-claude`

### Gemini Telemetry  
- Configured via command-line flags and settings file
- Service name: `tetraspore-gemini`
- Settings file: `.devcontainer/.config/gemini/settings.json`

## MCP Server Configuration

Both backends have access to:
- **Tavily**: Web search (requires `TAVILY_API_KEY`)
- **Context7**: Library documentation
- **Playwright**: Browser automation

The agent wrapper validates API keys on startup and warns if not configured.

## Integration with workagent

The workagent tool uses the agent command internally:
```bash
# workagent automatically uses agent command
workagent run --branch feat/auth --model opus --message "Design auth"
workagent run --branch feat/auth --model gemini --message "Review code"
```

## Choosing the Right Model

### Use Claude Opus (`--model opus`) for:
- Architecture design and system planning
- Complex algorithm development  
- Research and technology evaluation
- Critical integration work
- Debugging complex issues
- Tasks requiring creativity or novel solutions

### Use Claude Sonnet (`--model sonnet`) for:
- Implementing from clear specifications
- Writing tests for existing code
- Simple CRUD operations
- UI components from mockups
- Documentation and comments
- Refactoring with clear goals
- Routine maintenance tasks

### Use Gemini 2.5 Pro (`--model gemini-2.5-pro`) for:
- Code reviews and security analysis
- Alternative perspective on complex problems
- Multi-modal tasks (if you have images/PDFs)
- When you want a different approach than Claude

### Use Gemini 2.5 Flash (`--model flash`) for:
- Quick code generation
- Simple refactoring tasks
- Fast documentation updates
- When speed is more important than depth

## Cost Considerations
- **Claude Opus**: ~3x more expensive than Sonnet
- **Claude Sonnet**: Baseline cost-effective model
- **Gemini 2.5 Pro**: Similar cost to Claude Sonnet
- **Gemini 2.5 Flash**: Most cost-effective option

## Important Paths

### Claude
- **History**: `~/.claude/projects/[slugified-project-path]/*.jsonl`
- **Settings**: `~/.claude/settings.json`
- **Credentials**: `~/.claude/.credentials.json`

### Gemini
- **Settings**: `.devcontainer/.config/gemini/settings.json`
- **Session tags**: Stored internally by Gemini
- **Credentials**: Uses Google Cloud auth

## Common Pitfalls

1. **Directory matters**: Both Claude and Gemini associate history with current directory
2. **Continue limitations**: Gemini doesn't support `--continue` in non-interactive mode
3. **Model persistence**: Model selection doesn't persist across invocations
4. **API key validation**: Both backends need valid API keys for MCP servers

## Troubleshooting

### Check which backend is being used
```bash
# Dry run to see routing
agent --model gemini --print "test" --dry-run  # Would show gemini
agent --model opus --print "test" --dry-run    # Would show claude
```

### Telemetry not working
1. Check `HONEYCOMB_API_KEY` in `.devcontainer/.env`
2. Verify endpoint URL matches your Honeycomb region
3. Look for validation warnings on startup

### MCP servers not available
1. Check `TAVILY_API_KEY` in `.devcontainer/.env`
2. Ensure other MCP servers are properly configured
3. Look for warning messages on startup

## Examples

### Multi-Model Workflow
```bash
# 1. Research with Opus
agent --model opus --print "Research best practices for JWT authentication"

# 2. Get alternative perspective with Gemini
agent --model gemini-2.5-pro --print "What are the security considerations for JWT?"

# 3. Implement with Sonnet
agent --model sonnet --print "Implement JWT auth based on the research"

# 4. Quick tests with Flash
agent --model flash --print "Write unit tests for the JWT implementation"
```

### Automation Pattern
```bash
# For automation requiring session continuity, use Claude
for task in "design" "implement" "test"; do
    agent --model sonnet --print --continue "Next, $task the feature"
done

# For one-off tasks, any model works
agent --model gemini --print "Generate API documentation"
```

## Future Enhancements

Potential improvements being considered:
- Session management wrapper for Gemini
- Unified conversation history format
- Model-specific prompt optimization
- Cost tracking and reporting
- Automatic model selection based on task type