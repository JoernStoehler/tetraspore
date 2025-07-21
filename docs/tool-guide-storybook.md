# Tool Guide: storybook

Visual component development and testing for Tetraspore, with project-specific conventions.

## Overview

Storybook is configured for the Tetraspore React + Vite + TypeScript stack. This guide covers project-specific conventions and non-standard aspects. It assumes familiarity with Storybook 9.

## Key Commands

```bash
npm run storybook        # Dev server on port 6006
npm run build-storybook  # Build static site to storybook-static/
```

## Project-Specific Conventions

### 1. Import from @storybook/react-vite

Due to ESLint configuration, you must use the Vite-specific package:

```typescript
// ❌ Will cause ESLint error
import type { Meta, StoryObj } from '@storybook/react';

// ✅ Correct import
import type { Meta, StoryObj } from '@storybook/react-vite';
```

### 2. Test Data Architecture

Test data lives in separate JSON files, not inline in stories:

```
src/test-data/
├── tree-scenarios/
│   ├── basic-tree.json      # Simple 3-5 species
│   ├── complex-tree.json    # 20+ species evolution
│   ├── extinction-event.json # Mass extinction scenario
│   └── turn-8-to-10-replay.json # Missed turns simulation
└── index.ts                 # Type-safe exports
```

Usage in stories:
```typescript
import { basicTree, complexTree } from '../../test-data';

export const BasicTree: Story = {
  args: {
    nodes: basicTree,  // From JSON file
  },
};
```

Benefits:
- Reusable across stories and tests
- Easier to maintain complex scenarios
- Type-safe through index.ts exports

### 3. Dark Theme Default

The preview is configured with a dark background to match the game aesthetic:

```typescript
// .storybook/preview.ts
parameters: {
  backgrounds: {
    default: 'dark',
    values: [
      { name: 'dark', value: '#0f1419' },
      { name: 'light', value: '#ffffff' },
    ],
  },
}
```

### 4. Minimal Addon Philosophy

Following the project's "no unnecessary files" principle:
- Only essential addons from init are included
- No accessibility, interactions, or other addons by default
- Add addons only when there's a clear need

### 5. Story Organization

Stories are colocated with components:
```
src/components/TreeOfLife/
├── TreeOfLife.tsx
├── TreeOfLife.test.tsx
├── TreeOfLife.stories.tsx   # Stories live here
└── TreeOfLife.css
```

## Writing Stories

### Basic Structure

```typescript
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Component } from './Component';

const meta = {
  title: 'Category/ComponentName',
  component: Component,
  parameters: {
    layout: 'fullscreen',  // For game components
  },
  args: {
    // Default props
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // Story-specific props
  },
};
```

### Story Naming Conventions

- Use descriptive names: `BasicTree`, not `Default`
- Include scenario descriptions in parameters.docs
- Group related stories: `SmallViewport`, `LargeViewport`

### Testing Different States

For game components, always include:
1. Empty/initial state
2. Basic populated state
3. Complex/stress test state
4. Edge cases (extinctions, missing data)
5. Different viewport sizes

## Common Patterns

### Game Component Stories

```typescript
const meta = {
  title: 'Game/ComponentName',  // Use 'Game' category
  parameters: {
    layout: 'fullscreen',       // Full viewport
    backgrounds: {
      default: 'dark',          // Game context
    },
  },
};
```

### Interactive Stories

```typescript
export const InteractiveTree: Story = {
  args: {
    onNodeClick: (node) => {
      console.log('Clicked:', node);
      alert(`Clicked: ${node.name}`);
    },
  },
};
```

### Viewport Testing

```typescript
export const MobileView: Story = {
  args: { width: 375, height: 667 },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
};
```

## Troubleshooting

### ESLint Errors

If you see import errors, ensure:
1. Using `@storybook/react-vite` imports
2. `storybook-static/` is in eslint ignores

### Build Issues

Large chunk warnings are expected due to Storybook's size. These can be ignored unless they impact performance.

### Type Issues

Ensure test data imports include type assertion:
```typescript
import type { TreeNode } from '../components/TreeOfLife/types';
export const basicTree = basicTreeData as TreeNode[];
```

## Best Practices

1. **Keep stories focused** - One component per story file
2. **Use real data structures** - Import from test-data/
3. **Document scenarios** - Use parameters.docs.description
4. **Test responsiveness** - Include viewport variants
5. **Match game aesthetics** - Use dark backgrounds

## What NOT to Do

1. **Don't add unnecessary addons** - Keep it minimal
2. **Don't inline large test data** - Use test-data/ files
3. **Don't modify global styles** - Use parameters
4. **Don't create stories for internal hooks/utils** - Focus on visual components
5. **Don't use @storybook/react** - Always use @storybook/react-vite

## Integration with Development

Storybook runs independently from the main app:
- Different port (6006 vs 3000)
- Separate build process
- No interference with app functionality

Use Storybook for:
- Visual component development
- Testing component states
- Documenting component APIs
- Responsive design testing

Not for:
- E2E testing (use Playwright)
- Unit testing (use Vitest)
- Performance testing
- Production builds