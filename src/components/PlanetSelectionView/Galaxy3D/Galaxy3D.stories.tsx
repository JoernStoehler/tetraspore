import type { Meta, StoryObj } from '@storybook/react-vite';
import { Galaxy3D } from './Galaxy3D';
import type { Planet } from '../types';

const meta: Meta<typeof Galaxy3D> = {
  title: 'Components/Galaxy3D',
  component: Galaxy3D,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh', backgroundColor: '#000' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const mockPlanets: Planet[] = [
  {
    id: 'earth-save',
    name: 'Terra Prime',
    position: [2, 0.1, -1],
    isPlayed: true,
    gameState: 'Dawn of the Flufficons',
    lastPlayed: new Date('2024-01-20'),
    colorIntensity: 0.9,
  },
  {
    id: 'kepler-save',
    name: 'Kepler Haven',
    position: [-1.5, -0.1, 2],
    isPlayed: true,
    gameState: 'Gunpowder Wars',
    lastPlayed: new Date('2024-01-15'),
    colorIntensity: 0.7,
  },
  {
    id: 'pregen-1',
    name: 'Unnamed World',
    position: [3, -0.1, 1],
    isPlayed: false,
    seed: 42,
    type: 'lush',
  },
  {
    id: 'pregen-2',
    name: 'Unnamed World',
    position: [-2.5, 0.1, -1.5],
    isPlayed: false,
    seed: 123,
    type: 'oceanic',
  },
];

export const Default: Story = {
  args: {
    planets: mockPlanets,
    onPlanetClick: (planetId) => console.log('Planet clicked:', planetId),
    showMarkers: true,
    autoRotate: true,
  },
};

export const NoMarkers: Story = {
  args: {
    ...Default.args,
    showMarkers: false,
  },
};

export const NoRotation: Story = {
  args: {
    ...Default.args,
    autoRotate: false,
  },
};

export const WithHoveredPlanet: Story = {
  args: {
    ...Default.args,
    hoveredPlanetId: 'earth-save',
    onPlanetHover: (planetId) => console.log('Planet hovered:', planetId),
  },
};

export const OnlyPlayedPlanets: Story = {
  args: {
    ...Default.args,
    planets: mockPlanets.filter(p => p.isPlayed),
  },
};

export const OnlyPregeneratedPlanets: Story = {
  args: {
    ...Default.args,
    planets: mockPlanets.filter(p => !p.isPlayed),
  },
};