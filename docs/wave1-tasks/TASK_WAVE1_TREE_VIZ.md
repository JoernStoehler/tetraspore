# Task: Tree of Life Visualization

## Objective
Create an interactive tree visualization showing the species' evolutionary features and development path.

## Requirements

### 1. Tree Component (`src/components/game/TreeOfLife.tsx`)
- Hierarchical node layout
- Features as nodes, categories as branches/colors
- Smooth pan and zoom
- Node highlighting on hover

### 2. Tree Data Structure
```typescript
interface TreeNode {
  id: string;
  feature: Feature;
  category: Category;
  children: TreeNode[];
  unlockTurn?: number;
}
```

### 3. Visualization Features
- Start with root node (species origin)
- Branch out by category
- Show unlocked vs potential features
- Animated growth when features unlock
- Search/filter capability

### 4. Mock Tree Data (`src/data/mockTreeData.ts`)
Create example evolution tree:
- Root: "Primordial Life"
- Physical branch: Cell walls → Mobility → Senses
- Cognitive branch: Reactions → Memory → Learning
- Social branch: Chemicals → Signals → Groups

### 5. Interactivity
- Click node for details
- Zoom to branch/category
- Collapse/expand branches
- Mini-map for navigation

## Technical Approach
Two options (choose based on complexity):
1. **D3.js** - More control, standard for trees
2. **React Flow** - Easier, but less tree-specific

Start simple, enhance iteratively.

## Visual Design
- Organic, root-like connections
- Category color coding
- Soft shadows and gradients
- Subtle animations

## Success Criteria
- Displays hierarchical tree
- Pan/zoom works smoothly
- Responsive to data changes
- Good performance with 100+ nodes
- Mobile touch support