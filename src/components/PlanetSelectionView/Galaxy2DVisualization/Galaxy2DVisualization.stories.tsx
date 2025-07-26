import type { Meta, StoryObj } from '@storybook/react-vite';
import { Galaxy2DVisualization } from './Galaxy2DVisualization';
import { DEFAULT_GALAXY_PARAMS } from '../../../utils/densityWaveGalaxyGenerator';

const meta = {
  title: 'Views/PlanetSelection/Galaxy2DVisualization',
  component: Galaxy2DVisualization,
  parameters: {
    layout: 'centered',
    backgrounds: {
      default: 'dark',
    },
  },
  tags: ['autodocs'],
  argTypes: {
    width: { control: { type: 'range', min: 400, max: 1200, step: 50 } },
    height: { control: { type: 'range', min: 400, max: 1200, step: 50 } },
    showGrid: { control: 'boolean' },
    showLabels: { control: 'boolean' },
    projection: { 
      control: 'radio',
      options: ['top', 'side']
    }
  },
} satisfies Meta<typeof Galaxy2DVisualization>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    width: 800,
    height: 800,
    showGrid: true,
    showLabels: true,
    projection: 'top'
  },
};

export const SideView: Story = {
  args: {
    width: 800,
    height: 400,
    showGrid: true,
    showLabels: true,
    projection: 'side'
  },
};

export const HighDensity: Story = {
  args: {
    params: {
      numStars: 10000,
    },
    width: 800,
    height: 800,
    showGrid: false,
    showLabels: false,
  },
};

export const TightSpiral: Story = {
  args: {
    params: {
      numArms: 2,
      armTightness: 0.6,
      numStars: 3000,
    },
    width: 800,
    height: 800,
  },
};

export const LooseSpiral: Story = {
  args: {
    params: {
      numArms: 6,
      armTightness: 0.15,
      numStars: 3000,
    },
    width: 800,
    height: 800,
  },
};

export const LargeBulge: Story = {
  args: {
    params: {
      bulgeRadius: 0.6,
      bulgeIntensity: 1.5,
      numStars: 3000,
    },
    width: 800,
    height: 800,
  },
};

export const EllipticalGalaxy: Story = {
  name: 'Elliptical-like Galaxy',
  args: {
    params: {
      numArms: 0,
      bulgeRadius: 1.2,
      discRadius: 1.5,
      bulgeIntensity: 2.0,
      discIntensity: 0.3,
      numStars: 4000,
    },
    width: 800,
    height: 800,
  },
};

export const Interactive: Story = {
  name: 'Interactive Controls',
  args: {
    width: 800,
    height: 800,
    showGrid: true,
    showLabels: true,
  },
  render: (args) => {
    const [params, setParams] = useState(DEFAULT_GALAXY_PARAMS);
    
    return (
      <div style={{ display: 'flex', gap: '20px' }}>
        <div>
          <Galaxy2DVisualization {...args} params={params} />
        </div>
        <div style={{ 
          background: 'rgba(0,0,0,0.8)', 
          padding: '20px', 
          borderRadius: '8px',
          color: 'white',
          fontFamily: 'monospace',
          minWidth: '300px'
        }}>
          <h3>Galaxy Parameters</h3>
          
          <label style={{ display: 'block', marginBottom: '10px' }}>
            Stars: {params.numStars}
            <input 
              type="range" 
              min="100" 
              max="10000" 
              value={params.numStars}
              onChange={(e) => setParams({...params, numStars: Number(e.target.value)})}
              style={{ width: '100%' }}
            />
          </label>
          
          <label style={{ display: 'block', marginBottom: '10px' }}>
            Spiral Arms: {params.numArms}
            <input 
              type="range" 
              min="0" 
              max="8" 
              value={params.numArms}
              onChange={(e) => setParams({...params, numArms: Number(e.target.value)})}
              style={{ width: '100%' }}
            />
          </label>
          
          <label style={{ display: 'block', marginBottom: '10px' }}>
            Arm Tightness: {params.armTightness.toFixed(2)}
            <input 
              type="range" 
              min="0.1" 
              max="1.0" 
              step="0.05"
              value={params.armTightness}
              onChange={(e) => setParams({...params, armTightness: Number(e.target.value)})}
              style={{ width: '100%' }}
            />
          </label>
          
          <label style={{ display: 'block', marginBottom: '10px' }}>
            Bulge Radius: {params.bulgeRadius.toFixed(2)}
            <input 
              type="range" 
              min="0.1" 
              max="1.0" 
              step="0.05"
              value={params.bulgeRadius}
              onChange={(e) => setParams({...params, bulgeRadius: Number(e.target.value)})}
              style={{ width: '100%' }}
            />
          </label>
          
          <label style={{ display: 'block', marginBottom: '10px' }}>
            Disc Scale: {params.discScaleLength.toFixed(2)}
            <input 
              type="range" 
              min="0.1" 
              max="1.0" 
              step="0.05"
              value={params.discScaleLength}
              onChange={(e) => setParams({...params, discScaleLength: Number(e.target.value)})}
              style={{ width: '100%' }}
            />
          </label>
          
          <label style={{ display: 'block', marginBottom: '10px' }}>
            Thickness: {params.thickness.toFixed(2)}
            <input 
              type="range" 
              min="0.01" 
              max="0.5" 
              step="0.01"
              value={params.thickness}
              onChange={(e) => setParams({...params, thickness: Number(e.target.value)})}
              style={{ width: '100%' }}
            />
          </label>
          
          <button 
            onClick={() => setParams({...params, seed: Date.now()})}
            style={{ 
              marginTop: '20px',
              padding: '10px 20px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Regenerate Galaxy
          </button>
        </div>
      </div>
    );
  },
};

// Import useState for the Interactive story
import { useState } from 'react';