#!/bin/bash

# Post-create setup script for devcontainer
# This runs once after the container is created

# Add .devcontainer/bin to PATH
echo 'export PATH="/workspaces/tetraspore/.devcontainer/bin:$PATH"' >> "$HOME/.bashrc"

# Set up bash history
mkdir -p "$HOME/.bash_history_dir"
export HISTFILE="$HOME/.bash_history_dir/.bash_history"
echo "export HISTFILE=\"$HOME/.bash_history_dir/.bash_history\"" >> "$HOME/.bashrc"

# Set up Starship prompt
echo 'eval "$(starship init bash)"' >> "$HOME/.bashrc"

# Create .bash_aliases file for any custom aliases (currently empty)
touch "$HOME/.bash_aliases"

echo "✓ Environment setup complete"