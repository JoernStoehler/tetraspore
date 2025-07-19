import { useGameStore, useEventStore } from '../../stores'
import { ChoiceList } from '../game'
import { mockChoices } from '../../data/mockChoices'
import { ChoiceWithUI } from '../../types'

export function ChoicesView() {
  const { currentTurn } = useGameStore()
  const eventStore = useEventStore()
  const gameStore = useGameStore()

  const handleChoiceSelect = (choice: ChoiceWithUI) => {
    console.log('Choice selected:', choice)
    
    // Record the choice selection event
    const event = {
      type: 'CHOICE_SELECTED' as const,
      choiceId: choice.id,
      playerId: 'player1', // TODO: Get from game state when multiplayer
      selection: [], // TODO: Define selection format
      time: gameStore.currentTurn,
      timestamp: Date.now()
    }
    
    eventStore.recordEvent(event)
    // TODO: Process choice effects
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Evolution Choices
          </h1>
          <p className="text-gray-400">Turn {currentTurn}</p>
          <p className="text-sm text-gray-500 mt-1">
            Choose your path of development
          </p>
        </div>

        <ChoiceList 
          choices={mockChoices}
          onSelectChoice={handleChoiceSelect}
        />
      </div>
    </div>
  )
}