# Tool Guide: issue-monitor

## Overview

`issue-monitor` is a command-line tool that provides a real-time dashboard of GitHub issues, worktrees, AI agents, and suggested actions. It helps developers and AI agents track the state of all issues and their associated development environments at a glance.

## Installation

The tool is pre-installed in the devcontainer at `.devcontainer/bin/issue-monitor`.

## Usage

### Basic Usage (One-time snapshot)
```bash
issue-monitor
```

### Watch Mode (Continuous monitoring)
```bash
issue-monitor --watch
# or
issue-monitor -w
```

### Help
```bash
issue-monitor --help
```

## Output Format

The tool displays a table with the following columns:

| Column | Description |
|--------|-------------|
| **Issue#** | GitHub issue number |
| **Status** | `OPEN` = open issue<br>`OPEN*` = updated within 5 minutes<br>`CLOSED` = closed issue |
| **"Title"** | Issue title (truncated to fit, with quotes) |
| **Worktree** | `YES` = worktree exists at `../tetraspore-issue-NUMBER`<br>`NO` = no worktree |
| **Agent** | Shows AI agent process if detected:<br>`claude(PID)` = Claude agent running<br>`gemini(PID)` = Gemini agent running<br>`none` = no AI agent |
| **Action Needed** | Suggested next action (see below) |
| **Comments** | Number of comments on the issue |

## Action Needed Column

The tool analyzes the current state and suggests the most relevant action:

- **`agent active`** - An AI agent is currently working (no action needed)
- **`cleanup worktree`** - Issue is closed but worktree still exists
- **`setup worktree`** - Issue is open but no worktree exists
- **`commit changes`** - Uncommitted changes in the worktree
- **`push branch`** - Branch has commits that need pushing
- **`push to remote`** - Branch exists but has no remote tracking
- **`pull changes`** - Remote has changes that need pulling
- **`resolve diverge`** - Branch has diverged from remote
- **`-`** - No action needed

## Examples

### Example 1: Clean State
```
Issue#   Status   "Title"                                          Worktree  Agent        Action Needed    Comments
─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
#123     OPEN     "Add user authentication feature"                YES       none         -                5       
#124     OPEN     "Fix navigation bug"                             NO        none         setup worktree   2       
```

### Example 2: Active Development
```
Issue#   Status   "Title"                                          Worktree  Agent        Action Needed    Comments
─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
#125     OPEN     "Implement search functionality"                 YES       claude(1234) agent active     8       
#126     OPEN     "Update documentation"                           YES       none         commit changes   0       
```

### Example 3: Cleanup Needed
```
Issue#   Status   "Title"                                          Worktree  Agent        Action Needed    Comments
─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
#122     CLOSED   "Refactor database layer"                        YES       none         cleanup worktree 15      
```

## Technical Details

### Process Detection
The tool uses `/proc/PID/cwd` to detect processes running in worktrees. This is the most reliable method on Linux as it directly reads the process's current working directory.

### Performance
- GitHub API calls are cached for 60 seconds to avoid rate limits
- Process detection scans `/proc` filesystem efficiently
- Default mode runs once and exits (no continuous monitoring overhead)

### Design Decisions
1. **No colors by default** - Clean output for scripting and logging
2. **Shows closed issues** - Enables detection of worktrees that need cleanup
3. **Only detects AI agents** - Ignores shell/sleep/etc. processes to reduce noise
4. **Action-oriented** - Focuses on what needs to be done rather than just state
5. **Fixed-width columns** - Ensures consistent alignment using calculated widths

## Integration with Workflow

The tool is designed to work with the Tetraspore development workflow:

1. **Before starting work**: Run `issue-monitor` to see available issues
2. **During development**: Use `issue-monitor --watch` to monitor agent activity
3. **After completion**: Check for cleanup actions needed


## Common Use Cases

### Finding Issues to Work On
```bash
issue-monitor | grep "setup worktree"
```

### Checking for Uncommitted Work
```bash
issue-monitor | grep "commit changes"
```

### Monitoring Active Agents
```bash
issue-monitor --watch | grep -E "(claude|gemini)"
```

### Cleanup After Development
```bash
issue-monitor | grep "cleanup worktree"
```

## Troubleshooting

### No Issues Displayed
- Check GitHub authentication: `gh auth status`
- Verify repository: Must be run from within the repository

### Agent Not Detected
- Agents are only detected when running in a worktree directory
- Only `claude` and `gemini` processes are recognized
- Other processes (bash, python, etc.) are intentionally ignored

### Incorrect Action Suggestions
- Run `git fetch` to update remote tracking information
- Check that worktrees follow naming convention: `tetraspore-issue-NUMBER`

## See Also
- [workagent](tool-guide-workagent.md) - Create worktrees and spawn agents
- [GitHub CLI](https://cli.github.com/) - For manual issue management