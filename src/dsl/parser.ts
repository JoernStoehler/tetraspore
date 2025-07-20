import type { DSLActionTurn, DSLState, ValidationResult } from './types';
import type { DSLParser } from './interfaces';
import { validator } from './validate';

export class Parser implements DSLParser {
  parse(input: string): DSLActionTurn | null {
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(input);
      
      // Basic structure validation
      if (!parsed || typeof parsed !== 'object') {
        return null;
      }

      // If the input is already a DSLActionTurn
      if ('actions' in parsed && Array.isArray(parsed.actions)) {
        return parsed as DSLActionTurn;
      }

      // If the input is wrapped in a response object (common LLM pattern)
      if ('turn' in parsed && parsed.turn && 'actions' in parsed.turn) {
        return parsed.turn as DSLActionTurn;
      }

      // If the input is just an array of actions
      if (Array.isArray(parsed)) {
        return { actions: parsed };
      }

      return null;
    } catch (error) {
      // Handle JSON parse errors
      console.error('Failed to parse DSL input:', error);
      return null;
    }
  }

  validate(turn: DSLActionTurn, state: DSLState): ValidationResult {
    return validator.validateTurn(turn, state);
  }

  // Helper method to extract JSON from mixed text (common with LLMs)
  extractJSON(text: string): string | null {
    // Look for JSON blocks in markdown code blocks
    const codeBlockMatch = text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (codeBlockMatch) {
      return codeBlockMatch[1];
    }

    // Look for raw JSON object
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }

    return null;
  }

  // Parse with extraction fallback
  parseWithExtraction(input: string): DSLActionTurn | null {
    // First try direct parse
    const directParse = this.parse(input);
    if (directParse) return directParse;

    // Try to extract JSON from mixed content
    const extracted = this.extractJSON(input);
    if (extracted) {
      return this.parse(extracted);
    }

    return null;
  }

  // Two-pass parsing with validation
  async parseWithValidation(
    input: string, 
    state: DSLState, 
    onRetry?: (feedback: string) => Promise<string>
  ): Promise<{ turn: DSLActionTurn | null; validation: ValidationResult }> {
    // First attempt
    const turn = this.parseWithExtraction(input);
    
    if (!turn) {
      return {
        turn: null,
        validation: {
          valid: false,
          errors: [{ path: 'root', message: 'Failed to parse JSON input' }],
          feedback: 'Could not parse the input as valid JSON. Please provide a valid DSLActionTurn object.'
        }
      };
    }

    // Validate first attempt
    const validation = this.validate(turn, state);
    
    // If valid or no retry function, return as-is
    if (validation.valid || !onRetry) {
      return { turn, validation };
    }

    // Second attempt with feedback
    try {
      const retryInput = await onRetry(validation.feedback || '');
      const retryTurn = this.parseWithExtraction(retryInput);
      
      if (!retryTurn) {
        return {
          turn: null,
          validation: {
            valid: false,
            errors: [{ path: 'root', message: 'Failed to parse retry JSON input' }],
            feedback: 'Retry attempt also failed to parse as valid JSON.'
          }
        };
      }

      const retryValidation = this.validate(retryTurn, state);
      return { turn: retryTurn, validation: retryValidation };
    } catch (error) {
      return { turn, validation }; // Return original if retry fails
    }
  }
}

// Export singleton instance
export const parser = new Parser();