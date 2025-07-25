import type { Meta, StoryObj } from '@storybook/react-vite';
import { CutscenePlayer } from './CutscenePlayer';

const meta = {
  title: 'Components/CutscenePlayer',
  component: CutscenePlayer,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A fullscreen cutscene player that displays synchronized images, animations, audio narration, and subtitles with playback controls.'
      }
    }
  },
  argTypes: {
    cutsceneId: {
      control: 'select',
      options: ['test-cutscene-1', 'animation-showcase'],
      description: 'ID of the cutscene to play'
    },
    autoplay: {
      control: 'boolean',
      description: 'Whether to start playing automatically'
    },
    allowSkip: {
      control: 'boolean',
      description: 'Whether to show the skip button'
    },
    allowReplay: {
      control: 'boolean',
      description: 'Whether to show the replay button'
    },
    onComplete: { action: 'completed' },
    onSkip: { action: 'skipped' }
  }
} satisfies Meta<typeof CutscenePlayer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BasicCutscene: Story = {
  args: {
    cutsceneId: 'test-cutscene-1',
    autoplay: true,
    allowSkip: true,
    allowReplay: true,
    onComplete: () => console.log('Cutscene completed'),
    onSkip: () => console.log('Cutscene skipped')
  },
  parameters: {
    docs: {
      description: {
        story: 'Basic cutscene with default settings. Shows a 2-shot cutscene with slow zoom and pan animations.'
      }
    }
  }
};

export const NoSkipAllowed: Story = {
  args: {
    ...BasicCutscene.args,
    allowSkip: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Cutscene with skip button disabled. User must watch the entire cutscene.'
      }
    }
  }
};

export const NoReplayAllowed: Story = {
  args: {
    ...BasicCutscene.args,
    allowReplay: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Cutscene with replay button disabled.'
      }
    }
  }
};

export const NoControls: Story = {
  args: {
    ...BasicCutscene.args,
    allowSkip: false,
    allowReplay: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Cutscene with no control buttons. Only pause/play is available.'
      }
    }
  }
};

export const ManualStart: Story = {
  args: {
    ...BasicCutscene.args,
    autoplay: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Cutscene that starts paused. User must click play to begin.'
      }
    }
  }
};

export const AllAnimationTypes: Story = {
  args: {
    ...BasicCutscene.args,
    cutsceneId: 'animation-showcase'
  },
  parameters: {
    docs: {
      description: {
        story: 'Showcase of all available animation types: slow_zoom, pan_left, pan_right, and fade.'
      }
    }
  }
};

export const ErrorState: Story = {
  args: {
    ...BasicCutscene.args,
    cutsceneId: 'non-existent-cutscene'
  },
  parameters: {
    docs: {
      description: {
        story: 'Error state when cutscene cannot be loaded. Shows fallback UI with continue button.'
      }
    }
  }
};

// Interactive story for testing keyboard shortcuts
export const KeyboardControls: Story = {
  args: {
    ...BasicCutscene.args
  },
  parameters: {
    docs: {
      description: {
        story: 'Test keyboard controls: Space (pause/play), Escape (skip), R (replay). Click on the story area first to focus it, then use keyboard shortcuts.'
      }
    }
  },
  render: (args) => (
    <div>
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        left: '20px', 
        zIndex: 10000, 
        background: 'rgba(0,0,0,0.8)', 
        color: 'white', 
        padding: '10px',
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <div><strong>Keyboard Shortcuts:</strong></div>
        <div>Space: Pause/Play</div>
        <div>Escape: Skip</div>
        <div>R: Replay</div>
      </div>
      <CutscenePlayer {...args} />
    </div>
  )
};

// Mobile viewport story
export const MobileView: Story = {
  args: {
    ...BasicCutscene.args
  },
  parameters: {
    viewport: {
      defaultViewport: 'iphone12'
    },
    docs: {
      description: {
        story: 'Cutscene optimized for mobile devices. Controls and subtitles are responsive.'
      }
    }
  }
};

// Tablet viewport story
export const TabletView: Story = {
  args: {
    ...BasicCutscene.args
  },
  parameters: {
    viewport: {
      defaultViewport: 'ipad'
    },
    docs: {
      description: {
        story: 'Cutscene on tablet-sized screens.'
      }
    }
  }
};

// Story with custom onSkip handler
export const CustomSkipHandler: Story = {
  args: {
    ...BasicCutscene.args,
    onSkip: () => {
      alert('Custom skip action triggered!');
      console.log('Custom skip handler called');
    }
  },
  parameters: {
    docs: {
      description: {
        story: 'Cutscene with custom skip handler that shows an alert.'
      }
    }
  }
};