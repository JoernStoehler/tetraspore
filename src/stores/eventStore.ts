import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { GameEvent, validateEvent } from '../types'

const EVENTS_STORAGE_KEY = 'tetraspore-events'

interface EventStore {
  events: GameEvent[]
  recordEvent: (event: GameEvent) => boolean
  getEvents: () => GameEvent[]
  getEventsSince: (timestamp: number) => GameEvent[]
  clearEvents: () => void
  loadEvents: () => void
}

export const useEventStore = create<EventStore>()(
  devtools(
    persist(
      (set, get) => ({
        events: [],

        recordEvent: (event: GameEvent) => {
          const validation = validateEvent(event)
          if (!validation.isValid) {
            console.error('Invalid event:', validation.error, event)
            return false
          }

          set((state) => ({
            events: [...state.events, event]
          }))

          return true
        },

        getEvents: () => {
          return get().events
        },

        getEventsSince: (timestamp: number) => {
          return get().events.filter(event => event.timestamp > timestamp)
        },

        clearEvents: () => {
          set({ events: [] })
        },

        loadEvents: () => {
          try {
            const stored = localStorage.getItem(EVENTS_STORAGE_KEY)
            if (stored) {
              const parsedState = JSON.parse(stored)
              if (parsedState.state && Array.isArray(parsedState.state.events)) {
                set({ events: parsedState.state.events })
              }
            }
          } catch (error) {
            console.error('Failed to load events from localStorage:', error)
          }
        }
      }),
      {
        name: EVENTS_STORAGE_KEY,
        partialize: (state) => ({ events: state.events })
      }
    ),
    {
      name: 'EventStore'
    }
  )
)