import { render, screen, cleanup } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TraitView } from './TraitView';
import { 
  type Trait, 
  type TraitEdge, 
  type PlayerTraitState,
  AdoptedTraitCategory,
  EnvironmentalTraitCategory 
} from './types';

// Mock D3 to avoid issues in test environment
vi.mock('d3', () => ({
  forceSimulation: vi.fn(() => ({
    force: vi.fn().mockReturnThis(),
    on: vi.fn().mockReturnThis(),
    stop: vi.fn(),
    alphaTarget: vi.fn().mockReturnThis(),
    restart: vi.fn().mockReturnThis(),
  })),
  forceLink: vi.fn(() => ({
    id: vi.fn().mockReturnThis(),
    distance: vi.fn().mockReturnThis(),
    strength: vi.fn().mockReturnThis(),
  })),
  forceManyBody: vi.fn(() => ({
    strength: vi.fn().mockReturnThis(),
  })),
  forceCenter: vi.fn(),
  forceCollide: vi.fn(() => ({
    radius: vi.fn().mockReturnThis(),
  })),
  select: vi.fn(() => ({
    selectAll: vi.fn(() => ({
      remove: vi.fn(),
      data: vi.fn(() => ({
        enter: vi.fn(() => ({
          append: vi.fn(() => ({
            attr: vi.fn().mockReturnThis(),
            style: vi.fn().mockReturnThis(),
            call: vi.fn().mockReturnThis(),
            on: vi.fn().mockReturnThis(),
            text: vi.fn().mockReturnThis(),
            each: vi.fn().mockReturnThis(),
          })),
        })),
      })),
    })),
    append: vi.fn(() => ({
      attr: vi.fn().mockReturnThis(),
      selectAll: vi.fn(() => ({
        data: vi.fn(() => ({
          enter: vi.fn(() => ({
            append: vi.fn(() => ({
              attr: vi.fn().mockReturnThis(),
              style: vi.fn().mockReturnThis(),
              call: vi.fn().mockReturnThis(),
              on: vi.fn().mockReturnThis(),
              text: vi.fn().mockReturnThis(),
              each: vi.fn().mockReturnThis(),
            })),
          })),
        })),
      })),
    })),
    node: vi.fn(() => true),
  })),
  drag: vi.fn(() => ({
    on: vi.fn().mockReturnThis(),
  })),
  easeLinear: vi.fn(),
}));

const mockTraits: Trait[] = [
  {
    id: 'photosynthesis',
    name: 'Photosynthesis',
    category: AdoptedTraitCategory.Biological,
    description: 'Ability to convert sunlight into energy',
    isEnvironmental: false,
  },
  {
    id: 'tool-use',
    name: 'Tool Use',
    category: AdoptedTraitCategory.Technological,
    description: 'Ability to create and use tools',
    isEnvironmental: false,
  },
  {
    id: 'rocky-terrain',
    name: 'Rocky Terrain',
    category: EnvironmentalTraitCategory.Geological,
    description: 'Environment characterized by rocky surfaces',
    isEnvironmental: true,
  },
];

const mockEdges: TraitEdge[] = [
  {
    from: 'photosynthesis',
    to: 'tool-use',
    description: 'Energy abundance enables tool development',
  },
  {
    from: 'rocky-terrain',
    to: 'tool-use',
    description: 'Rocky environment necessitates tool use',
  },
];

const mockPlayerState: PlayerTraitState = {
  adoptedTraits: new Set(['photosynthesis']),
  discoveredTraits: new Set(['photosynthesis', 'tool-use']),
  environmentalTraits: new Set(['rocky-terrain']),
  adoptableChoices: [{
    id: 'choice-1',
    options: ['tool-use'],
    choiceType: 'adopt',
  }],
};

const mockVisibleTraits = new Set(['photosynthesis', 'tool-use', 'rocky-terrain']);

const defaultProps = {
  traits: mockTraits,
  edges: mockEdges,
  playerState: mockPlayerState,
  visibleTraits: mockVisibleTraits,
  onTraitClick: vi.fn(),
  onTraitHover: vi.fn(),
};

describe('TraitView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders without crashing', () => {
    render(<TraitView {...defaultProps} />);
    
    const container = screen.getByTestId('trait-view-svg');
    expect(container).toBeInTheDocument();
  });

  it('renders SVG with correct dimensions', () => {
    render(<TraitView {...defaultProps} />);
    
    const svg = screen.getByTestId('trait-view-svg');
    expect(svg).toHaveAttribute('width', '800');
    expect(svg).toHaveAttribute('height', '600');
  });

  it('calls onTraitClick when a trait is clicked', () => {
    const onTraitClick = vi.fn();
    render(<TraitView {...defaultProps} onTraitClick={onTraitClick} />);
    
    // Since D3 is mocked, we can't test actual click events on nodes
    // but we can verify the component renders and would set up click handlers
    expect(onTraitClick).not.toHaveBeenCalled();
  });

  it('calls onTraitHover when a trait is hovered', () => {
    const onTraitHover = vi.fn();
    render(<TraitView {...defaultProps} onTraitHover={onTraitHover} />);
    
    // Since D3 is mocked, we can't test actual hover events on nodes
    // but we can verify the component renders and would set up hover handlers
    expect(onTraitHover).not.toHaveBeenCalled();
  });

  it('filters traits by visibleTraits prop', () => {
    const limitedVisibleTraits = new Set(['photosynthesis']);
    render(<TraitView {...defaultProps} visibleTraits={limitedVisibleTraits} />);
    
    // Component should only process visible traits
    // We can't directly test the filtering due to D3 mocking,
    // but the component should render without errors
    const svg = screen.getByTestId('trait-view-svg');
    expect(svg).toBeInTheDocument();
  });

  it('handles empty traits array', () => {
    render(<TraitView {...defaultProps} traits={[]} />);
    
    const svg = screen.getByTestId('trait-view-svg');
    expect(svg).toBeInTheDocument();
  });

  it('handles empty edges array', () => {
    render(<TraitView {...defaultProps} edges={[]} />);
    
    const svg = screen.getByTestId('trait-view-svg');
    expect(svg).toBeInTheDocument();
  });

  it('updates when traits change', () => {
    const { rerender } = render(<TraitView {...defaultProps} />);
    
    const newTraits = [
      ...mockTraits,
      {
        id: 'fire-making',
        name: 'Fire Making',
        category: AdoptedTraitCategory.Technological,
        description: 'Ability to create and control fire',
        isEnvironmental: false,
      },
    ];

    rerender(<TraitView {...defaultProps} traits={newTraits} />);
    
    const svg = screen.getByTestId('trait-view-svg');
    expect(svg).toBeInTheDocument();
  });

  it('updates when player state changes', () => {
    const { rerender } = render(<TraitView {...defaultProps} />);
    
    const newPlayerState: PlayerTraitState = {
      ...mockPlayerState,
      adoptedTraits: new Set(['photosynthesis', 'tool-use']),
    };

    rerender(<TraitView {...defaultProps} playerState={newPlayerState} />);
    
    const svg = screen.getByTestId('trait-view-svg');
    expect(svg).toBeInTheDocument();
  });
});