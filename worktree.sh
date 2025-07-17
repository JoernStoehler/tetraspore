#!/bin/bash

# Git worktree management script for Tetraspore
# Handles environment setup and port allocation automatically

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
error() {
    echo -e "${RED}Error: $1${NC}" >&2
    exit 1
}

success() {
    echo -e "${GREEN}✓ $1${NC}"
}

info() {
    echo -e "${YELLOW}→ $1${NC}"
}

# Slugify branch name for folder name
slugify() {
    echo "$1" | sed -e 's/[^a-zA-Z0-9._-]/-/g' | sed -e 's/--*/-/g' | sed -e 's/^-//;s/-$//'
}

# Find next available port starting from a base port
find_available_port() {
    local base_port=$1
    local port=$base_port
    
    # Collect all used ports from .env.local files
    local used_ports=$(find .. -name ".env.local" -type f 2>/dev/null | \
        xargs grep -h "VITE_.*_PORT=" 2>/dev/null | \
        sed 's/.*=//' | sort -n | uniq)
    
    # Find next available port
    while echo "$used_ports" | grep -q "^$port$"; do
        ((port++))
    done
    
    echo $port
}

# Check prerequisites
check_prerequisites() {
    # Check if we're in a git repo
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        error "Not in a git repository"
    fi
    
    # Check for uncommitted changes
    if ! git diff-index --quiet HEAD --; then
        error "You have uncommitted changes. Please commit or stash them first."
    fi
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        error ".env file not found. Please copy from .env.example and configure."
    fi
}

# Add a new worktree
add_worktree() {
    local branch=$1
    local folder_name=$(slugify "$branch")
    local target_dir="../$folder_name"
    
    # Check if branch is provided
    if [ -z "$branch" ]; then
        error "Branch name required. Usage: $0 add <branch-name>"
    fi
    
    # Check prerequisites
    check_prerequisites
    
    # Check if target directory already exists
    if [ -d "$target_dir" ]; then
        error "Directory $target_dir already exists"
    fi
    
    # Check if branch exists
    if git show-ref --verify --quiet "refs/heads/$branch"; then
        info "Using existing branch: $branch"
        git worktree add "$target_dir" "$branch"
    else
        info "Creating new branch: $branch"
        git worktree add -b "$branch" "$target_dir"
    fi
    
    success "Created worktree at $target_dir"
    
    # Copy environment files
    info "Copying environment files..."
    cp .env "$target_dir/.env"
    
    # Create .env.local with auto-allocated ports
    if [ -f ".env.local" ]; then
        cp .env.local "$target_dir/.env.local"
        info "Copied existing .env.local"
    else
        # Auto-allocate ports starting from 3010
        local dev_port=$(find_available_port 3010)
        local preview_port=$(find_available_port $((dev_port + 1)))
        local debug_port=$(find_available_port $((preview_port + 1)))
        
        cat > "$target_dir/.env.local" << EOF
# Auto-generated port configuration for worktree: $folder_name
VITE_DEV_PORT=$dev_port
VITE_PREVIEW_PORT=$preview_port
VITE_DEBUG_PORT=$debug_port
EOF
        success "Created .env.local with ports: dev=$dev_port, preview=$preview_port, debug=$debug_port"
    fi
    
    # Run npm install
    info "Installing dependencies..."
    (cd "$target_dir" && npm install)
    success "Dependencies installed"
    
    echo ""
    success "Worktree setup complete!"
    echo "To start working:"
    echo "  cd $target_dir"
    echo "  npm run dev"
}

# Remove a worktree
remove_worktree() {
    local branch=$1
    local folder_name=$(slugify "$branch")
    local target_dir="../$folder_name"
    
    if [ -z "$branch" ]; then
        error "Branch name required. Usage: $0 remove <branch-name>"
    fi
    
    if [ ! -d "$target_dir" ]; then
        error "Worktree directory $target_dir does not exist"
    fi
    
    # Remove the worktree
    info "Removing worktree..."
    git worktree remove "$target_dir" --force
    
    success "Worktree removed: $target_dir"
}

# List worktrees
list_worktrees() {
    info "Current worktrees:"
    git worktree list
    
    echo ""
    info "Port allocations:"
    find .. -name ".env.local" -type f 2>/dev/null | while read file; do
        local dir=$(dirname "$file")
        local ports=$(grep "VITE_.*_PORT=" "$file" | sed 's/VITE_//' | sed 's/_PORT//' | tr '\n' ' ')
        if [ -n "$ports" ]; then
            echo "  $(basename "$dir"): $ports"
        fi
    done
}

# Main script
case "${1:-}" in
    add)
        add_worktree "$2"
        ;;
    remove|rm|delete)
        remove_worktree "$2"
        ;;
    list|ls)
        list_worktrees
        ;;
    *)
        echo "Git worktree management for Tetraspore"
        echo ""
        echo "Usage:"
        echo "  $0 add <branch-name>     Create new worktree with auto port allocation"
        echo "  $0 remove <branch-name>  Remove existing worktree"
        echo "  $0 list                  List all worktrees and their ports"
        echo ""
        echo "Examples:"
        echo "  $0 add feature/new-game-ui"
        echo "  $0 remove feature/new-game-ui"
        exit 1
        ;;
esac