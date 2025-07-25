# Event Sourcing Architecture

This document describes Tetraspore's event sourcing architecture, which enables time travel debugging, undo/redo functionality, and clear separation between intent and outcomes.

## Core Concepts

### Commands vs Domain Events

The architecture strictly separates **intent** from **facts**:

- **Commands** = Intent ("I want to move this species")
- **DomainEvents** = Facts ("This species moved")

```typescript
// Command: What someone wants to happen
interface Command {
  id: string;
  timestamp: number;
  source: "player" | "gamemaster" | "subsystem";
  type: string;
  payload: unknown;
}

// DomainEvent: What actually happened
interface DomainEvent {
  id: string;
  timestamp: number;
  commandId: string; // Links to originating command
  type: string;
  payload: unknown;
}
```

### Why This Distinction Matters

1. **Commands can fail** - Not all intentions succeed
2. **Events are immutable** - History cannot be changed
3. **Validation happens between** - Commands validated before becoming events
4. **UI stays responsive** - Commands process async, UI updates optimistically

## Architecture Flow

```
┌─────────────┐     ┌──────────────┐     ┌──────────┐     ┌──────────────┐     ┌────────────┐
│Players/GM   │────▶│   Commands   │────▶│ Executor │────▶│DomainEvents  │────▶│ Aggregates │
│             │     │   (Intent)   │     │ (Async)  │     │   (Facts)    │     │  (State)   │
└─────────────┘     └──────────────┘     └──────────┘     └──────────────┘     └─────┬──────┘
                           ▲                                                          │
                           └──────────────────────────────────────────────────────────┘
                                              Immediate UI feedback
```

### Processing Pipeline

1. **Command Emission**
   - Player clicks button → Command created
   - Gamemaster decides action → Command created
   - Commands include source for debugging

2. **Async Execution**
   - Executor validates command
   - May call external APIs (LLM, services)
   - Generates zero or more events
   - Commands execute immediately (no batching)

3. **Event Application**
   - Events applied to aggregates
   - Pure functions: `(state, event) => newState`
   - Deterministic and reproducible

4. **UI Update**
   - React re-renders with new state
   - Optimistic updates possible
   - Eventual consistency

## Turn Mechanics

Turns are **NOT** about batching commands. They serve to:

1. **Separate player and gamemaster phases**
   - Players act during their phase
   - Gamemaster acts between turns
   - Prevents race conditions

2. **Ensure async completion**
   - Turn boundaries await all pending commands
   - Clean state for next phase
   - No lingering operations

3. **Track in-game time**
   - Each turn represents game time passage
   - Events can reference turn numbers
   - Time-based mechanics

```typescript
// Example turn flow
async function processTurn(turnNumber: number) {
  // Player phase - commands execute as emitted
  enablePlayerInput();

  // Wait for player to end turn
  await playerEndsTurn();

  // Ensure all player commands complete
  await allCommandsComplete();

  // Gamemaster phase
  const gmCommands = await gamemasterAnalyze(currentState);
  await executeCommands(gmCommands);

  // Emit turn change event
  emit({ type: "TURN_CHANGED", payload: { turn: turnNumber + 1 } });
}
```

## State Management

### Event Store

The append-only list of all domain events:

```typescript
interface EventStore {
  events: DomainEvent[];

  append(event: DomainEvent): void;
  getAll(): DomainEvent[];
  getSince(eventId: string): DomainEvent[];
}
```

### Aggregates

Pure functions that reduce events to current state:

```typescript
class PlanetAggregate {
  reduce(events: DomainEvent[]): PlanetState {
    return events.reduce((state, event) => {
      switch (event.type) {
        case "SPECIES_CREATED":
          return { ...state, species: [...state.species, event.payload] };
        case "SPECIES_MOVED":
          return updateSpeciesLocation(state, event.payload);
        default:
          return state;
      }
    }, initialPlanetState);
  }
}
```

### Why Pure Functions Matter

1. **Testability** - Easy to test with known inputs
2. **Time travel** - Replay events to any point
3. **Debugging** - Deterministic behavior
4. **Performance** - Can memoize results

## Timeline and Undo System

The event store naturally provides undo/redo:

```typescript
interface TimelineStore {
  // Event history IS the undo stack
  eventHistory: DomainEvent[];

  // Current position in timeline
  currentIndex: number;

  // Undo: replay events up to earlier point
  undo(): void {
    this.currentIndex = Math.max(0, this.currentIndex - 1);
    this.rebuildState();
  }

  // Redo: replay more events
  redo(): void {
    this.currentIndex = Math.min(
      this.eventHistory.length - 1,
      this.currentIndex + 1
    );
    this.rebuildState();
  }

  // Jump to any point in history
  jumpTo(eventId: string): void {
    const index = this.eventHistory.findIndex(e => e.id === eventId);
    if (index >= 0) {
      this.currentIndex = index;
      this.rebuildState();
    }
  }

  private rebuildState(): void {
    const eventsToApply = this.eventHistory.slice(0, this.currentIndex + 1);
    // Rebuild all aggregates with limited events
  }
}
```

### Player-Facing Undo

Players get undo functionality because:

- LLM gamemasters can misunderstand intent
- Mistakes in complex games are frustrating
- Encourages experimentation

## Validation with Zod

Commands are validated using Zod schemas:

```typescript
import { z } from "zod";

// Define command schema
const MoveSpeciesCommand = z.object({
  type: z.literal("MOVE_SPECIES"),
  payload: z.object({
    speciesId: z.string().uuid(),
    fromRegionId: z.string().uuid(),
    toRegionId: z.string().uuid(),
    population: z.number().positive(),
  }),
});

// Type inference
type MoveSpeciesCommand = z.infer<typeof MoveSpeciesCommand>;

// Validation in executor
async function executeCommand(command: Command): Promise<DomainEvent[]> {
  // Parse and validate
  const result = MoveSpeciesCommand.safeParse(command);

  if (!result.success) {
    // Command rejected, no events generated
    return [];
  }

  // Validated command, check game rules
  const validatedCommand = result.data;

  // Generate events based on game state
  return [
    {
      id: generateId(),
      timestamp: Date.now(),
      commandId: command.id,
      type: "SPECIES_MOVED",
      payload: validatedCommand.payload,
    },
  ];
}
```

## Best Practices

### Command Design

1. **Name with intent** - "CREATE_SPECIES" not "SPECIES_CREATED"
2. **Include context** - Who, what, where, when
3. **Keep payloads flat** - Easier to validate and debug
4. **One command, one intent** - Don't combine unrelated actions

### Event Design

1. **Name as past tense** - "SPECIES_CREATED" not "CREATE_SPECIES"
2. **Record facts only** - What happened, not why
3. **Include enough data** - Events should be self-contained
4. **Never mutate** - Events are immutable history

### Error Handling

1. **Failed commands don't generate events**
2. **Validation errors return empty event array**
3. **Log command failures for debugging**
4. **UI shows failure feedback**

### Performance Considerations

1. **Events are kept in memory during prototyping**
2. **Aggregates rebuild on-demand**
3. **Memoize aggregate calculations**
4. **Snapshot state periodically (future optimization)**

## Development Benefits

### For AI Agents

1. **Clear patterns** - Standard event sourcing
2. **Type safety** - Zod schemas define contracts
3. **Testable** - Pure functions throughout
4. **Debuggable** - Full audit trail

### For Rapid Prototyping

1. **Mock executors** - Always succeed during UI development
2. **JSON fixtures** - Pre-built event histories
3. **Time travel** - Debug UI with different states
4. **Parallel work** - UI and logic develop independently

## Summary

Event sourcing in Tetraspore provides:

- Clear separation of intent (Commands) and outcomes (DomainEvents)
- Natural undo/redo through event replay
- Perfect audit trail for debugging
- Clean architecture for AI agents to understand
- Flexibility for rapid prototyping

The pattern scales from simple prototypes to complex game logic without architectural changes.
