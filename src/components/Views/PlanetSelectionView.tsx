import { type FC } from 'react';

interface PlanetSelectionViewProps {
  onNavigateToMap: () => void;
}

export const PlanetSelectionView: FC<PlanetSelectionViewProps> = ({
  onNavigateToMap
}) => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Planet Selection</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((planet) => (
            <div
              key={planet}
              className="bg-white p-6 rounded-lg shadow-md border-2 border-gray-300 hover:border-blue-500 transition-colors cursor-pointer"
              onClick={onNavigateToMap}
            >
              <div className="w-full h-32 bg-gray-300 rounded mb-4 flex items-center justify-center">
                <span className="text-gray-600">Planet {planet}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Planet {planet}
              </h3>
              <p className="text-gray-600 text-sm">
                Click to explore this planet's map and regions.
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Select a planet to begin exploration. Each planet has unique regions and resources.
          </p>
        </div>
      </div>
    </div>
  );
};