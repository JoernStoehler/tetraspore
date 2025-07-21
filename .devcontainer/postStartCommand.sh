#!/bin/bash

# Post-start command runs on every container start
# Only shows warnings/errors to reduce noise

# Check if .env file exists and has API key
if [ ! -f "/workspaces/tetraspore/.devcontainer/.env" ]; then
    echo "⚠ No .env file found - copy .env.example and set HONEYCOMB_API_KEY"
else
    # Source the .env file to get the telemetry endpoint
    source "/workspaces/tetraspore/.devcontainer/.env"
    
    if [ -z "$HONEYCOMB_API_KEY" ] || [ "$HONEYCOMB_API_KEY" = "your_actual_api_key_here" ]; then
        echo "⚠ HONEYCOMB_API_KEY not set in .env file"
    fi
fi

# Update telemetry settings with correct endpoint from .env
# Always update to ensure consistency

# Update Claude settings
if [ -f "$HOME/.claude/settings.json" ] && [ -n "$OTEL_EXPORTER_OTLP_ENDPOINT" ]; then
    jq --arg endpoint "$OTEL_EXPORTER_OTLP_ENDPOINT" \
       --arg headers "$OTEL_EXPORTER_OTLP_HEADERS" \
       '.env = (.env // {}) | 
        .env.CLAUDE_CODE_ENABLE_TELEMETRY = "1" |
        .env.OTEL_METRICS_EXPORTER = "otlp" |
        .env.OTEL_LOGS_EXPORTER = "otlp" |
        .env.OTEL_EXPORTER_OTLP_PROTOCOL = ($endpoint | if contains("honeycomb") then "http/protobuf" else "grpc" end) |
        .env.OTEL_EXPORTER_OTLP_ENDPOINT = $endpoint |
        .env.OTEL_EXPORTER_OTLP_HEADERS = $headers |
        .env.OTEL_SERVICE_NAME = "claude-code" |
        .env.OTEL_RESOURCE_ATTRIBUTES = "service.name=claude-code,service.namespace=coding-agent"' \
        "$HOME/.claude/settings.json" > "$HOME/.claude/settings.json.tmp" && \
        mv "$HOME/.claude/settings.json.tmp" "$HOME/.claude/settings.json"
fi

# Update Gemini settings
if [ -f "$HOME/.gemini/settings.json" ] && [ -n "$OTEL_EXPORTER_OTLP_ENDPOINT" ]; then
    jq --arg endpoint "$OTEL_EXPORTER_OTLP_ENDPOINT" \
       '.telemetry = (.telemetry // {}) |
        .telemetry.enabled = true |
        .telemetry.target = "local" |
        .telemetry.otlpEndpoint = $endpoint |
        .telemetry.logPrompts = false |
        .telemetry.serviceName = "gemini-cli" |
        .telemetry.resourceAttributes = {"service.namespace": "coding-agent"}' \
        "$HOME/.gemini/settings.json" > "$HOME/.gemini/settings.json.tmp" && \
        mv "$HOME/.gemini/settings.json.tmp" "$HOME/.gemini/settings.json"
fi

# Quick commands reminder (only if something needs attention)
if [ ! -f "/workspaces/tetraspore/.devcontainer/.env" ] || [ -z "$HONEYCOMB_API_KEY" ]; then
    echo ""
    echo "Commands:"
    echo "  agent --model MODEL  - AI assistant with telemetry (requires API key)"
    echo "  agent --list-models  - Show available AI models"
fi