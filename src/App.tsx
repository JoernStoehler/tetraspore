import { useEffect, useState } from 'react'
import { useEventStore, useGameStore, useUIStore } from './stores'
import { TestEventSystem } from './pages/TestEventSystem'
import { ChoiceList } from './components/game'
import { mockChoices } from './data/mockChoices'
import { ChoiceWithUI } from './types'

function App() {
  const gameStore = useGameStore()
  const eventStore = useEventStore()
  const uiStore = useUIStore()
  const [showTest, setShowTest] = useState(false)
  const [showChoices, setShowChoices] = useState(false)

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

  const handleTestEvent = () => {
    const event = {
      type: 'CREATE_FEATURE' as const,
      name: `Test Feature ${Date.now()}`,
      description: 'A test feature created for development',
      category: 'ecology' as const,
      regionName: 'Primordial Ocean',
      time: gameStore.currentTurn,
      timestamp: Date.now()
    }
    
    const success = eventStore.recordEvent(event)
    if (success) {
      gameStore.updateFromEvent(event)
      console.log('Test event recorded:', event)
    }
  }

  const handleProcessTurn = () => {
    gameStore.processTurn()
    console.log(`Turn ${gameStore.currentTurn} processed`)
  }

  const handleChoiceSelect = (choice: ChoiceWithUI) => {
    console.log('Choice selected:', choice)
    // TODO: Integrate with game store/event system
  }

  if (showTest) {
    return <TestEventSystem />
  }

  if (showChoices) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Evolution Choices
              </h1>
              <p className="text-gray-400">Choose your path of development</p>
            </div>
            <button 
              onClick={() => setShowChoices(false)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              Back to Main
            </button>
          </div>
          
          <ChoiceList 
            choices={mockChoices}
            onSelectChoice={handleChoiceSelect}
          />
        </div>
      </div>
    )
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

      {gameStore.isInitialized && (
        <div className="text-center space-y-4">
          <p className="text-lg">Turn: {gameStore.currentTurn}</p>
          <p className="text-sm text-gray-400">
            Species: {gameStore.species.size} | 
            Regions: {gameStore.regions.size} | 
            Features: {gameStore.features.size}
          </p>
          <p className="text-sm text-gray-400">
            Events: {eventStore.events.length}
          </p>
          
          {/* Development test buttons */}
          {import.meta.env.DEV && (
            <div className="flex gap-2 mt-4">
              <button 
                onClick={handleTestEvent}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm"
              >
                Test Event
              </button>
              <button 
                onClick={handleProcessTurn}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm"
              >
                Process Turn
              </button>
              <button 
                onClick={() => setShowTest(true)}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-sm"
              >
                Test Page
              </button>
              <button 
                onClick={() => setShowChoices(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded text-sm"
              >
                Choice Cards
              </button>
            </div>
          )}
        </div>
      )}
      
      <p className="mt-8 text-sm text-gray-500">
        v0.0.1 - Core Event System ✓
      </p>
    </div>
  )
}

export default App