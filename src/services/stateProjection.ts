import { GameState, GameEvent } from '../types'
import { applyEvent } from '../events/registry'

/**
 * Projects game state by replaying events in order.
 * This is how we derive current state from the event log.
 * 
 * @param events - Array of events to replay
 * @param initialState - Optional starting state (for incremental updates)
 * @returns The projected game state
 */
export function projectGameState(
  events: GameEvent[], 
  initialState?: GameState
): GameState {
  // Start with initial state or empty state
  const state: GameState = initialState ? {
    species: new Map(initialState.species),
    regions: new Map(initialState.regions),
    features: new Map(initialState.features),
    activeChoices: [...initialState.activeChoices],
    currentTurn: initialState.currentTurn,
    isInitialized: initialState.isInitialized
  } : {
    species: new Map(),
    regions: new Map(),
    features: new Map(),
    activeChoices: [],
    currentTurn: 0,
    isInitialized: false
  }

  // Apply each event in order using the registry
  for (const event of events) {
    applyEvent(state, event)
  }

  return state
}