import { type FC } from 'react';

interface PlanetSelectionViewProps {
  onNavigateToMap: () => void;
}

export const PlanetSelectionView: FC<PlanetSelectionViewProps> = ({
  onNavigateToMap
}) => {
  return (
    <div className="h-full bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Planet Selection</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-2 mb-4">
        {[1, 2, 3, 4, 5, 6].map((planet) => (
          <div
            key={planet}
            className="bg-white p-3 rounded shadow-sm hover:bg-gray-50 transition-colors cursor-pointer"
            onClick={onNavigateToMap}
          >
            <div className="w-full h-24 bg-gray-300 rounded mb-2 flex items-center justify-center">
              <span className="text-gray-600 text-sm">Planet {planet}</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              Planet {planet}
            </h3>
            <p className="text-gray-600 text-xs">
              Click to explore regions.
            </p>
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <p className="text-gray-600 text-sm">
          Select a planet to begin exploration. Each planet has unique regions and resources.
        </p>
      </div>
    </div>
  );
};