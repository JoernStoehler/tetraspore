import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Galaxy3D } from './Galaxy3D';
import type { Planet } from '../types';

// Mock @react-three/fiber
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="canvas">{children}</div>,
  useFrame: vi.fn(),
  useThree: () => ({
    camera: {},
    gl: {},
    scene: {},
    viewport: { width: 800, height: 600 }
  })
}));

// Mock @react-three/drei
vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Stars: () => <div data-testid="stars" />,
  PerspectiveCamera: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="perspective-camera">{children}</div>
  ),
  Sphere: ({ children, ...props }: { children?: React.ReactNode; [key: string]: unknown }) => (
    <div data-testid={`sphere-${props['data-planet-id'] || 'default'}`}>{children}</div>
  ),
  Billboard: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="billboard">{children}</div>
  ),
  Points: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="points">{children}</div>
  ),
  PointMaterial: () => <div data-testid="point-material" />
}));

describe('Galaxy3D', () => {
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

  it('renders canvas element', () => {
    const { getByTestId } = render(
      <Galaxy3D
        planets={mockPlanets}
        onPlanetClick={vi.fn()}
        showMarkers={true}
      />
    );

    expect(getByTestId('canvas')).toBeInTheDocument();
  });

  it('renders orbit controls', () => {
    const { getAllByTestId } = render(
      <Galaxy3D
        planets={mockPlanets}
        onPlanetClick={vi.fn()}
        showMarkers={true}
      />
    );

    const controls = getAllByTestId('orbit-controls');
    expect(controls.length).toBeGreaterThan(0);
  });

  it('renders stars', () => {
    const { getAllByTestId } = render(
      <Galaxy3D
        planets={mockPlanets}
        onPlanetClick={vi.fn()}
        showMarkers={true}
      />
    );

    const stars = getAllByTestId('stars');
    expect(stars.length).toBeGreaterThan(0);
  });

  it('does not render planet markers when showMarkers is false', () => {
    const { container } = render(
      <Galaxy3D
        planets={mockPlanets}
        onPlanetClick={vi.fn()}
        showMarkers={false}
      />
    );

    const markers = container.querySelectorAll('[data-testid^="planet-marker-"]');
    expect(markers).toHaveLength(0);
  });

  it('applies correct camera settings', () => {
    const { getAllByTestId } = render(
      <Galaxy3D
        planets={mockPlanets}
        onPlanetClick={vi.fn()}
        showMarkers={true}
        autoRotate={true}
      />
    );

    const cameras = getAllByTestId('perspective-camera');
    expect(cameras.length).toBeGreaterThan(0);
  });
});