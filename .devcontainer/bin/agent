#!/bin/bash

# Agent wrapper for claude command with Honeycomb telemetry support
# This script sets up the environment variables needed for telemetry
# and then executes the claude command with all passed arguments

# Load environment variables from .devcontainer/.env if it exists
if [ -f "/workspaces/tetraspore/.devcontainer/.env" ]; then
    source "/workspaces/tetraspore/.devcontainer/.env"
fi

# Set up Honeycomb telemetry environment variables
# These can be overridden by the env file above
export OTEL_EXPORTER_OTLP_ENDPOINT="${OTEL_EXPORTER_OTLP_ENDPOINT:-https://api.honeycomb.io}"
export OTEL_EXPORTER_OTLP_HEADERS="${OTEL_EXPORTER_OTLP_HEADERS:-x-honeycomb-team=${HONEYCOMB_API_KEY}}"
export OTEL_SERVICE_NAME="${OTEL_SERVICE_NAME:-tetraspore-claude}"
export OTEL_RESOURCE_ATTRIBUTES="${OTEL_RESOURCE_ATTRIBUTES:-service.name=${OTEL_SERVICE_NAME},service.version=1.0.0}"

# Enable OpenTelemetry for claude-code
export OTEL_TRACES_EXPORTER="${OTEL_TRACES_EXPORTER:-otlp}"
export OTEL_METRICS_EXPORTER="${OTEL_METRICS_EXPORTER:-otlp}"
export OTEL_LOGS_EXPORTER="${OTEL_LOGS_EXPORTER:-otlp}"

# Set log level for debugging if needed
# export OTEL_LOG_LEVEL=debug

# Execute claude command with all arguments
# Include --dangerously-skip-permissions by default for smoother AI workflows
exec claude --dangerously-skip-permissions "$@"