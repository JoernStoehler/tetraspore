# Storybook Setup Instructions for Tetraspore

## Task: Add Storybook to existing React + Vite + TypeScript project

### Critical Constraints
1. **DO NOT modify any existing source files** except to add *.stories.tsx files
2. **DO NOT upgrade any existing dependencies** - work with current versions
3. **DO NOT modify vite.config.ts** unless absolutely necessary for Storybook
4. **DO NOT change TypeScript configuration** in tsconfig.json
5. **DO NOT modify package.json scripts** except to add storybook-specific commands

### Version Compatibility Check First
Before installing anything:
1. Check current versions in package.json:
   - React version (currently 18.3.1)
   - Vite version (currently 5.4.10)
   - TypeScript version (currently ~5.6.2)
2. Ensure Storybook 7.x or 8.x is compatible with these versions
3. Use `npx storybook@latest init` which auto-detects Vite

### Installation Steps
```bash
# Let Storybook auto-detect and configure for Vite + React
npx storybook@latest init

# If prompted, select:
# - Yes to eslint plugin
# - No to npm7 migration (if asked)
# - No to compodoc (if asked)
```

### File Structure Requirements
**Colocate stories with source files:**
```
src/
├── components/
│   ├── TreeOfLife/
│   │   ├── TreeOfLife.tsx
│   │   ├── TreeOfLife.test.tsx
│   │   ├── TreeOfLife.stories.tsx    # ADD THIS
│   │   └── TreeOfLife.css
│   └── GameUI/
│       ├── GameUI.tsx
│       ├── GameUI.test.tsx
│       └── GameUI.stories.tsx         # ADD THIS
```

### Required Stories

#### 1. TreeOfLife.stories.tsx
Create stories demonstrating:
- Basic tree (3-5 species)
- Complex tree (20+ species)
- Empty tree
- Turn progression replay (show turns 8→10)
- Different themes (when applicable)

Include controls for:
- Width/height dimensions
- Theme selection (prepare for future)
- Animation speed
- Show/hide features

#### 2. Test Data Setup
Create `src/test-data/` directory:
```
src/test-data/
├── tree-scenarios/
│   ├── basic-tree.json
│   ├── complex-tree.json
│   ├── extinction-event.json
│   └── turn-8-to-10-replay.json
└── index.ts  # Export all scenarios
```

### Example Story Structure
```typescript
// src/components/TreeOfLife/TreeOfLife.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { TreeOfLife } from './TreeOfLife';
import { basicTree, complexTree } from '../../test-data/tree-scenarios';

const meta = {
  title: 'Game/TreeOfLife',
  component: TreeOfLife,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    width: 800,
    height: 600,
  },
} satisfies Meta<typeof TreeOfLife>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    nodes: basicTree,
  },
};

export const ReplayTurns8to10: Story = {
  args: {
    nodes: complexTree,
  },
  parameters: {
    docs: {
      description: {
        story: 'Simulates player returning after missing turns 8-10',
      },
    },
  },
};
```

### Storybook Configuration
In `.storybook/preview.ts`, add:
- Global decorators for dark background (game context)
- Import app's global CSS
- Configure viewport addon for responsive testing

### Testing Your Setup
1. Run `npm run storybook`
2. Verify no console errors
3. Verify existing `npm run dev` still works
4. Verify `npm run build` still works
5. Check that stories hot-reload when edited

### DO NOT
- Remove or modify the default Storybook stories until setup is confirmed working
- Change any existing component props/interfaces to accommodate Storybook
- Add Storybook-specific code to production components
- Install additional addons beyond the essentials

### Success Criteria
- [ ] Storybook runs without errors
- [ ] TreeOfLife component displays in Storybook
- [ ] Can switch between different tree scenarios
- [ ] No changes to existing app functionality
- [ ] Stories colocated with components
- [ ] Test data properly organized