# Simple devcontainer for static web app development
# Provides: Node.js 20, basic dev tools, cloudflared, gemini-cli, claude-code

FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Prevent interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# Install Node.js 20 and basic development tools
RUN apt-get update && apt-get install -y \
    # Node.js 20
    ca-certificates \
    gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -y nodejs \
    # Terminal and system tools
    screen \
    tmux \
    htop \
    tree \
    bc \
    ripgrep \
    # Additional useful tools
    curl \
    wget \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install GitHub CLI
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
    && chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
    && echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
    && apt-get update \
    && apt-get install -y gh \
    && rm -rf /var/lib/apt/lists/*

# Install Cloudflared (AMD64 only)
RUN curl -L --connect-timeout 30 --max-time 300 --retry 3 --retry-delay 10 \
    --output cloudflared.deb \
    https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb \
    && dpkg -i cloudflared.deb \
    && rm cloudflared.deb

# Install Starship prompt
RUN curl -sS https://starship.rs/install.sh | sh -s -- --yes

# Verify Node.js installation
RUN node --version && npm --version

# Create system directories
RUN mkdir -p /workspaces \
    && chown -R vscode:vscode /workspaces

USER vscode
WORKDIR /workspaces

# Create user directories for persistent auth
RUN mkdir -p /home/vscode/.claude \
    && mkdir -p /home/vscode/.gemini \
    && mkdir -p /home/vscode/.config/gh \
    && mkdir -p /home/vscode/.bash_history_dir \
    && touch /home/vscode/.bash_history_dir/.bash_history

# Configure npm for user-level global packages and install AI CLIs
RUN npm config set prefix '/home/vscode/.local' \
    && npm install -g @anthropic-ai/claude-code @google/gemini-cli

# Add .local/bin to PATH for npm global packages
ENV PATH="/home/vscode/.local/bin:$PATH"

# Copy starship config
COPY --chown=vscode:vscode .config/starship.toml /home/vscode/.config/starship.toml

# Default command
CMD ["/bin/bash"]