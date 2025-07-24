import { type FC, useState } from 'react';

interface Region {
  id: string;
  name: string;
  type: string;
  description: string;
}

export const MapView: FC = () => {
  const [is3D, setIs3D] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  const regions: Region[] = [
    {
      id: 'region-1',
      name: 'Northern Highlands',
      type: 'Mountain',
      description: 'Rocky terrain with mineral deposits and harsh weather conditions.'
    },
    {
      id: 'region-2',
      name: 'Central Plains',
      type: 'Grassland',
      description: 'Fertile lands suitable for agriculture and settlements.'
    },
    {
      id: 'region-3',
      name: 'Eastern Forest',
      type: 'Forest',
      description: 'Dense woodland with abundant resources and wildlife.'
    },
    {
      id: 'region-4',
      name: 'Southern Desert',
      type: 'Desert',
      description: 'Arid landscape with rare materials and extreme temperatures.'
    }
  ];

  const handleRegionClick = (region: Region) => {
    setSelectedRegion(region);
  };

  return (
    <div className="h-full bg-gray-100 flex">
      {/* Map Area */}
      <div className="flex-1 p-2">
        <div className="mb-2 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Planet Map</h1>
          <button
            onClick={() => setIs3D(!is3D)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
          >
            Switch to {is3D ? '2D' : '3D'} View
          </button>
        </div>
        
        <div className="bg-white rounded shadow-sm h-full flex items-center justify-center" style={{height: 'calc(100% - 3rem)'}}>
          <div className="text-center">
            <div className="text-6xl mb-4">{is3D ? '🌍' : '🗺️'}</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {is3D ? '3D Planet View' : '2D Map View'}
            </h3>
            <p className="text-gray-600 mb-4">
              Click on regions to explore details
            </p>
            
            {/* Region Buttons */}
            <div className="grid grid-cols-2 gap-2 max-w-sm mx-auto">
              {regions.map((region) => (
                <button
                  key={region.id}
                  onClick={() => handleRegionClick(region)}
                  className={`px-3 py-2 rounded transition-colors ${
                    selectedRegion?.id === region.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {region.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Region Details Panel */}
      <div className="w-1/4 min-w-72 bg-white border-l border-gray-300 p-3">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Region Details</h2>
        
        {selectedRegion ? (
          <div>
            <h3 className="text-base font-semibold text-gray-800 mb-1">
              {selectedRegion.name}
            </h3>
            <div className="mb-2">
              <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                {selectedRegion.type}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-3">{selectedRegion.description}</p>
            
            <div className="space-y-1">
              <h4 className="font-semibold text-gray-800 text-sm">Quick Actions:</h4>
              <button className="w-full px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-xs">
                Explore Region
              </button>
              <button className="w-full px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-xs">
                View Resources
              </button>
              <button className="w-full px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors text-xs">
                Establish Base
              </button>
            </div>
            
            {/* Navigation between regions */}
            <div className="mt-4">
              <h4 className="font-semibold text-gray-800 mb-1 text-sm">Navigate to:</h4>
              <div className="space-y-1">
                {regions
                  .filter(region => region.id !== selectedRegion.id)
                  .map((region) => (
                    <button
                      key={region.id}
                      onClick={() => handleRegionClick(region)}
                      className="w-full text-left px-2 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors text-xs"
                    >
                      {region.name}
                    </button>
                  ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500">
            <div className="text-3xl mb-2">🗺️</div>
            <p className="text-sm">Select a region on the map to view details and available actions.</p>
          </div>
        )}
      </div>
    </div>
  );
};