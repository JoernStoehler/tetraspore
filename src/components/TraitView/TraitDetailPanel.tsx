import { type FC } from 'react';
import { type Trait, type TraitNodeState } from './types';

interface TraitDetailPanelProps {
  trait: Trait | null;
  state: TraitNodeState | null;
  connectedTraits: Array<{ trait: Trait; relationship: string }>;
  onClose: () => void;
  visible: boolean;
}

export const TraitDetailPanel: FC<TraitDetailPanelProps> = ({
  trait,
  state,
  connectedTraits,
  onClose,
  visible,
}) => {
  if (!visible || !trait || !state) return null;

  const getStateDescription = (state: TraitNodeState): string => {
    switch (state) {
      case 'not-discovered':
        return 'Not yet discovered by your species';
      case 'discovered':
        return 'Discovered but not yet adoptable';
      case 'adoptable':
        return 'Available for adoption through choice';
      case 'adopted':
        return 'Successfully integrated into your species';
      case 'losable':
        return 'Adopted trait that can be lost through choice';
      case 'environmental':
        return 'Present in your environment';
      default:
        return 'Unknown state';
    }
  };

  const getStateColor = (state: TraitNodeState): string => {
    switch (state) {
      case 'not-discovered':
        return '#9ca3af';
      case 'discovered':
        return '#6b7280';
      case 'adoptable':
        return '#fbbf24';
      case 'adopted':
        return '#10b981';
      case 'losable':
        return '#f59e0b';
      case 'environmental':
        return '#06b6d4';
      default:
        return '#6b7280';
    }
  };

  return (
    <div
      className="trait-detail-panel"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        width: '320px',
        maxHeight: '80vh',
        backgroundColor: 'white',
        border: '1px solid #d1d5db',
        borderRadius: '8px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        overflow: 'hidden',
      }}
      data-testid="trait-detail-panel"
    >
      {/* Header */}
      <div
        style={{
          padding: '16px',
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#f9fafb',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#111827',
          }}
        >
          {trait.name}
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#6b7280',
            padding: '4px',
          }}
          data-testid="close-detail-panel"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div
        style={{
          padding: '16px',
          maxHeight: 'calc(80vh - 80px)',
          overflowY: 'auto',
        }}
      >
        {/* State badge */}
        <div
          style={{
            display: 'inline-block',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            fontWeight: '600',
            backgroundColor: getStateColor(state),
            color: 'white',
            marginBottom: '12px',
          }}
        >
          {getStateDescription(state)}
        </div>

        {/* Category */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '4px',
            }}
          >
            Category
          </div>
          <div style={{ fontSize: '14px', color: '#111827' }}>
            {trait.category} {trait.isEnvironmental ? '(Environmental)' : '(Species)'}
          </div>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '16px' }}>
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px',
            }}
          >
            Description
          </div>
          <div
            style={{
              fontSize: '14px',
              lineHeight: '1.5',
              color: '#374151',
            }}
          >
            {trait.description}
          </div>
        </div>

        {/* Connected traits */}
        {connectedTraits.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#6b7280',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '8px',
              }}
            >
              Connected Traits
            </div>
            <div>
              {connectedTraits.map((connection, index) => (
                <div
                  key={index}
                  style={{
                    padding: '8px',
                    marginBottom: '8px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '4px',
                    border: '1px solid #e5e7eb',
                  }}
                >
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#111827',
                      marginBottom: '2px',
                    }}
                  >
                    {connection.trait.name}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      fontStyle: 'italic',
                    }}
                  >
                    {connection.relationship}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional info for discovered but not adoptable traits */}
        {state === 'discovered' && (
          <div
            style={{
              padding: '12px',
              backgroundColor: '#fef3c7',
              border: '1px solid #f59e0b',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#92400e',
            }}
          >
            <strong>Why not adoptable:</strong> This trait requires specific conditions or prerequisites to become available for adoption.
          </div>
        )}
      </div>
    </div>
  );
};