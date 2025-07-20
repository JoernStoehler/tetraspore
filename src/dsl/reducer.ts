// DSL Reducer - Applies events to game state

import type { GameState, GameEvent, Species } from './types';

// Initial state
export const initialState: GameState = {
  turn: 0,
  species: []
};

// Event reducer
export function reduceEvent(state: GameState, event: GameEvent): GameState {
  switch (event.type) {
    case 'turn_changed':
      return { ...state, turn: event.turn };
    
    case 'species_added': {
      // Check if species already exists
      const exists = state.species.some(s => s.name === event.name);
      if (exists) {
        return state;
      }
      
      // Find parent species if specified
      let parentId: string | null = null;
      if (event.parentSpecies) {
        const parent = state.species.find(s => s.name === event.parentSpecies);
        if (parent) {
          parentId = parent.id;
        }
      }
      
      // Create new species object
      const newSpecies: Species = {
        id: `species-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: event.name,
        parentId,
        birthTurn: state.turn,
      };
      
      return { 
        ...state, 
        species: [...state.species, newSpecies] 
      };
    }
    
    case 'species_removed': {
      return { 
        ...state, 
        species: state.species.map(s => 
          s.name === event.name 
            ? { ...s, extinctionTurn: state.turn }
            : s
        )
      };
    }
    
    case 'turn_ended':
      // No state change, just marks end of turn
      return state;
    
    default:
      return state;
  }
}

// Apply multiple events in sequence
export function applyEvents(state: GameState, events: GameEvent[]): GameState {
  return events.reduce(reduceEvent, state);
}