# Tool Guide: agent

The `agent` command is the Claude CLI that provides the AI assistant capabilities. This guide documents important features not fully covered in the help text.

## Overview

The `agent` command runs Claude in different modes:
- **Interactive mode** (default): TUI with full interactivity
- **Print mode** (`--print`): Outputs to stdout and terminates, suitable for scripting

## Key Undocumented Behaviors

### Conversation History Storage

The agent stores conversation history in `~/.claude/projects/`:
- Each project directory gets its own subdirectory (path is slugified)
- History stored as `.jsonl` files with session IDs
- Example: `~/.claude/projects/-workspaces-tetraspore/d648557a-2256-4e14-9046-408603c77861.jsonl`

### Continue Flag Behavior

`agent --continue` or `agent -c`:
- Continues the most recent conversation in the current directory
- Automatically finds the latest `.jsonl` file for the project
- Works across different invocations as long as you're in the same directory
- Does NOT require any local files - history is stored in `~/.claude/`

### Print Mode

`agent --print "message"`:
- Runs without TUI, outputs to stdout
- Terminates after completing the response
- Perfect for scripting and automation
- Can be combined with `--continue`
- Creates proper log files when output is redirected

## Usage Patterns

### Basic Conversation
```bash
# First message
agent --print "Create a hello.py file"

# Continue conversation
agent --print --continue "Now add error handling"
```

### With Model Selection
```bash
# Use specific model
agent --model opus --print "Design the architecture"
agent --model sonnet --print "Implement the design"
```

### Capturing Output
```bash
# Log to file
agent --print "Analyze this code" 2>&1 | tee session.log

# In scripts
output=$(agent --print "What is 2+2?")
```

## Important Paths

- **History**: `~/.claude/projects/[slugified-project-path]/*.jsonl`
- **Settings**: `~/.claude/settings.json`
- **Credentials**: `~/.claude/.credentials.json`
- **Shell snapshots**: `~/.claude/shell-snapshots/`
- **Todos**: `~/.claude/todos/`

## Integration with workagent

The workagent tool leverages these features:
1. Uses `--print` mode for clean termination
2. Uses `--continue` for resuming conversations
3. Relies on agent's built-in history management
4. Each worktree gets its own conversation history

## Common Pitfalls

1. **Directory matters**: The agent associates history with the current working directory
2. **Continue requires history**: Can't use `--continue` if no previous conversation exists
3. **Print mode exits**: Unlike interactive mode, print mode terminates after response
4. **Model persistence**: Model selection doesn't persist across invocations

## Tips

1. **Check history exists**:
   ```bash
   ls ~/.claude/projects/*/
   ```

2. **Clean up old conversations**:
   ```bash
   rm -rf ~/.claude/projects/[project-dir]
   ```

3. **Multiple conversations**: Change directories to maintain separate conversation contexts

4. **Debugging**: Check `~/.claude/` for all stored data and configurations