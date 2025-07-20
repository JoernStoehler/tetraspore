import { describe, it, expect } from 'vitest';
import { parser } from './parser';
import type { DSLState, DSLActionTurn } from './types';

describe('DSL Parser', () => {
  const validTurn: DSLActionTurn = {
    actions: [
      {
        type: 'SpeciesCreate',
        species: {
          id: 'moss-1',
          name: 'Basic Moss',
          description: 'First organism',
          creation_turn: 1
        }
      }
    ]
  };

  const state: DSLState = {
    turn: 1,
    species: [],
    previewCreate: [],
    previewExtinct: []
  };

  describe('parse', () => {
    it('should parse valid JSON turn', () => {
      const input = JSON.stringify(validTurn);
      const result = parser.parse(input);
      
      expect(result).toEqual(validTurn);
    });

    it('should parse turn wrapped in response object', () => {
      const wrapped = { turn: validTurn };
      const input = JSON.stringify(wrapped);
      const result = parser.parse(input);
      
      expect(result).toEqual(validTurn);
    });

    it('should parse array of actions', () => {
      const input = JSON.stringify(validTurn.actions);
      const result = parser.parse(input);
      
      expect(result).toEqual(validTurn);
    });

    it('should return null for invalid JSON', () => {
      const result = parser.parse('not json');
      expect(result).toBeNull();
    });

    it('should return null for non-object JSON', () => {
      const result = parser.parse('"string"');
      expect(result).toBeNull();
    });
  });

  describe('extractJSON', () => {
    it('should extract JSON from markdown code block', () => {
      const text = `Here is the response:
\`\`\`json
{"actions": [{"type": "SpeciesCreate"}]}
\`\`\``;
      
      const extracted = parser.extractJSON(text);
      expect(extracted).toBe('{"actions": [{"type": "SpeciesCreate"}]}');
    });

    it('should extract JSON from plain code block', () => {
      const text = `Response:
\`\`\`
{"actions": []}
\`\`\``;
      
      const extracted = parser.extractJSON(text);
      expect(extracted).toBe('{"actions": []}');
    });

    it('should extract raw JSON object', () => {
      const text = 'Some text {"actions": []} more text';
      const extracted = parser.extractJSON(text);
      expect(extracted).toBe('{"actions": []}');
    });

    it('should return null if no JSON found', () => {
      const text = 'No JSON here';
      const extracted = parser.extractJSON(text);
      expect(extracted).toBeNull();
    });
  });

  describe('parseWithExtraction', () => {
    it('should parse mixed content with JSON', () => {
      const input = `The LLM responds with:
\`\`\`json
${JSON.stringify(validTurn)}
\`\`\``;
      
      const result = parser.parseWithExtraction(input);
      expect(result).toEqual(validTurn);
    });

    it('should fall back to extraction if direct parse fails', () => {
      const input = `Text before {"actions": []} text after`;
      const result = parser.parseWithExtraction(input);
      expect(result).toEqual({ actions: [] });
    });
  });

  describe('parseWithValidation', () => {
    it('should parse and validate valid input', async () => {
      const input = JSON.stringify(validTurn);
      const { turn, validation } = await parser.parseWithValidation(input, state);
      
      expect(turn).toEqual(validTurn);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should return parse error for invalid JSON', async () => {
      const { turn, validation } = await parser.parseWithValidation('not json', state);
      
      expect(turn).toBeNull();
      expect(validation.valid).toBe(false);
      expect(validation.errors[0].path).toBe('root');
      expect(validation.errors[0].message).toContain('parse');
    });

    it('should validate parsed turn', async () => {
      const invalidTurn: DSLActionTurn = {
        actions: [{
          type: 'SpeciesCreate',
          species: {
            id: 'moss-1',
            name: 'Basic Moss',
            description: 'First organism',
            creation_turn: 2 // Wrong turn
          }
        }]
      };

      const { turn, validation } = await parser.parseWithValidation(
        JSON.stringify(invalidTurn),
        state
      );
      
      expect(turn).toEqual(invalidTurn);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContainEqual(
        expect.objectContaining({
          path: expect.stringContaining('creation_turn')
        })
      );
    });

    it('should retry with feedback if provided', async () => {
      const invalidTurn: DSLActionTurn = {
        actions: [{
          type: 'SpeciesCreate',
          species: {
            id: 'moss-1',
            name: 'Basic Moss',
            description: 'First organism',
            creation_turn: 2 // Wrong turn
          }
        }]
      };

      const fixedTurn: DSLActionTurn = {
        actions: [{
          type: 'SpeciesCreate',
          species: {
            id: 'moss-1',
            name: 'Basic Moss',
            description: 'First organism',
            creation_turn: 1 // Fixed
          }
        }]
      };

      let retryCount = 0;
      const { turn, validation } = await parser.parseWithValidation(
        JSON.stringify(invalidTurn),
        state,
        async (feedback) => {
          retryCount++;
          expect(feedback).toContain('current turn');
          return JSON.stringify(fixedTurn);
        }
      );
      
      expect(retryCount).toBe(1);
      expect(turn).toEqual(fixedTurn);
      expect(validation.valid).toBe(true);
    });

    it('should handle retry parse failure', async () => {
      const invalidTurn: DSLActionTurn = {
        actions: [{
          type: 'SpeciesCreate',
          species: {
            id: 'moss-1',
            name: 'Basic Moss',
            description: 'First organism',
            creation_turn: 2
          }
        }]
      };

      const { turn, validation } = await parser.parseWithValidation(
        JSON.stringify(invalidTurn),
        state,
        async () => 'not json' // Retry with invalid JSON
      );
      
      // When retry fails to parse, it returns null turn with specific error
      expect(turn).toBeNull();
      expect(validation.valid).toBe(false);
      expect(validation.errors[0].message).toContain('Failed to parse retry JSON input');
    });
  });
});