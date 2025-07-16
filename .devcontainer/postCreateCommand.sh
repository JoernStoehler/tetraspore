#!/bin/bash

# Post-create setup script for devcontainer
# This runs once after the container is created

# Make agent script executable
mkdir -p "$HOME/.local/bin"
chmod +x "$HOME/.local/bin/agent" 2>/dev/null || true

# Add helpful aliases to .bashrc
cat >> "$HOME/.bashrc" << EOF

# Tetraspore aliases
alias agent='$HOME/.local/bin/agent'

# Node.js development aliases
alias dev='npm run dev'
alias build='npm run build'
alias test='npm test'

EOF

# Set up bash history
mkdir -p "$HOME/.bash_history_dir"
export HISTFILE="$HOME/.bash_history_dir/.bash_history"
echo "export HISTFILE=\"$HOME/.bash_history_dir/.bash_history\"" >> "$HOME/.bashrc"

# Set up Starship prompt
echo 'eval "$(starship init bash)"' >> "$HOME/.bashrc"

echo "✓ Environment setup complete"