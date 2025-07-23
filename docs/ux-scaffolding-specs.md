# Tetraspore UX Scaffolding Specifications

## Overview
Core React components needed for the Tetraspore game interface, providing navigation and visualization for an evolution-based planetary simulation game.

## Component Specifications

### 1. Game Intro Component
- **Purpose**: Engaging entry point with skippable intro animations
- **Features**:
  - Multiple intro animation variants (randomly selected or sequential)
  - Game title and author credits
  - AI content disclaimer/warning
  - Skip functionality with smooth transition to main menu
  - Trailer-like presentation style

### 2. Planet Selection Page (Main Menu)
- **Visual Design**: 3D galaxy view, semi-realistic and aesthetically pleasing
- **Dynamic Coloring System**:
  - Initial state: Greyscale galaxy
  - Color emergence: Spreads from planets with active games
  - Color intensity: Increases with game duration/progress
  - Singularity effect: Stars darken/burn out in surrounding area post-completion
- **Interaction**: Creates lasting visual impact reflecting player's cumulative progress

### 3. Map Page
- **Dual View System**:
  - 3D globe view (rotatable, zoomable)
  - 2D flat map projection
- **Region Design**:
  - Non-convex, non-simply-connected polygonal regions
  - Clickable regions showing detailed feature views
  - Support for placing figurines, tokens, and graphical elements
  - Region-specific feature cards
- **Technical Consideration**: Avoid sub-region granularity to prevent LLM context overflow

### 4. Evolution Page
- **Core Feature**: 2D evolutionary tree visualization
- **Tree Structure**:
  - Parent-child speciation relationships only (no horizontal gene transfer)
  - Extinction events terminate branches
  - Scrollable, zoomable, searchable interface
  - Expected to grow linearly/quadratically (multiple screens of data)
- **Species Cards Section**:
  - 1 slot for currently hovered species
  - Scrollable history (no duplicates) showing:
    - Pinned species (priority)
    - Recently viewed/clicked species
    - Order by last interaction time

### 5. Technology Page
- **Concept**: 2D graph of behavioral/cultural evolution
- **Graph Elements**:
  - Nodes: Behaviors/technologies/cultural practices
  - Edges: Prerequisite relationships (e.g., "rock tools" → "armed conflict")
  - Multiple prerequisites possible (e.g., "teaching" requires both "rock tools" and "tribes")
- **Scope**: Social, cultural, economic, political, technological, and individual behaviors
- **Multi-species Support**: Handle racial differences through behavior prerequisites
  - Example: Species without thumbs locked out of certain initial technologies
  - Workarounds discoverable through alternative tech paths

### 6. Settings Menu
- **Accessibility**: Available from all pages
- **Core Settings**:
  - Sound controls
  - Font size adjustment
  - Autosave notification
  - Bug report button (for AI behavior issues)
- **Implementation**: Modal or dedicated page

## Navigation Structure
- Navbar provides return to planet selection
- No traditional game menu needed (Esc key functionality TBD)
- Settings accessible globally

## Technical Considerations
- Components should be responsive and accessible
- 3D visualizations need WebGL fallbacks
- Large data visualizations require performance optimization
- Consider lazy loading for complex graph renders