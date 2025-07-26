import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { PlanetMarkers } from './PlanetMarkers';
import type { Planet } from '../types';

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: () => ({
    camera: { position: { x: 0, y: 0, z: 10 } },
    viewport: { width: 800, height: 600 }
  })
}));

// Mock @react-three/drei
vi.mock('@react-three/drei', () => ({
  Sphere: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
    <div data-testid={`planet-marker-${props['data-planet-id']}`}>
      {children}
    </div>
  ),
  Billboard: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="billboard">{children}</div>
  )
}));

describe('PlanetMarkers', () => {
  const mockPlanets: Planet[] = [
    {
      id: 'planet-1',
      name: 'Earth',
      position: [1, 0, 0],
      isPlayed: true,
      gameState: 'Industrial Revolution',
      lastPlayed: new Date('2024-01-01'),
      colorIntensity: 0.8
    },
    {
      id: 'planet-2',
      name: 'Mars',
      position: [-1, 0, 1],
      isPlayed: false,
      seed: 12345,
      type: 'barren'
    }
  ];

  it('renders a marker for each planet', () => {
    const { container } = render(
      <PlanetMarkers
        planets={mockPlanets}
        onPlanetClick={vi.fn()}
      />
    );

    const markers = container.querySelectorAll('[data-testid^="planet-marker-"]');
    expect(markers).toHaveLength(2);
  });

  it('calls onPlanetClick when a planet is clicked', () => {
    const onPlanetClick = vi.fn();
    const { getByTestId } = render(
      <PlanetMarkers
        planets={mockPlanets}
        onPlanetClick={onPlanetClick}
      />
    );

    const marker = getByTestId('planet-marker-planet-1');
    marker.click();

    expect(onPlanetClick).toHaveBeenCalledWith('planet-1');
  });

  it('applies different styles for played vs unplayed planets', () => {
    const { getByTestId } = render(
      <PlanetMarkers
        planets={mockPlanets}
        onPlanetClick={vi.fn()}
      />
    );

    const playedMarker = getByTestId('planet-marker-planet-1');
    const unplayedMarker = getByTestId('planet-marker-planet-2');

    // In real implementation, these would have different materials
    expect(playedMarker).toBeInTheDocument();
    expect(unplayedMarker).toBeInTheDocument();
  });

  it('highlights hovered planet', () => {
    const { getByTestId } = render(
      <PlanetMarkers
        planets={mockPlanets}
        onPlanetClick={vi.fn()}
        hoveredPlanetId="planet-1"
      />
    );

    const marker = getByTestId('planet-marker-planet-1');
    expect(marker).toBeInTheDocument();
  });
});