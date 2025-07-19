#!/bin/bash
cd "/workspaces/tetraspore-feat-tree-viz"
echo "Starting agent for branch: feat/tree-viz"
echo "Session: agent-feat-tree-viz"
echo "Time: Sat Jul 19 08:34:18 PM UTC 2025"
echo "----------------------------------------"
echo ""

# Set up logging
mkdir -p .agent
# Don't redirect stdout/stderr for TUI mode - it needs terminal access
# exec > >(tee -a .agent/session.log)
# exec 2>&1

# Record session info
echo "agent-feat-tree-viz" > .agent/session
echo "ACTIVE" > .agent/status
date -u +"%Y-%m-%dT%H:%M:%SZ" > .agent/started

# Start agent with initial prompt
AGENT_ARGS=""
if [ -n "opus" ]; then
    AGENT_ARGS="--model opus"
fi

agent $AGENT_ARGS "You are agent feat/tree-viz working on a specific task. Start by running these commands:
1. mail inbox --for feat/tree-viz
2. cat TASK.md

Then begin work on your assigned task. Send progress updates via mail to 'main'."
