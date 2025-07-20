import React from 'react';
import { GameControlsProps } from './tree/types';
import { CONTROLS_STYLES } from './tree/styles';

export const GameControls: React.FC<GameControlsProps> = ({
  currentTurn,
  isProcessing,
  onNextTurn
}) => {
  return (
    <div className={CONTROLS_STYLES.container}>
      <div className={CONTROLS_STYLES.turnCounter}>
        Turn: {currentTurn}
      </div>
      <button
        className={CONTROLS_STYLES.button}
        onClick={onNextTurn}
        disabled={isProcessing}
      >
        {isProcessing ? (
          <div className="flex items-center gap-2">
            <svg className={CONTROLS_STYLES.spinner} viewBox="0 0 24 24">
              <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4" 
                fill="none"
              />
              <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Processing...
          </div>
        ) : (
          'Next Turn'
        )}
      </button>
    </div>
  );
};