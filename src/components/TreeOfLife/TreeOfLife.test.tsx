import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TreeOfLife } from './TreeOfLife';
import { TreeNode } from './types';

const sampleNodes: TreeNode[] = [
  {
    id: 'root',
    name: 'Primordial Cell',
    parentId: null,
    turn: 1,
    nodeType: 'birth',
    speciesId: 'species-1'
  },
  {
    id: 'child1',
    name: 'Marine Algae',
    parentId: 'root',
    turn: 2,
    nodeType: 'birth',
    speciesId: 'species-2'
  },
  {
    id: 'child2',
    name: 'Land Fungi',
    parentId: 'root',
    turn: 2,
    nodeType: 'birth',
    speciesId: 'species-3'
  },
  {
    id: 'grandchild1',
    name: 'Complex Multicellular',
    parentId: 'child1',
    turn: 3,
    nodeType: 'birth',
    speciesId: 'species-4'
  }
];

describe('TreeOfLife', () => {
  it('renders without crashing', () => {
    render(
      <TreeOfLife 
        nodes={sampleNodes} 
        width={800} 
        height={400} 
      />
    );
    
    expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
  });

  it('displays all nodes from props', () => {
    render(
      <TreeOfLife 
        nodes={sampleNodes} 
        width={800} 
        height={400} 
      />
    );
    
    // Check that all node names are rendered
    expect(screen.getByText('Primordial Cell')).toBeInTheDocument();
    expect(screen.getByText('Marine Algae')).toBeInTheDocument();
    expect(screen.getByText('Land Fungi')).toBeInTheDocument();
    expect(screen.getByText('Complex Multicellular')).toBeInTheDocument();
  });

  it('SVG has correct dimensions', () => {
    render(
      <TreeOfLife 
        nodes={sampleNodes} 
        width={800} 
        height={400} 
      />
    );
    
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toHaveAttribute('width', '800');
    expect(svg).toHaveAttribute('height', '400');
  });

  it('clicking a node calls onNodeClick if provided', () => {
    const mockOnNodeClick = vi.fn();
    
    render(
      <TreeOfLife 
        nodes={sampleNodes} 
        width={800} 
        height={400} 
        onNodeClick={mockOnNodeClick}
      />
    );
    
    // Find and click the first node circle
    const nodeCircles = screen.getAllByRole('button');
    fireEvent.click(nodeCircles[0]);
    
    expect(mockOnNodeClick).toHaveBeenCalledWith(sampleNodes[0]);
  });

  it('does not crash when onNodeClick is not provided', () => {
    render(
      <TreeOfLife 
        nodes={sampleNodes} 
        width={800} 
        height={400} 
      />
    );
    
    // Find and click the first node circle
    const nodeCircles = screen.getAllByRole('button');
    expect(() => fireEvent.click(nodeCircles[0])).not.toThrow();
  });

  it('renders empty tree when no nodes provided', () => {
    render(
      <TreeOfLife 
        nodes={[]} 
        width={800} 
        height={400} 
      />
    );
    
    const svg = screen.getByRole('img', { hidden: true });
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('width', '800');
    expect(svg).toHaveAttribute('height', '400');
  });
});