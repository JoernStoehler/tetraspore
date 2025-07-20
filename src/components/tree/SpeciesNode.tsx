import React from 'react';
import { TreeNode, Species, CreatePreview } from './types';
import { NODE_STYLES, BUTTON_STYLES } from './styles';

interface SpeciesNodeProps {
  node: TreeNode;
  onAcceptCreate?: (previewId: string) => void;
  onRejectCreate?: (previewId: string) => void;
  onAcceptExtinct?: (speciesId: string) => void;
  onRejectExtinct?: (speciesId: string) => void;
}

export const SpeciesNode: React.FC<SpeciesNodeProps> = React.memo(({
  node,
  onAcceptCreate,
  onRejectCreate,
  onAcceptExtinct,
  onRejectExtinct
}) => {
  const renderLivingSpecies = () => {
    const { data } = node as { type: 'species'; data: Species };
    return (
      <div className={NODE_STYLES.species.container}>
        <div className={NODE_STYLES.species.title}>{data.name}</div>
        <div className={NODE_STYLES.species.description}>
          {data.description.length > 50 
            ? `${data.description.substring(0, 50)}...` 
            : data.description}
        </div>
        <div className={NODE_STYLES.species.turn}>Turn {data.creation_turn}</div>
      </div>
    );
  };

  const renderExtinctSpecies = () => {
    const { data } = node as { type: 'extinct'; data: Species };
    return (
      <div className={NODE_STYLES.extinct.container}>
        <div className={NODE_STYLES.extinct.title}>{data.name}</div>
        <div className={NODE_STYLES.extinct.turn}>
          Turn {data.creation_turn} - {data.extinction_turn}
        </div>
      </div>
    );
  };

  const renderCreatePreview = () => {
    const { data } = node as { type: 'createPreview'; data: CreatePreview };
    return (
      <div className={NODE_STYLES.createPreview.container}>
        <div className={NODE_STYLES.createPreview.buttons}>
          <button
            className={BUTTON_STYLES.reject}
            onClick={() => onRejectCreate?.(data.id)}
            title="Reject"
          >
            ✗
          </button>
          <button
            className={BUTTON_STYLES.accept}
            onClick={() => onAcceptCreate?.(data.id)}
            title="Accept"
            style={{ marginLeft: '140px' }}
          >
            ✓
          </button>
        </div>
        <div className={NODE_STYLES.createPreview.title}>{data.name}</div>
        <div className={NODE_STYLES.createPreview.description}>
          {data.description.length > 50 
            ? `${data.description.substring(0, 50)}...` 
            : data.description}
        </div>
        <div className={NODE_STYLES.createPreview.turn}>Turn {data.creation_turn}?</div>
      </div>
    );
  };

  const renderExtinctPreview = () => {
    const { data } = node as { type: 'extinctPreview'; data: Species & { preview_extinction_turn: number } };
    return (
      <div className={NODE_STYLES.extinctPreview.container}>
        <div className={NODE_STYLES.extinctPreview.buttons}>
          <button
            className={BUTTON_STYLES.reject}
            onClick={() => onRejectExtinct?.(data.id)}
            title="Reject"
          >
            ✗
          </button>
          <button
            className={BUTTON_STYLES.accept}
            onClick={() => onAcceptExtinct?.(data.id)}
            title="Accept"
            style={{ marginLeft: '140px' }}
          >
            ✓
          </button>
        </div>
        <div className={NODE_STYLES.extinctPreview.title}>{data.name}</div>
        <div className={NODE_STYLES.extinctPreview.turn}>
          Dies Turn {data.preview_extinction_turn}?
        </div>
      </div>
    );
  };

  switch (node.type) {
    case 'species':
      return renderLivingSpecies();
    case 'extinct':
      return renderExtinctSpecies();
    case 'createPreview':
      return renderCreatePreview();
    case 'extinctPreview':
      return renderExtinctPreview();
    default:
      return null;
  }
});