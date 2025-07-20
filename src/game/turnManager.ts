import type { DSLState, DSLActionTurn } from '../dsl';
import { parser } from '../dsl';
import type { GameSettings, LLMResponse } from './types';
import type { MockLLM } from './mockLLM';

interface TurnResult {
  success: boolean;
  turn?: DSLActionTurn;
  error?: string;
  attempts?: number;
}

export class TurnManager {
  async processTurn(
    state: DSLState,
    llm: MockLLM,
    settings: GameSettings
  ): Promise<TurnResult> {
    let attempts = 0;
    let lastError: string | undefined;
    
    while (attempts < settings.maxLLMAttempts) {
      attempts++;
      
      try {
        // Get LLM response
        const response = await llm.generateTurn(state);
        
        // Parse and validate
        const parseResult = await parser.parseWithValidation(
          JSON.stringify(response.turn),
          state,
          attempts < settings.maxLLMAttempts
            ? async (feedback) => {
                // Use LLM to fix validation errors
                const fixedResponse = await llm.regenerateWithFeedback(
                  state,
                  feedback,
                  response
                );
                return JSON.stringify(fixedResponse.turn);
              }
            : undefined
        );
        
        if (parseResult.validation.valid && parseResult.turn) {
          return {
            success: true,
            turn: parseResult.turn,
            attempts
          };
        }
        
        lastError = parseResult.validation.feedback || 'Validation failed';
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error';
      }
    }
    
    return {
      success: false,
      error: lastError || 'Max attempts reached',
      attempts
    };
  }
  
  // Helper to format LLM prompt (for real LLM integration)
  formatPrompt(state: DSLState): string {
    const aliveSpecies = state.species.filter(s => !s.extinction_turn);
    const extinctSpecies = state.species.filter(s => s.extinction_turn);
    
    return `
You are simulating evolution in a tree of life game. Generate actions for turn ${state.turn}.

Current alive species (${aliveSpecies.length}):
${aliveSpecies.map(s => `- ${s.name} (ID: ${s.id}): ${s.description}`).join('\n')}

Extinct species (${extinctSpecies.length}):
${extinctSpecies.map(s => `- ${s.name} (extinct turn ${s.extinction_turn})`).join('\n')}

Available action types:
1. SpeciesCreate - Directly create a new species
2. SpeciesCreateChoice - Offer a new species for player to accept/reject
3. SpeciesExtinct - Directly make a species extinct
4. SpeciesExtinctChoice - Offer extinction for player to accept/reject

Generate a DSLActionTurn with interesting evolutionary events. Include both direct actions and choices.
Ensure all parent_id references point to existing species.
All creation_turn and extinction_turn values must be ${state.turn}.

Response format:
{
  "actions": [
    // Array of DSLAction objects
  ]
}
`;
  }
  
  // Helper to validate turn rules (additional game logic)
  validateGameRules(turn: DSLActionTurn, state: DSLState, settings: GameSettings): string | null {
    // Check max species per turn
    const createActions = turn.actions.filter(
      a => a.type === 'SpeciesCreate' || a.type === 'SpeciesCreateChoice'
    );
    
    if (createActions.length > settings.maxSpeciesPerTurn) {
      return `Too many species creations (${createActions.length}), max is ${settings.maxSpeciesPerTurn}`;
    }
    
    // Check extinction requirements
    if (state.turn % settings.eraLength === 0) {
      const extinctActions = turn.actions.filter(
        a => a.type === 'SpeciesExtinct' || a.type === 'SpeciesExtinctChoice'
      );
      
      if (extinctActions.length < settings.minExtinctionsPerEra) {
        return `Era ${Math.floor(state.turn / settings.eraLength)} requires at least ${settings.minExtinctionsPerEra} extinctions`;
      }
    }
    
    return null;
  }
}

// Export singleton instance
export const turnManager = new TurnManager();