#!/bin/bash

# Gemini configuration setup script
# This ensures Gemini uses our settings and environment

# Set Gemini home directory for settings
export GEMINI_HOME="${GEMINI_HOME:-$HOME/.gemini}"

# Create directory if it doesn't exist
mkdir -p "$GEMINI_HOME"

# Link our settings if not already linked
if [ ! -e "$GEMINI_HOME/settings.json" ]; then
    ln -s "/workspaces/tetraspore/.devcontainer/.config/gemini/settings.json" "$GEMINI_HOME/settings.json"
fi

# Export telemetry environment variables for Gemini
export OTLP_GOOGLE_CLOUD_PROJECT="${OTLP_GOOGLE_CLOUD_PROJECT:-tetraspore}"

# Ensure MCP server configuration
export TAVILY_API_KEY="${TAVILY_API_KEY}"

echo "✓ Gemini configuration initialized"