import type { DSLState, DSLAction, DSLActionTurn, ValidationError, ValidationResult } from './types';
import type { DSLValidator } from './interfaces';
import { isSpeciesAlive } from './reducer';

export class Validator implements DSLValidator {
  validateAction(action: DSLAction, state: DSLState): ValidationResult {
    const errors: ValidationError[] = [];

    switch (action.type) {
      case 'SpeciesCreate': {
        // Validate species creation
        if (!action.species.id) {
          errors.push({ path: 'species.id', message: 'Species ID is required' });
        }
        if (!action.species.name) {
          errors.push({ path: 'species.name', message: 'Species name is required' });
        }
        if (!action.species.description) {
          errors.push({ path: 'species.description', message: 'Species description is required' });
        }
        if (action.species.creation_turn !== state.turn) {
          errors.push({ 
            path: 'species.creation_turn', 
            message: `Creation turn must be current turn (${state.turn})`,
            value: action.species.creation_turn
          });
        }
        // Check if ID already exists
        if (state.species.some(s => s.id === action.species.id)) {
          errors.push({ 
            path: 'species.id', 
            message: `Species with ID '${action.species.id}' already exists`,
            value: action.species.id
          });
        }
        // Validate parent if specified
        if (action.species.parent && !state.species.some(s => s.id === action.species.parent)) {
          errors.push({ 
            path: 'species.parent', 
            message: `Parent species '${action.species.parent}' does not exist`,
            value: action.species.parent
          });
        }
        break;
      }

      case 'SpeciesCreateChoice': {
        // Validate preview creation
        if (!action.preview.id) {
          errors.push({ path: 'preview.id', message: 'Preview ID is required' });
        }
        if (!action.preview.name) {
          errors.push({ path: 'preview.name', message: 'Preview name is required' });
        }
        if (!action.preview.description) {
          errors.push({ path: 'preview.description', message: 'Preview description is required' });
        }
        if (!action.preview.parent_id) {
          errors.push({ path: 'preview.parent_id', message: 'Parent ID is required for preview' });
        }
        if (action.preview.creation_turn !== state.turn) {
          errors.push({ 
            path: 'preview.creation_turn', 
            message: `Preview creation turn must be current turn (${state.turn})`,
            value: action.preview.creation_turn
          });
        }
        // Check if preview ID already exists
        if (state.previewCreate.some(p => p.id === action.preview.id)) {
          errors.push({ 
            path: 'preview.id', 
            message: `Preview with ID '${action.preview.id}' already exists`,
            value: action.preview.id
          });
        }
        // Validate parent exists and is alive
        if (!isSpeciesAlive(state, action.preview.parent_id)) {
          errors.push({ 
            path: 'preview.parent_id', 
            message: `Parent species '${action.preview.parent_id}' does not exist or is extinct`,
            value: action.preview.parent_id
          });
        }
        break;
      }

      case 'SpeciesExtinct': {
        // Validate extinction
        if (!action.species_id) {
          errors.push({ path: 'species_id', message: 'Species ID is required for extinction' });
        }
        if (action.extinction_turn !== state.turn) {
          errors.push({ 
            path: 'extinction_turn', 
            message: `Extinction turn must be current turn (${state.turn})`,
            value: action.extinction_turn
          });
        }
        // Check if species exists and is alive
        if (!isSpeciesAlive(state, action.species_id)) {
          errors.push({ 
            path: 'species_id', 
            message: `Species '${action.species_id}' does not exist or is already extinct`,
            value: action.species_id
          });
        }
        break;
      }

      case 'SpeciesExtinctChoice': {
        // Validate extinction preview
        if (!action.preview.species_id) {
          errors.push({ path: 'preview.species_id', message: 'Species ID is required for extinction preview' });
        }
        if (action.preview.extinction_turn !== state.turn) {
          errors.push({ 
            path: 'preview.extinction_turn', 
            message: `Extinction preview turn must be current turn (${state.turn})`,
            value: action.preview.extinction_turn
          });
        }
        // Check if already in preview
        if (state.previewExtinct.some(p => p.species_id === action.preview.species_id)) {
          errors.push({ 
            path: 'preview.species_id', 
            message: `Extinction preview for '${action.preview.species_id}' already exists`,
            value: action.preview.species_id
          });
        }
        // Check if species exists and is alive
        if (!isSpeciesAlive(state, action.preview.species_id)) {
          errors.push({ 
            path: 'preview.species_id', 
            message: `Species '${action.preview.species_id}' does not exist or is already extinct`,
            value: action.preview.species_id
          });
        }
        break;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      feedback: errors.length > 0 ? this.generateFeedback({ valid: false, errors }) : undefined
    };
  }

  validateTurn(turn: DSLActionTurn, state: DSLState): ValidationResult {
    const errors: ValidationError[] = [];
    
    if (!turn.actions || !Array.isArray(turn.actions)) {
      errors.push({ path: 'actions', message: 'Actions array is required' });
      return { valid: false, errors };
    }

    // Track IDs used in this turn to prevent duplicates within the turn
    const usedSpeciesIds = new Set<string>();
    const usedPreviewIds = new Set<string>();
    const extinctionTargets = new Set<string>();

    turn.actions.forEach((action, index) => {
      const actionResult = this.validateAction(action, state);
      
      // Add action-specific errors with path prefix
      actionResult.errors.forEach(error => {
        errors.push({
          ...error,
          path: `actions[${index}].${error.path}`
        });
      });

      // Additional turn-level validation
      switch (action.type) {
        case 'SpeciesCreate':
          if (usedSpeciesIds.has(action.species.id)) {
            errors.push({
              path: `actions[${index}].species.id`,
              message: `Duplicate species ID '${action.species.id}' within turn`,
              value: action.species.id
            });
          }
          usedSpeciesIds.add(action.species.id);
          break;

        case 'SpeciesCreateChoice':
          if (usedPreviewIds.has(action.preview.id)) {
            errors.push({
              path: `actions[${index}].preview.id`,
              message: `Duplicate preview ID '${action.preview.id}' within turn`,
              value: action.preview.id
            });
          }
          usedPreviewIds.add(action.preview.id);
          break;

        case 'SpeciesExtinct':
        case 'SpeciesExtinctChoice':
          const targetId = action.type === 'SpeciesExtinct' 
            ? action.species_id 
            : action.preview.species_id;
          
          if (extinctionTargets.has(targetId)) {
            errors.push({
              path: `actions[${index}].${action.type === 'SpeciesExtinct' ? 'species_id' : 'preview.species_id'}`,
              message: `Species '${targetId}' already marked for extinction in this turn`,
              value: targetId
            });
          }
          extinctionTargets.add(targetId);
          break;
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      feedback: errors.length > 0 ? this.generateFeedback({ valid: false, errors }) : undefined
    };
  }

  generateFeedback(result: ValidationResult): string {
    if (result.valid) return '';

    const feedback: string[] = [
      'Validation failed. Please fix the following issues:'
    ];

    // Group errors by type for clearer feedback
    const errorsByPath = new Map<string, ValidationError[]>();
    
    result.errors.forEach(error => {
      const key = error.path.split('.')[0];
      if (!errorsByPath.has(key)) {
        errorsByPath.set(key, []);
      }
      errorsByPath.get(key)!.push(error);
    });

    errorsByPath.forEach((errors, path) => {
      feedback.push(`\n${path}:`);
      errors.forEach(error => {
        feedback.push(`  - ${error.message}`);
        if (error.value !== undefined) {
          feedback.push(`    Current value: ${JSON.stringify(error.value)}`);
        }
      });
    });

    feedback.push('\nPlease ensure:');
    feedback.push('- All IDs are unique within the current state');
    feedback.push('- Parent species exist and are not extinct');
    feedback.push('- Turn numbers match the current turn');
    feedback.push('- All required fields are provided');

    return feedback.join('\n');
  }
}

// Export singleton instance
export const validator = new Validator();