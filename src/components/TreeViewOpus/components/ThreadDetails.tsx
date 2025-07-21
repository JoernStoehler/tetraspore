/**
 * Details panel for selected/hovered threads
 */

import React from 'react';
import { TapestryThread, TapestryUIState } from '../types';

interface ThreadDetailsProps {
  thread?: TapestryThread;
  uiState: TapestryUIState;
}

export const ThreadDetails: React.FC<ThreadDetailsProps> = ({ thread, uiState }) => {
  if (!thread) return null;
  
  const { species } = thread;
  const lifespan = species.extinctionTurn 
    ? species.extinctionTurn - species.birthTurn 
    : uiState.timeDisplay.currentTurn - species.birthTurn;
  
  return (
    <div className="thread-details">
      <div className="details-header">
        <h3 className="species-name">{species.name}</h3>
        <div className="species-id">ID: {species.id}</div>
      </div>
      
      <div className="details-section">
        <h4>Lifespan</h4>
        <div className="lifespan-info">
          <span>Born: Turn {species.birthTurn}</span>
          {species.extinctionTurn && (
            <span className="extinction">Extinct: Turn {species.extinctionTurn}</span>
          )}
          <span>Duration: {lifespan} turns</span>
        </div>
      </div>
      
      <div className="details-section">
        <h4>Thread Properties</h4>
        <div className="thread-props">
          <div className="prop-row">
            <span className="prop-label">Texture:</span>
            <span className="prop-value">{species.threadTexture}</span>
          </div>
          <div className="prop-row">
            <span className="prop-label">Pattern:</span>
            <span className="prop-value">{species.weavingStyle.pattern}</span>
          </div>
          <div className="prop-row">
            <span className="prop-label">Vitality:</span>
            <div className="vitality-bar">
              <div 
                className="vitality-fill"
                style={{ width: `${species.vitality.current * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="details-section">
        <h4>Habitat</h4>
        <div className="habitat-info">
          <span className="habitat-layer">{species.habitat.layer}</span>
          <span className="habitat-climate">{species.habitat.temperature}</span>
          <span className="habitat-moisture">{species.habitat.moisture}</span>
        </div>
      </div>
      
      <div className="details-section">
        <h4>Traits</h4>
        <div className="traits-grid">
          <div className="trait">
            <span className="trait-icon">🏃</span>
            <span>{species.traits.mobility}</span>
          </div>
          <div className="trait">
            <span className="trait-icon">👥</span>
            <span>{species.traits.sociability}</span>
          </div>
          <div className="trait">
            <span className="trait-icon">🍽</span>
            <span>{species.traits.metabolism}</span>
          </div>
          <div className="trait">
            <span className="trait-icon">🌱</span>
            <span>{species.traits.reproduction}</span>
          </div>
        </div>
      </div>
      
      {species.relationships && (
        <div className="details-section">
          <h4>Relationships</h4>
          <div className="relationships">
            {species.relationships.symbioticPartners.length > 0 && (
              <div className="relationship-type">
                <span className="rel-label">Symbiotic:</span>
                <span className="rel-count">{species.relationships.symbioticPartners.length}</span>
              </div>
            )}
            {species.relationships.predators.length > 0 && (
              <div className="relationship-type">
                <span className="rel-label">Predators:</span>
                <span className="rel-count">{species.relationships.predators.length}</span>
              </div>
            )}
            {species.relationships.prey.length > 0 && (
              <div className="relationship-type">
                <span className="rel-label">Prey:</span>
                <span className="rel-count">{species.relationships.prey.length}</span>
              </div>
            )}
          </div>
        </div>
      )}
      
      {species.lore && uiState.preferences.tooltipDetail !== 'minimal' && (
        <div className="details-section lore">
          <h4>Story</h4>
          <p className="lore-text">{species.lore.origin}</p>
          {species.lore.achievement && (
            <p className="lore-text achievement">{species.lore.achievement}</p>
          )}
          {species.lore.challenge && (
            <p className="lore-text challenge">{species.lore.challenge}</p>
          )}
        </div>
      )}
      
      {/* SOUND: Gentle whoosh when details panel opens */}
      {/* SOUND: Species-specific ambient tone based on audioSignature */}
    </div>
  );
};