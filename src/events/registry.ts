import { GameState, GameEvent, Species, Region, Feature } from '../types'

/**
 * Event handler type - takes state and event, mutates state
 * These handlers are the ONLY place where state mutation happens
 */
type EventHandler<T extends GameEvent> = (state: GameState, event: T) => void

/**
 * Type helper to extract specific event types from the union
 */
type ExtractEvent<T extends GameEvent['type']> = Extract<GameEvent, { type: T }>

/**
 * Registry of all event handlers. Adding a new event type? Add its handler here.
 * TypeScript will enforce that all event types have handlers.
 */
export const eventHandlers: {
  [K in GameEvent['type']]: EventHandler<ExtractEvent<K>>
} = {
  CREATE_SPECIES: (state, event) => {
    const species: Species = {
      name: event.name,
      description: event.description,
      imagePrompt: event.imagePrompt,
      parentSpecies: event.parentSpecies,
      evolutionYear: event.evolutionYear,
      isExtinct: false,
      currentRegions: new Set()
    }
    state.species.set(event.name, species)
  },

  EXTINCT_SPECIES: (state, event) => {
    const species = state.species.get(event.speciesName)
    if (!species) {
      console.warn(`Cannot extinct non-existent species: ${event.speciesName}`)
      return
    }
    
    species.isExtinct = true
    species.extinctionReason = event.reason
    
    // Remove from all regions (maintain bidirectional consistency)
    for (const regionName of species.currentRegions) {
      const region = state.regions.get(regionName)
      if (region) {
        region.currentSpecies.delete(event.speciesName)
      }
    }
    species.currentRegions.clear()
  },

  SPECIES_ENTERS_REGION: (state, event) => {
    const species = state.species.get(event.speciesName)
    const region = state.regions.get(event.regionName)
    
    if (!species || !region) {
      console.warn(`Cannot enter region: species=${event.speciesName}, region=${event.regionName}`)
      return
    }
    
    // Update both sides of the bidirectional relationship
    species.currentRegions.add(event.regionName)
    region.currentSpecies.add(event.speciesName)
  },

  SPECIES_LEAVES_REGION: (state, event) => {
    const species = state.species.get(event.speciesName)
    const region = state.regions.get(event.regionName)
    
    if (!species || !region) {
      console.warn(`Cannot leave region: species=${event.speciesName}, region=${event.regionName}`)
      return
    }
    
    // Update both sides of the bidirectional relationship
    species.currentRegions.delete(event.regionName)
    region.currentSpecies.delete(event.speciesName)
  },

  CREATE_REGION: (state, event) => {
    const region: Region = {
      name: event.name,
      description: event.description,
      imagePrompt: event.imagePrompt,
      center: event.center,
      weight: event.weight,
      currentSpecies: new Set(),
      features: new Set()
    }
    state.regions.set(event.name, region)
  },

  CREATE_FEATURE: (state, event) => {
    const feature: Feature = {
      name: event.name,
      description: event.description,
      category: event.category,
      regionName: event.regionName
    }
    state.features.set(event.name, feature)
    
    const region = state.regions.get(event.regionName)
    if (region) {
      region.features.add(event.name)
    } else {
      console.warn(`Cannot add feature to non-existent region: ${event.regionName}`)
    }
  },

  DELETE_FEATURE: (state, event) => {
    state.features.delete(event.featureName)
    
    const region = state.regions.get(event.regionName)
    if (region) {
      region.features.delete(event.featureName)
    }
  },

  CHOICE_SELECTED: (() => {
    // Choices affect active choices, but this will be handled by game logic
    // For now, just track that a choice was made
    // TODO: Implement when choice system is added
  }),

  TURN_PROCESSED: (state, event) => {
    state.currentTurn = event.turnNumber
    // Outcomes will generate new events, but those are separate events
    // This just marks that a turn was processed
  }
}

/**
 * Apply a single event to the game state using the registry
 * This is the ONLY way state should be modified
 */
export function applyEvent(state: GameState, event: GameEvent): void {
  const handler = eventHandlers[event.type]
  if (!handler) {
    // This should never happen with TypeScript, but check at runtime
    console.error(`No handler for event type: ${event.type}`)
    return
  }
  
  try {
    // TypeScript ensures the handler matches the event type
    ;(handler as EventHandler<GameEvent>)(state, event)
  } catch (error) {
    console.error(`Error applying event ${event.type}:`, error, event)
    // Continue processing - don't let one bad event break everything
  }
}

// TypeScript compile-time check that all event types have handlers
// This will cause a TypeScript error if any event type is missing
export const _eventHandlerExhaustiveCheck: Record<GameEvent['type'], EventHandler<GameEvent>> = eventHandlers as Record<GameEvent['type'], EventHandler<GameEvent>>