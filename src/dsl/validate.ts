// DSL Validator - Validates game actions

import type { GameAction, ValidationResult, ValidationError, ValidationWarning } from './types';

// Validate a list of game actions
export function validateActions(actions: unknown): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];
  const validActions: GameAction[] = [];

  // Check if actions is an array
  if (!Array.isArray(actions)) {
    errors.push({
      actionIndex: -1,
      field: 'actions',
      message: 'Actions must be an array',
      suggestion: 'Ensure the LLM returns an array of action objects'
    });
    return { valid: false, errors, warnings, validActions };
  }

  // Validate each action
  actions.forEach((action, index) => {
    // Check if action is an object
    if (typeof action !== 'object' || action === null) {
      errors.push({
        actionIndex: index,
        field: 'action',
        message: 'Action must be an object',
        suggestion: 'Each action should be a JSON object with a "type" field'
      });
      return;
    }

    // Check if action has a type
    if (!action.type || typeof action.type !== 'string') {
      errors.push({
        actionIndex: index,
        field: 'type',
        message: 'Action must have a string "type" field',
        suggestion: 'Add a "type" field with one of: turn_changed, species_added, species_removed, turn_ended'
      });
      return;
    }

    // Validate specific action types
    switch (action.type) {
      case 'turn_changed':
        if (typeof action.turn !== 'number' || action.turn < 0) {
          errors.push({
            actionIndex: index,
            field: 'turn',
            message: 'turn_changed action must have a non-negative number "turn" field',
            suggestion: 'Add "turn": <number> to the action'
          });
        } else {
          validActions.push(action as GameAction);
        }
        break;

      case 'species_added':
      case 'species_removed':
        if (!action.name || typeof action.name !== 'string') {
          errors.push({
            actionIndex: index,
            field: 'name',
            message: `${action.type} action must have a string "name" field`,
            suggestion: 'Add "name": "<species name>" to the action'
          });
        } else if (action.name.trim().length === 0) {
          errors.push({
            actionIndex: index,
            field: 'name',
            message: 'Species name cannot be empty',
            suggestion: 'Provide a non-empty name for the species'
          });
        } else {
          validActions.push(action as GameAction);
        }
        break;

      case 'turn_ended':
        // No additional fields required
        validActions.push(action as GameAction);
        break;

      default:
        warnings.push({
          actionIndex: index,
          message: `Unknown action type "${action.type}" - will be ignored`
        });
        break;
    }

    // Check for unexpected fields (warning only)
    const expectedFields = getExpectedFields(action.type);
    const actualFields = Object.keys(action);
    const unexpectedFields = actualFields.filter(f => !expectedFields.includes(f));
    
    if (unexpectedFields.length > 0) {
      warnings.push({
        actionIndex: index,
        message: `Unexpected fields: ${unexpectedFields.join(', ')} - these will be ignored`
      });
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    validActions
  };
}

// Get expected fields for each action type
function getExpectedFields(actionType: string): string[] {
  const baseFields = ['type'];
  
  switch (actionType) {
    case 'turn_changed':
      return [...baseFields, 'turn'];
    case 'species_added':
    case 'species_removed':
      return [...baseFields, 'name'];
    case 'turn_ended':
      return baseFields;
    default:
      return baseFields;
  }
}

// Filter out invalid actions from a list
export function filterValidActions(actions: unknown): GameAction[] {
  const result = validateActions(actions);
  return result.validActions;
}