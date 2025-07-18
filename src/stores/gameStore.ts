import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { GameState, GameEvent } from '../types'
import { projectGameState } from '../services/stateProjection'
import { checkStateHealth } from '../services/stateValidation'
import { useEventStore } from './eventStore'

interface GameStore extends GameState {
  initializeGame: () => void
  processTurn: () => void
  updateFromEvent: (event: GameEvent) => void
  rebuildFromEvents: () => void
}

const initialState: GameState = {
  species: new Map(),
  regions: new Map(),
  features: new Map(),
  activeChoices: [],
  currentTurn: 0,
  isInitialized: false
}

export const useGameStore = create<GameStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      initializeGame: () => {
        const recordEvent = useEventStore.getState().recordEvent
        
        // Create initial species
        const initialSpeciesEvent: GameEvent = {
          type: 'CREATE_SPECIES',
          name: 'Primordial Life',
          description: 'The first spark of life, a simple self-replicating molecule in the primordial soup.',
          imagePrompt: 'microscopic view of primitive self-replicating molecules in ancient ocean',
          evolutionYear: 0,
          timestamp: Date.now()
        }
        
        recordEvent(initialSpeciesEvent)
        
        // Create initial region
        const initialRegionEvent: GameEvent = {
          type: 'CREATE_REGION',
          name: 'Primordial Ocean',
          description: 'The vast, warm ocean where life first emerged.',
          imagePrompt: 'ancient Earth ocean with volcanic activity and storms',
          center: { lat: 0, lon: 0 },
          timestamp: Date.now()
        }
        
        recordEvent(initialRegionEvent)
        
        // Species enters region
        const enterRegionEvent: GameEvent = {
          type: 'SPECIES_ENTERS_REGION',
          speciesName: 'Primordial Life',
          regionName: 'Primordial Ocean',
          time: 0,
          timestamp: Date.now()
        }
        
        recordEvent(enterRegionEvent)
        
        // Rebuild state from events
        get().rebuildFromEvents()
        
        set({ isInitialized: true })
      },

      processTurn: () => {
        const currentTurn = get().currentTurn
        const recordEvent = useEventStore.getState().recordEvent
        
        // Record turn processed event
        const turnEvent: GameEvent = {
          type: 'TURN_PROCESSED',
          turnNumber: currentTurn + 1,
          outcomes: [], // Will be filled by LLM service later
          time: currentTurn + 1,
          timestamp: Date.now()
        }
        
        recordEvent(turnEvent)
        
        set({ currentTurn: currentTurn + 1 })
      },

      updateFromEvent: (event: GameEvent) => {
        // Apply single event to current state
        const currentState = {
          species: get().species,
          regions: get().regions,
          features: get().features,
          activeChoices: get().activeChoices,
          currentTurn: get().currentTurn,
          isInitialized: get().isInitialized
        }
        
        const newState = projectGameState([event], currentState)
        set(newState)
      },

      rebuildFromEvents: () => {
        // Rebuild entire state from event log
        const events = useEventStore.getState().getEvents()
        const newState = projectGameState(events)
        
        // Validate state health in development
        if (import.meta.env.DEV) {
          checkStateHealth(newState)
        }
        
        set(newState)
      }
    }),
    {
      name: 'GameStore'
    }
  )
)