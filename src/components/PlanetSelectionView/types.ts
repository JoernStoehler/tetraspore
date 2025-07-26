export interface Planet {
  id: string;
  name: string;
  position: [number, number, number];
  isPlayed: boolean;
  // For played planets
  gameState?: string; // e.g., "Landfall of the Flufficons"
  lastPlayed?: Date;
  colorIntensity?: number; // 0-1, affects surrounding color
  // For pregenerated planets
  seed?: number;
  type?: 'barren' | 'lush' | 'oceanic' | 'volcanic';
}

export interface GalaxyState {
  planets: Planet[];
  hoveredPlanetId: string | null;
  cameraRotation: number;
  autoRotate: boolean;
  showMarkers: boolean;
}

export interface PlanetSelectionViewProps {
  planets: Planet[];
  onPlanetSelect: (planetId: string) => void;
  onPlanetHover?: (planetId: string | null) => void;
}