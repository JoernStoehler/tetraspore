import { useEventStore, useGameStore } from '../stores'
import { GameEvent } from '../types'

export function TestEventSystem() {
  const eventStore = useEventStore()
  const gameStore = useGameStore()

  const testEvents = () => {
    console.log('=== Testing Event System ===')
    
    // Test 1: Record a species creation event
    const speciesEvent: GameEvent = {
      type: 'CREATE_SPECIES',
      name: 'Test Species',
      description: 'A test species for verification',
      imagePrompt: 'test prompt',
      evolutionYear: 100,
      timestamp: Date.now()
    }
    
    console.log('Recording species event:', speciesEvent)
    const success1 = eventStore.recordEvent(speciesEvent)
    console.log('Species event recorded:', success1)
    
    // Test 2: Record a region creation event
    const regionEvent: GameEvent = {
      type: 'CREATE_REGION',
      name: 'Test Region',
      description: 'A test region',
      imagePrompt: 'test region prompt',
      center: { lat: 45, lon: -90 },
      timestamp: Date.now()
    }
    
    console.log('Recording region event:', regionEvent)
    const success2 = eventStore.recordEvent(regionEvent)
    console.log('Region event recorded:', success2)
    
    // Test 3: Update game state from events
    console.log('Rebuilding state from events...')
    gameStore.rebuildFromEvents()
    
    // Test 4: Verify state
    console.log('Current game state:')
    console.log('- Species count:', gameStore.species.size)
    console.log('- Regions count:', gameStore.regions.size)
    console.log('- Events count:', eventStore.events.length)
    
    // Test 5: Check localStorage persistence
    const stored = localStorage.getItem('tetraspore-events')
    console.log('LocalStorage has data:', !!stored)
    
    console.log('=== Test Complete ===')
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Event System Test Page</h2>
      
      <div className="space-y-4 mb-6">
        <div className="p-4 bg-gray-800 rounded">
          <h3 className="font-semibold mb-2">Current State</h3>
          <p>Events: {eventStore.events.length}</p>
          <p>Species: {gameStore.species.size}</p>
          <p>Regions: {gameStore.regions.size}</p>
          <p>Features: {gameStore.features.size}</p>
          <p>Current Turn: {gameStore.currentTurn}</p>
          <p>Initialized: {gameStore.isInitialized ? 'Yes' : 'No'}</p>
        </div>
        
        <button
          onClick={testEvents}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
        >
          Run Event System Tests
        </button>
        
        <button
          onClick={() => {
            eventStore.clearEvents()
            gameStore.rebuildFromEvents()
            console.log('Events cleared')
          }}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded ml-2"
        >
          Clear All Events
        </button>
      </div>
      
      <div className="p-4 bg-gray-800 rounded">
        <h3 className="font-semibold mb-2">Instructions</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Open browser console (F12)</li>
          <li>Click "Run Event System Tests"</li>
          <li>Check console for detailed output</li>
          <li>Refresh page to test persistence</li>
          <li>Use window.gameStore, window.eventStore in console</li>
        </ol>
      </div>
    </div>
  )
}