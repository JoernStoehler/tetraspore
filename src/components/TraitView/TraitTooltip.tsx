import { type FC } from 'react';
import { type Trait, type TraitEdge, type TraitNodeState } from './types';

interface TraitTooltipProps {
  trait: Trait;
  state: TraitNodeState;
  x: number;
  y: number;
  visible: boolean;
}

interface EdgeTooltipProps {
  edge: TraitEdge;
  x: number;
  y: number;
  visible: boolean;
}

export const TraitTooltip: FC<TraitTooltipProps> = ({ trait, state, x, y, visible }) => {
  if (!visible) return null;

  // Don't show tooltip for not-discovered traits
  if (state === 'not-discovered') return null;

  return (
    <div
      className="trait-tooltip"
      style={{
        position: 'absolute',
        left: x + 10,
        top: y - 10,
        backgroundColor: '#333',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        maxWidth: '200px',
        zIndex: 1000,
        pointerEvents: 'none',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      }}
      data-testid="trait-tooltip"
    >
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
        {trait.name}
      </div>
      <div style={{ fontSize: '10px', opacity: 0.8, marginBottom: '4px' }}>
        {trait.category} {trait.isEnvironmental ? '(Environmental)' : ''}
      </div>
      <div style={{ fontSize: '11px' }}>
        {trait.description}
      </div>
    </div>
  );
};

export const EdgeTooltip: FC<EdgeTooltipProps> = ({ edge, x, y, visible }) => {
  if (!visible) return null;

  return (
    <div
      className="edge-tooltip"
      style={{
        position: 'absolute',
        left: x + 10,
        top: y - 10,
        backgroundColor: '#444',
        color: 'white',
        padding: '6px 10px',
        borderRadius: '4px',
        fontSize: '11px',
        maxWidth: '180px',
        zIndex: 1000,
        pointerEvents: 'none',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
      }}
      data-testid="edge-tooltip"
    >
      {edge.description}
    </div>
  );
};