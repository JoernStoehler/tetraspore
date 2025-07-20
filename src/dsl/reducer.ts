import type { DSLState, DSLAction, DSLActionTurn } from './types';
import type { DSLReducer } from './interfaces';

export class Reducer implements DSLReducer {
  reduce(state: DSLState, action: DSLAction): DSLState {
    switch (action.type) {
      case 'SpeciesCreate':
        return {
          ...state,
          species: [...state.species, action.species],
        };

      case 'SpeciesCreateChoice':
        return {
          ...state,
          previewCreate: [...state.previewCreate, action.preview],
        };

      case 'SpeciesExtinct':
        return {
          ...state,
          species: state.species.map(species =>
            species.id === action.species_id
              ? { ...species, extinction_turn: action.extinction_turn }
              : species
          ),
        };

      case 'SpeciesExtinctChoice':
        return {
          ...state,
          previewExtinct: [...state.previewExtinct, action.preview],
        };

      default:
        return state;
    }
  }

  reduceTurn(state: DSLState, turn: DSLActionTurn): DSLState {
    return turn.actions.reduce((currentState, action) => 
      this.reduce(currentState, action), 
      state
    );
  }
}

// Helper functions for common state manipulations
export function clearPreviews(state: DSLState): DSLState {
  return {
    ...state,
    previewCreate: [],
    previewExtinct: [],
  };
}

export function incrementTurn(state: DSLState): DSLState {
  return {
    ...state,
    turn: state.turn + 1,
  };
}

// Helper to check if species exists and is alive
export function isSpeciesAlive(state: DSLState, speciesId: string): boolean {
  const species = state.species.find(s => s.id === speciesId);
  return species !== undefined && species.extinction_turn === undefined;
}

// Helper to get all alive species
export function getAliveSpecies(state: DSLState): typeof state.species {
  return state.species.filter(s => s.extinction_turn === undefined);
}

// Helper to get species lineage
export function getLineage(state: DSLState, speciesId: string): typeof state.species {
  const lineage: typeof state.species = [];
  let currentId: string | undefined = speciesId;

  while (currentId) {
    const species = state.species.find(s => s.id === currentId);
    if (!species) break;
    lineage.unshift(species);
    currentId = species.parent;
  }

  return lineage;
}

// Export singleton instance
export const reducer = new Reducer();