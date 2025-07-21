# Tree View Development - Quick Clarifications

This document supplements the main spec with practical clarifications.

## Key Resources
- Main spec: `docs/rfc/tree-view-parallel-development-spec.md`
- Project overview: `CLAUDE.md`
- Multi-agent workflow: `docs/agent-orchestration-guide.md`
- Development environment: `docs/tool-guide-workagent.md`

## Quick Clarifications

### 1. Approach Naming Convention
Your branch will be named `tree-view-[approach]` where `[approach]` is your unique identifier:
- sonnet agent: `tree-view-sonnet`
- gemini agent: `tree-view-gemini`  
- flash agent: `tree-view-flash`
- opus agent: `tree-view-opus`

Your component folder should match: `src/components/TreeView[Approach]/`
- Branch `tree-view-sonnet` → folder `src/components/TreeViewSonnet/`
- Branch `tree-view-gemini` → folder `src/components/TreeViewGemini/`
- Branch `tree-view-flash` → folder `src/components/TreeViewFlash/`
- Branch `tree-view-opus` → folder `src/components/TreeViewOpus/`

**Important**: Use your specific folder name to avoid merge conflicts!

### 2. Data Generation
- **Hardcode rich example data** in your Storybook stories
- Create at least 2 stories: "Basic" (5-10 species) and "Complex" (50+ species)
- No need for a data generator - static arrays are fine
- Focus on showing your vision, not building infrastructure

### 3. Library Usage
The project already includes:
- React Three Fiber (`@react-three/fiber`) for 3D
- D3.js for data visualization
- Framer Motion for animations
- Feel free to use these! No need to add new dependencies

### 4. Performance Testing
- Your "Complex" story should demonstrate 50+ species
- Mention in your docs how you'd handle 500-1000 species
- No need to actually implement optimizations unless they're part of your core approach

### 5. Sound Design
- Just document your sound ideas in comments or your final presentation
- No need for actual audio files or implementation
- Example: `// SOUND: Gentle chime when species is born`

### 6. Final Deliverable
Create `AGENT_RESULT_tree-view-[approach].md` in your worktree root with your presentation.

## Remember
- You have complete creative freedom within the desktop constraint
- The spec's example Species type is just a starting point - extend it!
- Focus on innovation and user experience over perfect implementation
- This is a prototype to explore ideas, not production code

Good luck! Your unique perspective is what we're looking for.