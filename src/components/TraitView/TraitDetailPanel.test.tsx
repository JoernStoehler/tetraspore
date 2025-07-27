import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { TraitDetailPanel } from './TraitDetailPanel';
import { type Trait, AdoptedTraitCategory, EnvironmentalTraitCategory } from './types';

const mockTrait: Trait = {
  id: 'photosynthesis',
  name: 'Photosynthesis',
  category: AdoptedTraitCategory.Biological,
  description: 'Ability to convert sunlight into energy through specialized organelles',
  isEnvironmental: false,
};

const mockEnvironmentalTrait: Trait = {
  id: 'rocky-terrain',
  name: 'Rocky Terrain',
  category: EnvironmentalTraitCategory.Geological,
  description: 'Environment characterized by rocky surfaces and mineral deposits',
  isEnvironmental: true,
};

const mockConnectedTraits = [
  {
    trait: {
      id: 'chloroplasts',
      name: 'Chloroplasts',
      category: AdoptedTraitCategory.Biological,
      description: 'Specialized organelles for photosynthesis',
      isEnvironmental: false,
    },
    relationship: 'Photosynthesis leads to specialized organelles',
  },
  {
    trait: {
      id: 'tool-use',
      name: 'Tool Use',
      category: AdoptedTraitCategory.Technological,
      description: 'Ability to create and use tools',
      isEnvironmental: false,
    },
    relationship: 'Energy abundance enables tool development',
  },
];

const defaultProps = {
  trait: mockTrait,
  state: 'adopted' as const,
  connectedTraits: mockConnectedTraits,
  onClose: vi.fn(),
  visible: true,
};

describe('TraitDetailPanel', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders when visible', () => {
    render(<TraitDetailPanel {...defaultProps} />);

    const panel = screen.getByTestId('trait-detail-panel');
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveTextContent('Photosynthesis');
    expect(panel).toHaveTextContent('Successfully integrated into your species');
    expect(panel).toHaveTextContent('biological (Species)');
    expect(panel).toHaveTextContent('Ability to convert sunlight into energy through specialized organelles');
  });

  it('does not render when not visible', () => {
    render(<TraitDetailPanel {...defaultProps} visible={false} />);

    const panel = screen.queryByTestId('trait-detail-panel');
    expect(panel).not.toBeInTheDocument();
  });

  it('does not render when trait is null', () => {
    render(<TraitDetailPanel {...defaultProps} trait={null} />);

    const panel = screen.queryByTestId('trait-detail-panel');
    expect(panel).not.toBeInTheDocument();
  });

  it('does not render when state is null', () => {
    render(<TraitDetailPanel {...defaultProps} state={null} />);

    const panel = screen.queryByTestId('trait-detail-panel');
    expect(panel).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(<TraitDetailPanel {...defaultProps} onClose={onClose} />);

    const closeButton = screen.getByTestId('close-detail-panel');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('displays environmental trait correctly', () => {
    render(
      <TraitDetailPanel 
        {...defaultProps} 
        trait={mockEnvironmentalTrait}
        state="environmental"
        connectedTraits={[]}
      />
    );

    expect(screen.getByText('Rocky Terrain')).toBeInTheDocument();
    expect(screen.getByText('geological (Environmental)')).toBeInTheDocument();
    expect(screen.getByText('Present in your environment')).toBeInTheDocument();
  });

  it('displays connected traits', () => {
    render(<TraitDetailPanel {...defaultProps} />);

    expect(screen.getByText('Connected Traits')).toBeInTheDocument();
    expect(screen.getByText('Chloroplasts')).toBeInTheDocument();
    expect(screen.getByText('Photosynthesis leads to specialized organelles')).toBeInTheDocument();
    expect(screen.getByText('Tool Use')).toBeInTheDocument();
    expect(screen.getByText('Energy abundance enables tool development')).toBeInTheDocument();
  });

  it('does not show connected traits section when empty', () => {
    render(<TraitDetailPanel {...defaultProps} connectedTraits={[]} />);

    expect(screen.queryByText('Connected Traits')).not.toBeInTheDocument();
  });

  it('shows special message for discovered but not adoptable traits', () => {
    render(<TraitDetailPanel {...defaultProps} state="discovered" />);

    expect(screen.getByText('Discovered but not yet adoptable')).toBeInTheDocument();
    expect(screen.getByText(/Why not adoptable:/)).toBeInTheDocument();
    expect(screen.getByText(/requires specific conditions/)).toBeInTheDocument();
  });

  it('shows correct state descriptions for all states', () => {
    const states = [
      { state: 'not-discovered' as const, text: 'Not yet discovered by your species' },
      { state: 'discovered' as const, text: 'Discovered but not yet adoptable' },
      { state: 'adoptable' as const, text: 'Available for adoption through choice' },
      { state: 'adopted' as const, text: 'Successfully integrated into your species' },
      { state: 'losable' as const, text: 'Adopted trait that can be lost through choice' },
      { state: 'environmental' as const, text: 'Present in your environment' },
    ];

    states.forEach(({ state, text }) => {
      const { unmount } = render(
        <TraitDetailPanel {...defaultProps} state={state} connectedTraits={[]} />
      );
      expect(screen.getByText(text)).toBeInTheDocument();
      unmount();
    });
  });

  it('positions panel correctly', () => {
    render(<TraitDetailPanel {...defaultProps} />);

    const panel = screen.getByTestId('trait-detail-panel');
    expect(panel).toHaveStyle({
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '320px',
    });
  });
});