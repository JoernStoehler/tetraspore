import type { Meta, StoryObj } from '@storybook/react-vite';
import { TreeOfLife } from './TreeOfLife';
import { basicTree, complexTree, extinctionEvent, turn8To10Replay } from '../../test-data';

const meta = {
  title: 'Game/TreeOfLife',
  component: TreeOfLife,
  parameters: {
    layout: 'fullscreen',
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#0f1419' },
        { name: 'light', value: '#ffffff' },
      ],
    },
  },
  argTypes: {
    width: {
      control: { type: 'range', min: 400, max: 1200, step: 50 },
    },
    height: {
      control: { type: 'range', min: 300, max: 800, step: 50 },
    },
    onNodeClick: { action: 'node clicked' },
  },
  args: {
    width: 800,
    height: 600,
  },
} satisfies Meta<typeof TreeOfLife>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicTree: Story = {
  args: {
    nodes: basicTree,
  },
  parameters: {
    docs: {
      description: {
        story: 'A simple evolutionary tree with 3-5 species showing basic branching.',
      },
    },
  },
};

export const ComplexTree: Story = {
  args: {
    nodes: complexTree,
  },
  parameters: {
    docs: {
      description: {
        story: 'A complex evolutionary tree with 20+ species across 10 turns, showing various evolutionary patterns.',
      },
    },
  },
};

export const EmptyTree: Story = {
  args: {
    nodes: [],
  },
  parameters: {
    docs: {
      description: {
        story: 'An empty tree showing the initial state before any species evolution.',
      },
    },
  },
};

export const ExtinctionEvent: Story = {
  args: {
    nodes: extinctionEvent,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows a mass extinction event at turn 5 where most species go extinct.',
      },
    },
  },
};

export const ReplayTurns8to10: Story = {
  args: {
    nodes: turn8To10Replay,
  },
  parameters: {
    docs: {
      description: {
        story: 'Simulates a player returning after missing turns 8-10, showing what happened during their absence.',
      },
    },
  },
};

export const SmallViewport: Story = {
  args: {
    nodes: complexTree,
    width: 400,
    height: 300,
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests the tree visualization in a constrained viewport.',
      },
    },
  },
};

export const LargeViewport: Story = {
  args: {
    nodes: complexTree,
    width: 1200,
    height: 800,
  },
  parameters: {
    docs: {
      description: {
        story: 'Tests the tree visualization in a large viewport.',
      },
    },
  },
};

export const InteractiveTree: Story = {
  args: {
    nodes: complexTree,
    onNodeClick: (node) => {
      console.log('Clicked node:', node);
      alert(`Clicked: ${node.name} (Turn ${node.turn})`);
    },
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates interactive node clicking with feedback.',
      },
    },
  },
};