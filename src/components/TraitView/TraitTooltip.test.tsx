import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import { TraitTooltip, EdgeTooltip } from './TraitTooltip';
import { type Trait, type TraitEdge, AdoptedTraitCategory, EnvironmentalTraitCategory } from './types';

const mockTrait: Trait = {
  id: 'photosynthesis',
  name: 'Photosynthesis',
  category: AdoptedTraitCategory.Biological,
  description: 'Ability to convert sunlight into energy',
  isEnvironmental: false,
};

const mockEnvironmentalTrait: Trait = {
  id: 'rocky-terrain',
  name: 'Rocky Terrain',
  category: EnvironmentalTraitCategory.Geological,
  description: 'Environment characterized by rocky surfaces',
  isEnvironmental: true,
};

const mockEdge: TraitEdge = {
  from: 'photosynthesis',
  to: 'tool-use',
  description: 'Energy abundance enables tool development',
};

describe('TraitTooltip', () => {
  afterEach(() => {
    cleanup();
  });
  it('renders trait tooltip when visible', () => {
    render(
      <TraitTooltip
        trait={mockTrait}
        state="adopted"
        x={100}
        y={100}
        visible={true}
      />
    );

    const tooltip = screen.getByTestId('trait-tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Photosynthesis');
    expect(tooltip).toHaveTextContent('biological');
    expect(tooltip).toHaveTextContent('Ability to convert sunlight into energy');
  });

  it('does not render when not visible', () => {
    render(
      <TraitTooltip
        trait={mockTrait}
        state="adopted"
        x={100}
        y={100}
        visible={false}
      />
    );

    const tooltip = screen.queryByTestId('trait-tooltip');
    expect(tooltip).not.toBeInTheDocument();
  });

  it('does not render for not-discovered traits', () => {
    render(
      <TraitTooltip
        trait={mockTrait}
        state="not-discovered"
        x={100}
        y={100}
        visible={true}
      />
    );

    const tooltip = screen.queryByTestId('trait-tooltip');
    expect(tooltip).not.toBeInTheDocument();
  });

  it('displays environmental trait correctly', () => {
    render(
      <TraitTooltip
        trait={mockEnvironmentalTrait}
        state="environmental"
        x={100}
        y={100}
        visible={true}
      />
    );

    const tooltip = screen.getByTestId('trait-tooltip');
    expect(tooltip).toHaveTextContent('Rocky Terrain');
    expect(tooltip).toHaveTextContent('geological (Environmental)');
    expect(tooltip).toHaveTextContent('Environment characterized by rocky surfaces');
  });

  it('positions tooltip correctly', () => {
    render(
      <TraitTooltip
        trait={mockTrait}
        state="adopted"
        x={150}
        y={200}
        visible={true}
      />
    );

    const tooltip = screen.getByTestId('trait-tooltip');
    expect(tooltip).toHaveStyle({
      left: '160px', // x + 10
      top: '190px',  // y - 10
    });
  });
});

describe('EdgeTooltip', () => {
  afterEach(() => {
    cleanup();
  });
  it('renders edge tooltip when visible', () => {
    render(
      <EdgeTooltip
        edge={mockEdge}
        x={100}
        y={100}
        visible={true}
      />
    );

    const tooltip = screen.getByTestId('edge-tooltip');
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent('Energy abundance enables tool development');
  });

  it('does not render when not visible', () => {
    render(
      <EdgeTooltip
        edge={mockEdge}
        x={100}
        y={100}
        visible={false}
      />
    );

    const tooltip = screen.queryByTestId('edge-tooltip');
    expect(tooltip).not.toBeInTheDocument();
  });

  it('positions tooltip correctly', () => {
    render(
      <EdgeTooltip
        edge={mockEdge}
        x={75}
        y={125}
        visible={true}
      />
    );

    const tooltip = screen.getByTestId('edge-tooltip');
    expect(tooltip).toHaveStyle({
      left: '85px',  // x + 10
      top: '115px',  // y - 10
    });
  });
});