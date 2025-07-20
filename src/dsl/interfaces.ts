import type { ComponentType } from 'react';
import type { DSLState, DSLAction, DSLActionTurn, ValidationResult } from './types';

// Parser interface for converting LLM output to typed actions
export interface DSLParser {
  parse(input: string): DSLActionTurn | null;
  validate(turn: DSLActionTurn, state: DSLState): ValidationResult;
}

// Reducer interface for applying actions to state
export interface DSLReducer {
  reduce(state: DSLState, action: DSLAction): DSLState;
  reduceTurn(state: DSLState, turn: DSLActionTurn): DSLState;
}

// Component registry for dynamic component registration
export interface ComponentRegistry {
  register(name: string, component: ComponentType<any>): void;
  get(name: string): ComponentType<any> | undefined;
  getAll(): Map<string, ComponentType<any>>;
}

// Validator interface for two-pass validation
export interface DSLValidator {
  validateAction(action: DSLAction, state: DSLState): ValidationResult;
  validateTurn(turn: DSLActionTurn, state: DSLState): ValidationResult;
  generateFeedback(errors: ValidationResult): string;
}