# State Management

This directory contains Zustand stores for state management in Tetraspore.

## Architecture

We follow a clear separation of concerns:

- **UI State** (`uiStore.ts`) - Navigation, modals, UI preferences
- **Game State** (future) - Game logic, player data, world state

## Why Zustand?

Per our conventions, we chose Zustand over Redux because:

- Simpler API with less boilerplate
- Built-in TypeScript support
- DevTools integration out of the box
- Excellent performance with selective subscriptions

## Usage Guidelines

### 1. Selective Subscriptions

Always use selectors to prevent unnecessary re-renders:

```typescript
// ✅ Good - Only re-renders when currentView changes
const currentView = useUIStore((state) => state.currentView);

// ❌ Bad - Re-renders on any store change
const store = useUIStore();
```

### 2. Action Naming

Actions should be descriptive and follow these patterns:

- `set[Property]` - For direct setters
- `toggle[Property]` - For boolean toggles
- `navigate[To]` - For navigation actions
- `handle[Event]` - For event handlers

### 3. State Organization

Keep stores focused and cohesive:

- One store per domain (UI, Game, etc.)
- Don't mix UI state with game logic
- Use TypeScript interfaces for all state shapes

### 4. Testing

All stores should have comprehensive tests covering:

- Initial state
- All actions
- Selective subscription behavior

See `uiStore.test.ts` for examples.

## Adding New Stores

1. Create the store file: `src/stores/[domain]Store.ts`
2. Define TypeScript interface for state shape
3. Document with JSDoc comments
4. Export from `index.ts`
5. Add comprehensive tests
6. Update this README

## DevTools

All stores are integrated with Redux DevTools. To debug:

1. Install Redux DevTools browser extension
2. Open DevTools and navigate to Redux tab
3. You'll see all Zustand stores with their names

## Performance Considerations

- Use selective subscriptions to minimize re-renders
- Keep computed values in the store if expensive
- Consider splitting large stores into smaller focused ones
- Use `shallow` comparison for object/array selections
