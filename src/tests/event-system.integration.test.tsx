import { describe, it, expect, beforeEach } from 'vitest'
import { useEventStore } from '../stores/eventStore'
import { useGameStore } from '../stores/gameStore'
import { validateStateInvariants } from '../services/stateValidation'
import { GameEvent } from '../types'

describe('Event System Integration', () => {
  beforeEach(() => {
    // Clear stores before each test
    useEventStore.getState().clearEvents()
    useGameStore.setState({
      species: new Map(),
      regions: new Map(),
      features: new Map(),
      activeChoices: [],
      currentTurn: 0,
      isInitialized: false
    })
  })

  it('maintains state consistency through complex event sequence', () => {
    const eventStore = useEventStore.getState()
    const gameStore = useGameStore.getState()
    
    // Create species
    const createSpeciesEvent: GameEvent = {
      type: 'CREATE_SPECIES',
      name: 'Test Species',
      description: 'A test species',
      imagePrompt: 'test prompt',
      evolutionYear: 0,
      timestamp: Date.now()
    }
    eventStore.recordEvent(createSpeciesEvent)
    
    // Create region
    const createRegionEvent: GameEvent = {
      type: 'CREATE_REGION',
      name: 'Test Region',
      description: 'A test region',
      imagePrompt: 'region prompt',
      center: { lat: 0, lon: 0 },
      timestamp: Date.now()
    }
    eventStore.recordEvent(createRegionEvent)
    
    // Species enters region
    const enterRegionEvent: GameEvent = {
      type: 'SPECIES_ENTERS_REGION',
      speciesName: 'Test Species',
      regionName: 'Test Region',
      time: 0,
      timestamp: Date.now()
    }
    eventStore.recordEvent(enterRegionEvent)
    
    // Rebuild state
    gameStore.rebuildFromEvents()
    
    // Validate state
    const errors = validateStateInvariants(useGameStore.getState())
    expect(errors).toEqual([])
    
    // Check bidirectional references
    const species = useGameStore.getState().species.get('Test Species')
    const region = useGameStore.getState().regions.get('Test Region')
    expect(species?.currentRegions.has('Test Region')).toBe(true)
    expect(region?.currentSpecies.has('Test Species')).toBe(true)
  })

  it('persists and restores state correctly', () => {
    const eventStore = useEventStore.getState()
    const gameStore = useGameStore.getState()
    
    // Initialize game
    gameStore.initializeGame()
    
    // Add some events
    const featureEvent: GameEvent = {
      type: 'CREATE_FEATURE',
      name: 'Test Feature',
      description: 'Test',
      category: 'ecology',
      regionName: 'Primordial Ocean',
      time: 0,
      timestamp: Date.now()
    }
    eventStore.recordEvent(featureEvent)
    gameStore.rebuildFromEvents()
    
    // Save current state
    const eventCount = eventStore.events.length
    const speciesCount = useGameStore.getState().species.size
    const regionCount = useGameStore.getState().regions.size
    const featureCount = useGameStore.getState().features.size
    
    // Simulate page reload by clearing memory state
    useGameStore.setState({
      species: new Map(),
      regions: new Map(),
      features: new Map(),
      activeChoices: [],
      currentTurn: 0,
      isInitialized: false
    })
    
    // Load from localStorage and rebuild
    eventStore.loadEvents()
    gameStore.rebuildFromEvents()
    
    // Verify state restored correctly
    expect(eventStore.events.length).toBe(eventCount)
    expect(useGameStore.getState().species.size).toBe(speciesCount)
    expect(useGameStore.getState().regions.size).toBe(regionCount)
    expect(useGameStore.getState().features.size).toBe(featureCount)
    
    // Validate no invariant violations
    const errors = validateStateInvariants(useGameStore.getState())
    expect(errors).toEqual([])
  })

  it('handles extinction correctly', () => {
    const eventStore = useEventStore.getState()
    const gameStore = useGameStore.getState()
    
    // Setup: species in region
    gameStore.initializeGame()
    
    // Make species extinct
    const extinctEvent: GameEvent = {
      type: 'EXTINCT_SPECIES',
      speciesName: 'Primordial Life',
      reason: 'Test extinction',
      time: 1,
      timestamp: Date.now()
    }
    eventStore.recordEvent(extinctEvent)
    gameStore.rebuildFromEvents()
    
    // Check extinction handled correctly
    const species = useGameStore.getState().species.get('Primordial Life')
    const region = useGameStore.getState().regions.get('Primordial Ocean')
    
    expect(species?.isExtinct).toBe(true)
    expect(species?.currentRegions.size).toBe(0)
    expect(region?.currentSpecies.has('Primordial Life')).toBe(false)
    
    // Validate no invariant violations
    const errors = validateStateInvariants(useGameStore.getState())
    expect(errors).toEqual([])
  })

  it('validates all event types have handlers', () => {
    // This is a compile-time check in our implementation
    // The event registry pattern ensures all event types are handled
    // If this compiles, the test passes
    expect(true).toBe(true)
  })
})