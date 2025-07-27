import { type FC } from 'react';
import type { Planet } from '../types';

interface PlanetPreviewProps {
  planet: Planet;
}

export const PlanetPreview: FC<PlanetPreviewProps> = ({ planet }) => {
  const formatDate = (date: Date) => {
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  };
  
  const getPlanetIcon = (type?: string) => {
    switch (type) {
      case 'lush': return '🌿';
      case 'oceanic': return '🌊';
      case 'volcanic': return '🌋';
      case 'barren': return '🪨';
      default: return '🌍';
    }
  };
  
  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                    bg-gray-900 bg-opacity-90 p-6 rounded-lg border border-gray-700
                    min-w-[300px] pointer-events-none">
      <div className="flex items-center mb-3">
        <div className="text-5xl mr-4">
          {planet.isPlayed ? '🌍' : getPlanetIcon(planet.type)}
        </div>
        <div className="flex-1">
          <h3 className="text-white text-xl font-bold">
            {planet.name}
          </h3>
          {planet.isPlayed ? (
            <p className="text-blue-300 text-sm">
              {planet.gameState}
            </p>
          ) : (
            <p className="text-gray-400 text-sm">
              {planet.type ? planet.type.charAt(0).toUpperCase() + planet.type.slice(1) : 'Unknown'} world
            </p>
          )}
        </div>
      </div>
      
      {planet.isPlayed && planet.lastPlayed && (
        <div className="text-gray-300 text-sm">
          Last played {formatDate(planet.lastPlayed)}
        </div>
      )}
      
      {!planet.isPlayed && (
        <div className="text-gray-400 text-sm">
          Click to customize and start a new game
        </div>
      )}
    </div>
  );
};