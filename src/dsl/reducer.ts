// DSL Reducer - Applies events to game state

import type { GameState, GameEvent } from './types';

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
    
    case 'species_added':
      if (!state.species.includes(event.name)) {
        return { ...state, species: [...state.species, event.name] };
      }
      return state;
    
    case 'species_removed':
      return { 
        ...state, 
        species: state.species.filter(s => s !== event.name) 
      };
    
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