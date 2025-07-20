# Task: UI Layout and Navigation

## Objective
Create the main application layout with navigation between Tree of Life, Region Map, and Current Choices views.

## Requirements

### 1. App Layout Component (`src/components/layout/AppLayout.tsx`)
- Fixed top navigation bar
- View switching buttons: Tree | Map | Choices  
- Fullscreen content area below nav
- Current turn and species name display

### 2. View Components (Placeholder)
- `src/components/views/TreeView.tsx` - "Tree of Life View"
- `src/components/views/MapView.tsx` - "Region Map View"  
- `src/components/views/ChoicesView.tsx` - "Current Choices View"

### 3. Navigation Integration
- Connect to uiStore for current view state
- Smooth transitions between views
- Keyboard shortcuts (T, M, C)

### 4. Responsive Design
- Mobile-friendly navigation
- Proper viewport handling
- Touch-friendly controls

### 5. Styling
- Dark theme fitting evolution game
- Consistent color scheme from landing page
- Smooth animations

## Mock Data
Create mock data for testing:
- Fake species: "Primordial Cells"
- Turn counter: 1
- Sample regions and features

## Success Criteria
- Can switch between all three views
- Navigation state persists in store
- Responsive on mobile and desktop
- Keyboard shortcuts work

## Example
```typescript
// Should show:
// [Tree] [Map] [Choices]     Turn 1 - Primordial Cells
// 
// <Current view content>
```