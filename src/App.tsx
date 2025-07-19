import { useEffect, useState } from 'react'
import { useEventStore, useGameStore, useUIStore } from './stores'
import { TestEventSystem } from './pages/TestEventSystem'
import { GameView } from './pages/GameView'

function App() {
  const gameStore = useGameStore()
  const eventStore = useEventStore()
  const uiStore = useUIStore()
  const [showTest] = useState(false)

  // Initialize stores on mount
  useEffect(() => {
    // Load events from localStorage
    const { loadEvents, getEvents } = useEventStore.getState()
    loadEvents()
    
    // Rebuild game state from loaded events
    if (getEvents().length > 0) {
      useGameStore.getState().rebuildFromEvents()
    }

    // Development helpers - expose stores to window
    if (import.meta.env.DEV) {
      Object.assign(window, {
        gameStore: useGameStore.getState,
        eventStore: useEventStore.getState,
        uiStore: useUIStore.getState,
        stores: {
          game: useGameStore,
          event: useEventStore,
          ui: useUIStore
        }
      })
      console.log('Development mode: Stores exposed on window object')
      console.log('Access via: window.gameStore, window.eventStore, window.uiStore')
    }
  }, [])

  const handleNewGame = () => {
    if (gameStore.isInitialized) {
      const confirmed = window.confirm('This will clear all existing game data. Continue?')
      if (!confirmed) return
      
      eventStore.clearEvents()
      uiStore.reset()
    }
    
    gameStore.initializeGame()
    console.log('New game initialized!')
  }


  if (showTest) {
    return <TestEventSystem />
  }

  if (gameStore.isInitialized) {
    return <GameView />
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
        Tetraspore
      </h1>
      <p className="text-xl text-gray-400 mb-8">
        Evolution & Civilization Game
      </p>
      
      <div className="flex gap-4 mb-8">
        <button 
          onClick={handleNewGame}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          New Game
        </button>
        <button 
          onClick={() => console.log('Load game not implemented yet')}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
        >
          Load Game
        </button>
      </div>
      
      <p className="mt-8 text-sm text-gray-500">
        v0.0.1 - Core Event System ✓
      </p>
    </div>
  )
}

export default App