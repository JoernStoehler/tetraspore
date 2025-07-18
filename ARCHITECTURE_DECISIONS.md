# Critical Architecture Decisions - DO NOT CHANGE WITHOUT UNDERSTANDING

This document explains key architectural decisions in Tetraspore. These choices have non-obvious implications. Changing them without understanding the consequences will break core functionality.

## 1. Event Sourcing (Not Direct State Mutation)

**Decision**: All state changes happen through events. State is derived by replaying events.

**Why**:
- **Save/Load**: Events are the save file - just store and replay
- **Debugging**: Can replay exact sequence that led to any bug
- **Audit Trail**: Every AI decision is recorded
- **Future Multiplayer**: Events can be synchronized between players
- **Time Travel**: Can show game history, undo/redo

**Cost**: 
- More complex than direct state updates
- Must handle event versioning eventually
- Performance considerations with many events

**If You Break This**:
- Save/load stops working
- Can't debug AI behavior
- No audit trail for decisions
- Multiplayer becomes impossible
- Time travel features break

**Code Example**:
```typescript
// ❌ NEVER DO THIS:
gameStore.species.set('NewSpecies', { ... })

// ✅ ALWAYS DO THIS:
eventStore.recordEvent({
  type: 'CREATE_SPECIES',
  name: 'NewSpecies',
  ...
})
```

## 2. Dual Time Fields in Events

**Decision**: Events have both `time` (game time) and `timestamp` (real time).

**Why**:
- **`timestamp`**: Ensures correct replay order (real-world sequence)
- **`time`**: Game-world time for mechanics (evolution year, turn number)
- Events might be created out of game-time order (retroactive events from LLM)
- UI needs both: real order for replay, game time for display

**If You Break This**:
- Events replay in wrong order (timestamp) 
- OR game logic fails (time)
- Save files become corrupted
- Time travel shows wrong sequence

**Code Example**:
```typescript
{
  type: 'SPECIES_EVOLVED',
  time: 1000,        // Year 1000 in game world
  timestamp: Date.now(), // When player made this choice
}
```

## 3. Bidirectional References Must Be Manually Synced

**Decision**: `Species.currentRegions` and `Region.currentSpecies` are both stored and manually kept in sync.

**Why**:
- **Performance**: O(1) lookups from both directions
- **Event Sourcing**: Can't use computed properties - state must be explicit
- **Consistency**: Both sides updated atomically in event handlers

**Cost**:
- Must update both sides in event handlers
- Risk of inconsistency if missed

**If You Break This**:
- Species appear in regions they've left
- Regions don't know what species they contain  
- UI shows inconsistent information
- Extinction cleanup fails

**Code Example**:
```typescript
// In stateProjection.ts - MUST update both sides
case 'SPECIES_ENTERS_REGION':
  species.currentRegions.add(regionName)    // Update species side
  region.currentSpecies.add(speciesName)    // Update region side
  break
```

## 4. Sets for Many-to-Many Relationships

**Decision**: Use `Set<string>` for relationships like current regions, species, features.

**Why**:
- **Uniqueness**: Automatically prevents duplicates
- **Performance**: O(1) add/remove/has operations
- **Semantics**: A species is either in a region or not (no duplicates)

**Cost**:
- Sets don't JSON.stringify by default
- Zustand handles serialization but be careful

**If You Break This** (convert to arrays):
- Duplicate entries (species in same region twice)
- O(n) performance for checks
- Complex deduplication logic needed

## 5. State is Derived, Events are Truth

**Decision**: Game state is always rebuilt from events. Never persist state directly.

**Why**:
- **Single Source of Truth**: Events are the canonical history
- **Consistency**: State can't drift from events
- **Flexibility**: Can change state derivation without migration
- **Debugging**: Can replay from any point

**If You Break This**:
- State drift from events
- Can't trust save files
- Debugging becomes impossible
- Migration nightmares

## 6. Zustand Stores Are Separate

**Decision**: `eventStore` and `gameStore` are separate stores.

**Why**:
- **Separation of Concerns**: Events = permanent log, State = derived view
- **Different Persistence**: Events need careful versioning, state can be rebuilt
- **Testing**: Can test projection logic without store complexity
- **Performance**: Event store is append-only, game store is mutable

**If You Break This** (merge stores):
- Circular dependencies
- Can't test in isolation
- Persistence becomes complex
- Performance degrades

## 7. No Async in Event Handlers

**Decision**: Event projection (`applyEvent`) is synchronous.

**Why**:
- **Deterministic Replay**: Same events = same state, always
- **Simplicity**: No race conditions in state updates
- **Testing**: Predictable outcomes

**If You Break This**:
- Non-deterministic state
- Race conditions
- Can't replay reliably
- Tests become flaky

## 8. Event Validation vs Application

**Decision**: Validate when recording events, not when applying them.

**Why**:
- **Performance**: Events in storage are pre-validated
- **Trust**: If it's in the event log, it happened
- **Replay Speed**: No validation overhead during rebuild

**If You Break This**:
- Slow replay/rebuild
- OR invalid events corrupt state
- Can't trust event log

## Remember

These decisions form the foundation of Tetraspore's architecture. They're interconnected - breaking one often breaks others. When in doubt, preserve these patterns even if they seem complex. The complexity serves important purposes that only become apparent at scale or when adding advanced features.