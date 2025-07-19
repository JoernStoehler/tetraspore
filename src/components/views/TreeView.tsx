import { useGameStore } from '../../stores'

export function TreeView() {
  const { species } = useGameStore()

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
          Tree of Life
        </h1>
        
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="text-center text-gray-400 mb-4">
            <p className="text-lg">Evolution Visualization</p>
            <p className="text-sm">This view will show the evolutionary tree of your species</p>
          </div>

          {/* Species Count */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-400">{species.size}</div>
              <div className="text-sm text-gray-300">Total Species</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-400">
                {Array.from(species.values()).filter(s => !s.isExtinct).length}
              </div>
              <div className="text-sm text-gray-300">Active Species</div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-400">
                {Array.from(species.values()).filter(s => s.isExtinct).length}
              </div>
              <div className="text-sm text-gray-300">Extinct Species</div>
            </div>
          </div>

          {/* Species List */}
          {species.size > 0 ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Current Species</h3>
              {Array.from(species.values()).map((s) => (
                <div key={s.name} className="bg-gray-700 rounded-lg p-4 border-l-4 border-green-500">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-green-400">{s.name}</h4>
                      <p className="text-gray-300 text-sm mt-1">{s.description}</p>
                      {s.parentSpecies && (
                        <p className="text-gray-400 text-xs mt-2">
                          Evolved from: {s.parentSpecies}
                        </p>
                      )}
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      <div>Year {s.evolutionYear}</div>
                      {s.isExtinct && <div className="text-red-400 mt-1">Extinct</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No species created yet</p>
              <p className="text-sm mt-2">Start a new game to begin evolution</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}