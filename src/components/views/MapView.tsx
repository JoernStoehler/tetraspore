import { useGameStore, useUIStore } from '../../stores'

export function MapView() {
  const { regions, features } = useGameStore()
  const { selectedRegion, selectRegion } = useUIStore()

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Region Map
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Area */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 h-96">
              <div className="text-center text-gray-400 h-full flex flex-col justify-center">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-lg">Interactive Map</p>
                <p className="text-sm">This view will show a visual map of all regions</p>
                <p className="text-xs mt-2 text-gray-500">
                  Future: 3D globe with spherical Voronoi regions
                </p>
              </div>
            </div>
          </div>

          {/* Region List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-200">Regions ({regions.size})</h3>
            
            {regions.size > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Array.from(regions.values()).map((region) => (
                  <div 
                    key={region.name}
                    className={`
                      bg-gray-700 rounded-lg p-3 cursor-pointer transition-colors border-l-4
                      ${selectedRegion === region.name 
                        ? 'border-purple-500 bg-gray-600' 
                        : 'border-gray-600 hover:bg-gray-600'
                      }
                    `}
                    onClick={() => selectRegion(
                      selectedRegion === region.name ? null : region.name
                    )}
                  >
                    <h4 className="font-medium text-purple-400">{region.name}</h4>
                    <p className="text-gray-300 text-sm mt-1">{region.description}</p>
                    
                    {/* Region Stats */}
                    <div className="mt-2 text-xs text-gray-400">
                      <div>Species: {region.currentSpecies.size}</div>
                      <div>Features: {region.features.size}</div>
                      <div>
                        Location: {region.center.lat.toFixed(1)}°, {region.center.lon.toFixed(1)}°
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No regions created yet</p>
                <p className="text-sm mt-2">Start a new game to generate regions</p>
              </div>
            )}
          </div>
        </div>

        {/* Selected Region Details */}
        {selectedRegion && (
          <div className="mt-6">
            {(() => {
              const region = regions.get(selectedRegion)
              if (!region) return null

              return (
                <div className="bg-gray-800 rounded-lg p-6 border border-purple-500">
                  <h3 className="text-xl font-semibold text-purple-400 mb-4">
                    {region.name} Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Species in Region */}
                    <div>
                      <h4 className="font-medium text-gray-200 mb-2">
                        Species ({region.currentSpecies.size})
                      </h4>
                      {region.currentSpecies.size > 0 ? (
                        <div className="space-y-1">
                          {Array.from(region.currentSpecies).map(speciesName => (
                            <div key={speciesName} className="text-sm text-green-400">
                              • {speciesName}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No species present</p>
                      )}
                    </div>

                    {/* Features in Region */}
                    <div>
                      <h4 className="font-medium text-gray-200 mb-2">
                        Features ({region.features.size})
                      </h4>
                      {region.features.size > 0 ? (
                        <div className="space-y-1">
                          {Array.from(region.features).map(featureName => {
                            const feature = features.get(featureName)
                            return (
                              <div key={featureName} className="text-sm">
                                <span className="text-yellow-400">• {featureName}</span>
                                {feature && (
                                  <span className="text-gray-400 ml-2">
                                    ({feature.category})
                                  </span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No special features</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}