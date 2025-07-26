import type { Meta, StoryObj } from '@storybook/react-vite';
import { PlanetSelectionView } from '../Views/PlanetSelectionView';

const meta: Meta<typeof PlanetSelectionView> = {
  title: 'Views/PlanetSelectionView',
  component: PlanetSelectionView,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onNavigateToMap: () => console.log('Navigate to map'),
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'Galaxy View',
};