import { useGameStore, useUIStore } from '../../stores'

export function ChoicesView() {
  const { activeChoices, currentTurn } = useGameStore()
  const { selectedChoice, selectChoice } = useUIStore()

  const categoryColors = {
    physical: 'from-red-500 to-orange-500',
    cognitive: 'from-blue-500 to-purple-500', 
    social: 'from-green-500 to-teal-500',
    technological: 'from-yellow-500 to-amber-500'
  }

  const categoryIcons = {
    physical: '💪',
    cognitive: '🧠',
    social: '👥', 
    technological: '⚙️'
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          Current Choices
        </h1>
        
        <div className="text-center mb-8">
          <p className="text-gray-400">Turn {currentTurn}</p>
          <p className="text-sm text-gray-500 mt-1">
            Make your choices to guide evolution
          </p>
        </div>

        {activeChoices.length > 0 ? (
          <div className="space-y-4">
            {activeChoices.map((choice) => (
              <div
                key={choice.id}
                className={`
                  bg-gray-800 rounded-lg border transition-all cursor-pointer
                  ${selectedChoice === choice.id 
                    ? 'border-yellow-500 bg-gray-700 shadow-lg shadow-yellow-500/20' 
                    : 'border-gray-700 hover:border-gray-600 hover:bg-gray-750'
                  }
                `}
                onClick={() => selectChoice(
                  selectedChoice === choice.id ? null : choice.id
                )}
              >
                <div className="p-6">
                  {/* Choice Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {categoryIcons[choice.category]}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {choice.title}
                        </h3>
                        <div className={`
                          inline-block px-2 py-1 rounded text-xs font-medium text-white
                          bg-gradient-to-r ${categoryColors[choice.category]}
                        `}>
                          {choice.category}
                        </div>
                      </div>
                    </div>
                    
                    {selectedChoice === choice.id && (
                      <div className="text-yellow-400">
                        ✓ Selected
                      </div>
                    )}
                  </div>

                  {/* Choice Description */}
                  <p className="text-gray-300 mb-4 leading-relaxed">
                    {choice.description}
                  </p>

                  {/* Prerequisites */}
                  {choice.prerequisites && choice.prerequisites.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-400 mb-2">
                        Prerequisites:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {choice.prerequisites.map((prereq, index) => (
                          <span 
                            key={index}
                            className="px-2 py-1 bg-gray-700 rounded text-xs text-gray-300"
                          >
                            {prereq}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Flavor Text */}
                  {choice.flavorText && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-sm text-gray-500 italic">
                        "{choice.flavorText}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 pt-6">
              <button 
                className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedChoice}
                onClick={() => {
                  if (selectedChoice) {
                    console.log('Choice submitted:', selectedChoice)
                    // Future: Submit choice and process turn
                  }
                }}
              >
                Submit Choice
              </button>
              <button 
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
                onClick={() => selectChoice(null)}
              >
                Clear Selection
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No Active Choices
            </h3>
            <p className="text-gray-500 mb-6">
              Choices will appear here when it's time to make evolutionary decisions
            </p>
            <button 
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              onClick={() => {
                console.log('Generate choices requested')
                // Future: Trigger choice generation
              }}
            >
              Generate Sample Choices
            </button>
          </div>
        )}
      </div>
    </div>
  )
}