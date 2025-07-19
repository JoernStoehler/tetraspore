#!/bin/bash
cd "/workspaces/tetraspore-feat-llm-service"
echo "Starting agent for branch: feat/llm-service"
echo "Session: agent-feat-llm-service"
echo "Time: Sat Jul 19 08:34:10 PM UTC 2025"
echo "----------------------------------------"
echo ""

# Set up logging
mkdir -p .agent
# Don't redirect stdout/stderr for TUI mode - it needs terminal access
# exec > >(tee -a .agent/session.log)
# exec 2>&1

# Record session info
echo "agent-feat-llm-service" > .agent/session
echo "ACTIVE" > .agent/status
date -u +"%Y-%m-%dT%H:%M:%SZ" > .agent/started

# Start agent with initial prompt
AGENT_ARGS=""
if [ -n "opus" ]; then
    AGENT_ARGS="--model opus"
fi

agent $AGENT_ARGS "You are agent feat/llm-service working on a specific task. Start by running these commands:
1. mail inbox --for feat/llm-service
2. cat TASK.md

Then begin work on your assigned task. Send progress updates via mail to 'main'."
