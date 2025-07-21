# Event Architecture Notes

## Two-Stream Event System

You're absolutely right to keep game events separate from UI events. Here's why:

### Game Event Stream (Source of Truth)
- **Persistent**: Saved, replayed, shared between players
- **Deterministic**: Same events = same game state
- **Minimal**: Only essential state changes
- **Examples**: species_added, species_evolved, extinction_event

### UI Event Stream (Ephemeral)
- **Local**: Per-player, per-session
- **Rich**: Can include mouse moves, hovers, viewport changes
- **Disposable**: Can be regenerated from game state + UI state
- **Examples**: camera_moved, species_hovered, animation_completed

### Visual Event Computation

```typescript
// Visual events are computed, not stored
function computeVisualEvents(
  gameEvents: GameEvent[],
  lastViewedTurn: number,
  currentTurn: number,
  uiPreferences: UIPreferences
): VisualEvent[] {
  // Can look ahead through all game events
  // Can consider UI state (last viewed)
  // Can optimize for visual impact (parallel animations)
  
  return [
    // Smart scheduling of animations
    { type: 'species-birth', delay: 0, duration: 600 },
    { type: 'species-birth', delay: 100, duration: 600 }, // Overlapping!
    { type: 'extinction-wave', delay: 800, duration: 1000 },
    // etc.
  ];
}
```

## Benefits of Separation

1. **Game logs stay small** - No UI noise
2. **Multiplayer works** - Only sync game events
3. **Replay is deterministic** - UI doesn't affect game
4. **Performance** - UI events don't persist
5. **Flexibility** - Change visualizations without touching game logic

## The Aggregation Pipeline

```
Game Events → Game State Aggregates → Visual Events → Tree Visualization
              ↑                        ↑
              Pure function            Also considers UI State
```

This architecture is clean and scales well!