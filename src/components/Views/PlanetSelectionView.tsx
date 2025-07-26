import { type FC, useState, useMemo } from 'react';
import { Galaxy3D } from '../PlanetSelectionView/Galaxy3D';
import { PlanetPreview } from '../PlanetSelectionView/PlanetPreview';
import type { Planet } from '../PlanetSelectionView/types';

interface PlanetSelectionViewProps {
  onNavigateToMap: () => void;
}

// Mock data for development
const generateMockPlanets = (): Planet[] => {
  const played: Planet[] = [
    {
      id: 'earth-save',
      name: 'Terra Prime',
      position: [2, 0.1, -1],
      isPlayed: true,
      gameState: 'Dawn of the Flufficons',
      lastPlayed: new Date('2024-01-20'),
      colorIntensity: 0.9
    },
    {
      id: 'kepler-save',
      name: 'Kepler Haven',
      position: [-1.5, -0.1, 2],
      isPlayed: true,
      gameState: 'Gunpowder Wars',
      lastPlayed: new Date('2024-01-15'),
      colorIntensity: 0.7
    },
    {
      id: 'alpha-save',
      name: 'Alpha Centauri',
      position: [0.5, 0.2, -2.5],
      isPlayed: true,
      gameState: 'Space Age Begins',
      lastPlayed: new Date('2024-01-10'),
      colorIntensity: 0.5
    }
  ];
  
  const pregenerated: Planet[] = [
    {
      id: 'pregen-1',
      name: 'Unnamed World',
      position: [3, -0.1, 1],
      isPlayed: false,
      seed: 42,
      type: 'lush'
    },
    {
      id: 'pregen-2',
      name: 'Unnamed World',
      position: [-2.5, 0.1, -1.5],
      isPlayed: false,
      seed: 123,
      type: 'oceanic'
    },
    {
      id: 'pregen-3',
      name: 'Unnamed World',
      position: [1.5, -0.2, 3],
      isPlayed: false,
      seed: 456,
      type: 'volcanic'
    },
    {
      id: 'pregen-4',
      name: 'Unnamed World',
      position: [-0.5, 0.15, -3],
      isPlayed: false,
      seed: 789,
      type: 'barren'
    },
    {
      id: 'pregen-5',
      name: 'Unnamed World',
      position: [2.5, 0, 2.5],
      isPlayed: false,
      seed: 101,
      type: 'lush'
    },
    {
      id: 'pregen-6',
      name: 'Unnamed World',
      position: [-3, -0.15, 0.5],
      isPlayed: false,
      seed: 202,
      type: 'oceanic'
    }
  ];
  
  return [...played, ...pregenerated];
};

export const PlanetSelectionView: FC<PlanetSelectionViewProps> = ({
  onNavigateToMap
}) => {
  const planets = useMemo(() => generateMockPlanets(), []);
  const [hoveredPlanetId, setHoveredPlanetId] = useState<string | null>(null);
  const [showMarkers, setShowMarkers] = useState(true);
  const [autoRotate, setAutoRotate] = useState(true);
  
  const hoveredPlanet = hoveredPlanetId 
    ? planets.find(p => p.id === hoveredPlanetId) 
    : null;
  
  const handlePlanetSelect = (planetId: string) => {
    // In real implementation, this would save the selected planet
    // and navigate to the planet customization or game view
    console.log('Selected planet:', planetId);
    onNavigateToMap();
  };
  
  return (
    <div className="h-full bg-black relative">
      <Galaxy3D
        planets={planets}
        onPlanetClick={handlePlanetSelect}
        onPlanetHover={setHoveredPlanetId}
        hoveredPlanetId={hoveredPlanetId}
        showMarkers={showMarkers}
        autoRotate={autoRotate}
      />
      
      {/* Controls */}
      <div className="absolute top-4 right-4 bg-gray-900 bg-opacity-80 p-4 rounded-lg">
        <h2 className="text-white text-lg font-bold mb-2">Galaxy View</h2>
        <div className="space-y-2">
          <label className="flex items-center text-white text-sm">
            <input
              type="checkbox"
              checked={showMarkers}
              onChange={(e) => setShowMarkers(e.target.checked)}
              className="mr-2"
            />
            Show planet markers
          </label>
          <label className="flex items-center text-white text-sm">
            <input
              type="checkbox"
              checked={autoRotate}
              onChange={(e) => setAutoRotate(e.target.checked)}
              className="mr-2"
            />
            Auto-rotate galaxy
          </label>
        </div>
      </div>
      
      {/* Planet preview on hover */}
      {hoveredPlanet && (
        <PlanetPreview planet={hoveredPlanet} />
      )}
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-white text-sm bg-gray-900 bg-opacity-80 p-3 rounded">
        <p>Click and drag to rotate • Scroll to zoom • Click a planet to select</p>
      </div>
    </div>
  );
};