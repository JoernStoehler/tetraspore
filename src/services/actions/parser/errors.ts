/**
 * Custom error classes for the DSL Parser
 */

import type { ValidationError } from './types';

/**
 * Base class for all DSL parsing errors
 */
export class DSLParserError extends Error {
  public readonly type: ValidationError['type'];
  public readonly actionIndex?: number;
  public readonly actionId?: string;
  public readonly path?: string;

  constructor(
    type: ValidationError['type'],
    message: string,
    options?: {
      actionIndex?: number;
      actionId?: string;
      path?: string;
    }
  ) {
    super(message);
    this.name = 'DSLParserError';
    this.type = type;
    this.actionIndex = options?.actionIndex;
    this.actionId = options?.actionId;
    this.path = options?.path;
  }

  toValidationError(): ValidationError {
    return {
      type: this.type,
      message: this.message,
      actionIndex: this.actionIndex,
      actionId: this.actionId,
      path: this.path,
    };
  }
}

/**
 * Error thrown when JSON schema validation fails
 */
export class SchemaValidationError extends DSLParserError {
  constructor(message: string, actionIndex?: number) {
    super('schema', message, { actionIndex });
    this.name = 'SchemaValidationError';
  }
}

/**
 * Error thrown when duplicate IDs are found
 */
export class DuplicateIdError extends DSLParserError {
  constructor(id: string, actionIndex?: number) {
    super('duplicate_id', `Duplicate ID: ${id}`, { actionIndex, actionId: id });
    this.name = 'DuplicateIdError';
  }
}

/**
 * Error thrown when a referenced ID cannot be found
 */
export class UnknownReferenceError extends DSLParserError {
  constructor(id: string, actionIndex?: number, actionId?: string, suggestions?: string[]) {
    let message = `Unknown reference: ${id}`;
    
    if (suggestions && suggestions.length > 0) {
      const actionContext = actionId ? ` in action '${actionId}'` : '';
      if (suggestions.length === 1) {
        message = `Unknown reference '${id}'${actionContext}. Did you mean '${suggestions[0]}'?`;
      } else {
        const suggestionList = suggestions.slice(0, 3).map(s => `'${s}'`).join(', ');
        message = `Unknown reference '${id}'${actionContext}. Did you mean one of: ${suggestionList}?`;
      }
    }
    
    super('unknown_reference', message, { actionIndex, actionId });
    this.name = 'UnknownReferenceError';
  }
}

/**
 * Error thrown when circular dependencies are detected
 */
export class CircularDependencyError extends DSLParserError {
  constructor(cycle: string[]) {
    const cycleStr = cycle.join(' → ') + ' → ' + cycle[0];
    super('circular_dependency', `Circular dependency detected: ${cycleStr}`);
    this.name = 'CircularDependencyError';
  }
}

/**
 * Error thrown when a condition path is invalid
 */
export class InvalidConditionError extends DSLParserError {
  constructor(condition: string, actionIndex?: number, actionId?: string) {
    super('invalid_condition', `Invalid condition path: ${condition}`, {
      actionIndex,
      actionId,
      path: condition,
    });
    this.name = 'InvalidConditionError';
  }
}

/**
 * Error thrown when a target path is invalid
 */
export class InvalidTargetError extends DSLParserError {
  constructor(target: string, actionIndex?: number, actionId?: string) {
    super('invalid_target', `Invalid target path: ${target}`, {
      actionIndex,
      actionId,
      path: target,
    });
    this.name = 'InvalidTargetError';
  }
}

/**
 * Utility function to create validation errors from thrown errors
 */
export function errorToValidationError(error: unknown, actionIndex?: number): ValidationError {
  if (error instanceof DSLParserError) {
    return error.toValidationError();
  }

  if (error instanceof Error) {
    return {
      type: 'schema',
      message: error.message,
      actionIndex,
    };
  }

  return {
    type: 'schema',
    message: 'Unknown parsing error',
    actionIndex,
  };
}

/**
 * Simple string similarity function for suggesting corrections
 * 
 * @param target - The string to find suggestions for
 * @param candidates - Array of possible matches
 * @param maxSuggestions - Maximum number of suggestions to return (default: 3)
 * @returns Array of suggested strings, limited to maxSuggestions
 */
export function findSimilarStrings(target: string, candidates: string[], maxSuggestions = 3): string[] {
  if (candidates.length === 0) return [];

  // Calculate distances for all candidates
  const scores = candidates.map(candidate => ({
    candidate,
    score: levenshteinDistance(target, candidate)
  }));

  // Sort by score (best matches first)
  scores.sort((a, b) => a.score - b.score);

  // Only suggest if the similarity is reasonable (less than half the target length different)
  const threshold = Math.max(2, Math.floor(target.length / 2));
  
  return scores
    .filter(item => item.score <= threshold)
    .slice(0, maxSuggestions)
    .map(item => item.candidate);
}

/**
 * Simple string similarity function for suggesting corrections (single result)
 * @deprecated Use findSimilarStrings for multiple suggestions
 */
export function findSimilarString(target: string, candidates: string[]): string | undefined {
  const suggestions = findSimilarStrings(target, candidates, 1);
  return suggestions.length > 0 ? suggestions[0] : undefined;
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(a: string, b: string): number {
  const matrix = Array(a.length + 1).fill(null).map(() => Array(b.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) {
    matrix[i][0] = i;
  }

  for (let j = 0; j <= b.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[a.length][b.length];
}