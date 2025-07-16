#!/bin/bash

# Post-start command runs on every container start
# Only shows warnings/errors to reduce noise

# Check if .env file exists and has API key
if [ ! -f "/workspaces/tetraspore/.devcontainer/.env" ]; then
    echo "⚠ No .env file found - copy .env.example and set HONEYCOMB_API_KEY"
else
    source "/workspaces/tetraspore/.devcontainer/.env"
    if [ -z "$HONEYCOMB_API_KEY" ]; then
        echo "⚠ HONEYCOMB_API_KEY not set in .env file"
    fi
fi

# Quick commands reminder (only if something needs attention)
if [ ! -f "/workspaces/tetraspore/.devcontainer/.env" ] || [ -z "$HONEYCOMB_API_KEY" ]; then
    echo ""
    echo "Commands:"
    echo "  agent  - Claude with telemetry (requires API key)"
    echo "  claude - Claude without telemetry"
fi