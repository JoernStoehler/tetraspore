#!/bin/bash

# Post-create setup script for devcontainer
# This runs once after the container is created

# Add .devcontainer/bin to PATH
echo 'export PATH="/workspaces/tetraspore/.devcontainer/bin:$PATH"' >> "$HOME/.bashrc"

# Add helpful aliases to .bashrc
cat >> "$HOME/.bashrc" << EOF

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