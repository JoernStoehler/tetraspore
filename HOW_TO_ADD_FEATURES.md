# How to Add Features to Tetraspore

This guide shows common patterns for extending Tetraspore. Follow these recipes to add new functionality safely.

## Quick Reference

**Adding a new event type**: 2 files to change
**Adding UI state**: 1 file to change  
**Adding game mechanics**: Create event + handler + UI trigger
**Adding a new view**: Create component + add to navigation

## Adding a New Event Type (Most Common Task)

When something happens in the game, it needs an event. Here's how to add one:

### 1. Define the Event Type
In `src/types/events.ts`, add to the `GameEvent` union:

```typescript
export type GameEvent = 
  | // ... existing events ...
  | {
      type: 'SPECIES_EVOLVED'
      speciesName: string
      newTrait: string
      evolutionPath: string[]
      time: number        // Game time when it happened
      timestamp: number   // Real time (always Date.now())
    }
```

### 2. Add the Event Handler
In `src/events/registry.ts`, add to `eventHandlers`:

```typescript
SPECIES_EVOLVED: (state, event) => {
  const species = state.species.get(event.speciesName)
  if (!species) {
    console.warn(`Cannot evolve non-existent species: ${event.speciesName}`)
    return
  }
  
  // Modify state - this is the ONLY place this should happen
  species.traits = [...(species.traits || []), event.newTrait]
  species.evolutionPath = event.evolutionPath
}
```

### 3. Add Validation (Optional but Recommended)
In `src/types/events.ts`, add to `validateEvent`:

```typescript
case 'SPECIES_EVOLVED':
  if (!event.speciesName || !event.newTrait) {
    return { isValid: false, error: 'Evolution needs species and trait' }
  }
  if (!Array.isArray(event.evolutionPath)) {
    return { isValid: false, error: 'Evolution needs path array' }
  }
  break
```

### 4. Trigger the Event from UI
In any component:

```typescript
import { useEventStore, useGameStore } from '../stores'

function EvolutionPanel() {
  const { recordEvent } = useEventStore()
  const { currentTurn } = useGameStore()
  
  const handleEvolve = () => {
    recordEvent({
      type: 'SPECIES_EVOLVED',
      speciesName: 'Primordial Life',
      newTrait: 'Photosynthesis',
      evolutionPath: ['Chemical Energy', 'Solar Energy'],
      time: currentTurn,
      timestamp: Date.now()
    })
  }
  
  return <button onClick={handleEvolve}>Evolve Species</button>
}
```

That's it! The event automatically updates state and persists to localStorage.

## Adding UI State (Views, Selections, Modals)

UI state doesn't need events - it's not part of game history. Add to `src/stores/uiStore.ts`:

```typescript
interface UIState {
  // ... existing state ...
  evolutionPanelOpen: boolean
  selectedTrait: string | null
}

// In the store:
evolutionPanelOpen: false,
selectedTrait: null,

openEvolutionPanel: () => set({ evolutionPanelOpen: true }),
closeEvolutionPanel: () => set({ evolutionPanelOpen: false }),
selectTrait: (trait: string | null) => set({ selectedTrait: trait })
```

Use in components:
```typescript
const { evolutionPanelOpen, openEvolutionPanel } = useUIStore()
```

## Adding Game Mechanics

Game mechanics = rules that generate events based on game state.

### 1. Create a Rules Module
Create `src/rules/evolution.ts`:

```typescript
import { GameState, GameEvent } from '../types'

export function checkEvolutionOpportunities(state: GameState): GameEvent[] {
  const events: GameEvent[] = []
  
  for (const [name, species] of state.species) {
    // Check conditions
    if (species.population > 1000 && !species.traits?.includes('Intelligence')) {
      events.push({
        type: 'SPECIES_EVOLVED',
        speciesName: name,
        newTrait: 'Basic Intelligence',
        evolutionPath: [...(species.evolutionPath || []), 'Intelligence'],
        time: state.currentTurn,
        timestamp: Date.now()
      })
    }
  }
  
  return events
}
```

### 2. Call from Turn Processing
Update turn processing to use your rules:

```typescript
// In a game loop component or store action
const evolutionEvents = checkEvolutionOpportunities(gameState)
for (const event of evolutionEvents) {
  eventStore.recordEvent(event)
}
```

## Adding a New View/Page

### 1. Create the Component
Create `src/pages/EvolutionTree.tsx`:

```typescript
export function EvolutionTree() {
  const { species } = useGameStore()
  
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Evolution Tree</h2>
      {/* Your view content */}
    </div>
  )
}
```

### 2. Add to Navigation
Update view type in `src/types/state.ts`:

```typescript
export type ViewType = 'main' | 'tree' | 'map' | 'history' | 'evolution'
```

Add navigation in your nav component:

```typescript
<button onClick={() => uiStore.setView('evolution')}>
  Evolution Tree
</button>
```

## Common Patterns

### Pattern: Feature with Bidirectional References
If your feature needs bidirectional refs (like Species ↔ Region):

```typescript
// ALWAYS update both sides in the event handler
SPECIES_MIGRATES: (state, event) => {
  const species = state.species.get(event.speciesName)
  const fromRegion = state.regions.get(event.fromRegion)
  const toRegion = state.regions.get(event.toRegion)
  
  if (!species || !fromRegion || !toRegion) return
  
  // Remove from old region (both sides!)
  species.currentRegions.delete(event.fromRegion)
  fromRegion.currentSpecies.delete(event.speciesName)
  
  // Add to new region (both sides!)
  species.currentRegions.add(event.toRegion)
  toRegion.currentSpecies.add(event.speciesName)
}
```

### Pattern: Computed Values
Never store computed values - calculate them when needed:

```typescript
// ❌ BAD: Storing computed value
species.populationDensity = species.population / region.area

// ✅ GOOD: Calculate when needed
function getPopulationDensity(species: Species, region: Region) {
  return species.population / region.area
}
```

### Pattern: Async Operations (API calls, etc)
Do async work BEFORE creating events:

```typescript
async function generateAIContent() {
  // Do async work first
  const aiResponse = await callAI()
  
  // THEN create event with results
  recordEvent({
    type: 'AI_CONTENT_GENERATED',
    content: aiResponse,
    timestamp: Date.now()
  })
}
```

## Testing Your Changes

After adding a feature:

1. **Check State Invariants**: The app logs errors if state is inconsistent
2. **Test Save/Load**: Refresh the page - your feature should persist
3. **Check Event Order**: Use DevTools to see if events fire correctly
4. **Run Tests**: `npm test` to ensure nothing broke

## Don'ts

❌ **Never mutate state directly** - Always use events
❌ **Never make event handlers async** - Do async work before creating events  
❌ **Never store derived state** - Calculate it when needed
❌ **Never create circular events** - Event A triggers Event B triggers Event A
❌ **Never trust external data** - Always validate events

## Debugging Tips

```javascript
// See all events
window.eventStore().events

// Check current state
window.gameStore()

// Manually trigger events (testing)
window.eventStore().recordEvent({
  type: 'CREATE_SPECIES',
  name: 'Test Species',
  // ... rest of event
})

// Rebuild state from events
window.gameStore().rebuildFromEvents()
```

## Questions?

If something isn't covered here:
1. Check `ARCHITECTURE_DECISIONS.md` for the "why"
2. Look for similar patterns in existing code
3. When in doubt, create an event!