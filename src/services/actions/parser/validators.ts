/**
 * Semantic validation functions for Action DSL
 */

import type { Action, ValidationError } from './types';

/**
 * Utility function to safely cast Action to Record for schema functions
 */
function toRecord(action: Action): Record<string, unknown> {
  return action as unknown as Record<string, unknown>;
}
import { 
  DuplicateIdError, 
  UnknownReferenceError, 
  CircularDependencyError,
  InvalidConditionError,
  InvalidTargetError,
  findSimilarStrings
} from './errors';
import { extractActionIds, extractReferencedIds, hasId } from './schemas';

/**
 * Validate that all IDs are unique across the action set
 */
export function validateUniqueIds(actions: Action[]): ValidationError[] {
  const errors: ValidationError[] = [];
  const idToIndex = new Map<string, number>();
  
  actions.forEach((action, index) => {
    const ids = extractActionIds(toRecord(action));
    
    for (const id of ids) {
      const existingIndex = idToIndex.get(id);
      if (existingIndex !== undefined) {
        errors.push(new DuplicateIdError(id, index).toValidationError());
      } else {
        idToIndex.set(id, index);
      }
    }
  });
  
  return errors;
}

/**
 * Validate that all referenced IDs exist
 */
export function validateReferences(actions: Action[]): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Build registry of all available IDs
  const availableIds = new Set<string>();
  actions.forEach(action => {
    const ids = extractActionIds(toRecord(action));
    ids.forEach(id => availableIds.add(id));
  });
  
  const availableIdsList = Array.from(availableIds);
  
  // Check all references
  actions.forEach((action, index) => {
    const actionRecord = toRecord(action);
    const referencedIds = extractReferencedIds(actionRecord);
    const actionId = hasId(actionRecord) ? actionRecord.id : undefined;
    
    for (const refId of referencedIds) {
      if (!availableIds.has(refId)) {
        const suggestions = findSimilarStrings(refId, availableIdsList);
        errors.push(new UnknownReferenceError(refId, index, actionId, suggestions).toValidationError());
      }
    }
  });
  
  return errors;
}

/**
 * Build dependency graph and detect circular dependencies
 */
export function validateDependencies(actions: Action[]): {
  errors: ValidationError[];
  dependencies: Map<string, Set<string>>;
  executionOrder: string[];
} {
  const errors: ValidationError[] = [];
  const dependencies = new Map<string, Set<string>>();
  const actionIdToAction = new Map<string, Action>();
  
  // Build action registry and initialize dependency map
  actions.forEach(action => {
    const actionRecord = toRecord(action);
    const ids = extractActionIds(actionRecord);
    ids.forEach(id => {
      actionIdToAction.set(id, action);
      dependencies.set(id, new Set());
    });
  });
  
  // Build dependency relationships
  actions.forEach(action => {
    const actionRecord = toRecord(action);
    const actionIds = extractActionIds(actionRecord);
    const referencedIds = extractReferencedIds(actionRecord);
    
    // Each action ID depends on all its references
    actionIds.forEach(id => {
      const deps = dependencies.get(id);
      if (deps) {
        referencedIds.forEach(refId => deps.add(refId));
      }
    });
  });
  
  // Detect cycles using DFS
  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  const path: string[] = [];
  
  function detectCycle(nodeId: string): boolean {
    if (recursionStack.has(nodeId)) {
      // Found cycle - extract the cycle path
      const cycleStart = path.indexOf(nodeId);
      const cycle = path.slice(cycleStart);
      errors.push(new CircularDependencyError(cycle).toValidationError());
      return true;
    }
    
    if (visited.has(nodeId)) {
      return false;
    }
    
    visited.add(nodeId);
    recursionStack.add(nodeId);
    path.push(nodeId);
    
    const deps = dependencies.get(nodeId);
    if (deps) {
      for (const depId of deps) {
        if (detectCycle(depId)) {
          return true;
        }
      }
    }
    
    recursionStack.delete(nodeId);
    path.pop();
    return false;
  }
  
  // Check all nodes for cycles
  for (const nodeId of dependencies.keys()) {
    if (!visited.has(nodeId)) {
      detectCycle(nodeId);
    }
  }
  
  // Generate topological sort for execution order
  const executionOrder = topologicalSort(dependencies);
  
  return { errors, dependencies, executionOrder };
}

/**
 * Topological sort using Kahn's algorithm
 */
function topologicalSort(dependencies: Map<string, Set<string>>): string[] {
  const inDegree = new Map<string, number>();
  const adjList = new Map<string, Set<string>>();
  
  // Initialize in-degree and adjacency list
  for (const [node, deps] of dependencies) {
    inDegree.set(node, deps.size);
    
    // Build reverse adjacency list (dependents)
    for (const dep of deps) {
      if (!adjList.has(dep)) {
        adjList.set(dep, new Set());
      }
      adjList.get(dep)!.add(node);
    }
  }
  
  // Find nodes with no dependencies
  const queue: string[] = [];
  for (const [node, degree] of inDegree) {
    if (degree === 0) {
      queue.push(node);
    }
  }
  
  const result: string[] = [];
  
  while (queue.length > 0) {
    const node = queue.shift()!;
    result.push(node);
    
    // Reduce in-degree of dependents
    const dependents = adjList.get(node);
    if (dependents) {
      for (const dependent of dependents) {
        const newDegree = inDegree.get(dependent)! - 1;
        inDegree.set(dependent, newDegree);
        
        if (newDegree === 0) {
          queue.push(dependent);
        }
      }
    }
  }
  
  return result;
}

/**
 * Validate condition paths in when_then actions
 */
export function validateConditions(actions: Action[]): ValidationError[] {
  const errors: ValidationError[] = [];
  
  function validateConditionInAction(action: Action, index: number, actionId?: string) {
    if (action.type === 'when_then') {
      if (!isValidConditionPath(action.condition)) {
        errors.push(new InvalidConditionError(action.condition, index, actionId).toValidationError());
      }
      
      // Recursively validate nested actions
      validateConditionInAction(action.action, index, actionId);
    } else if (action.type === 'add_player_choice') {
      // Validate conditions in player choice reactions
      action.options.forEach(option => {
        option.reactions.forEach(reaction => {
          validateConditionInAction(reaction, index, action.id);
        });
      });
    }
  }
  
  actions.forEach((action, index) => {
    const actionRecord = toRecord(action);
    const actionId = hasId(actionRecord) ? actionRecord.id : undefined;
    validateConditionInAction(action, index, actionId);
  });
  
  return errors;
}

/**
 * Validate target paths in feature actions
 */
export function validateTargets(actions: Action[]): ValidationError[] {
  const errors: ValidationError[] = [];
  
  actions.forEach((action, index) => {
    if (action.type === 'add_feature' || action.type === 'remove_feature') {
      const actionRecord = toRecord(action);
      if (!isValidTargetPath(action.target)) {
        const actionId = hasId(actionRecord) ? actionRecord.id : undefined;
        errors.push(new InvalidTargetError(action.target, index, actionId).toValidationError());
      }
    }
  });
  
  return errors;
}

/**
 * Check if a condition path is valid
 * Examples: "species.primary.features.tool_use.level", "game.planet_just_created"
 */
function isValidConditionPath(condition: string): boolean {
  // Basic validation - should be dot-separated path
  if (!condition || typeof condition !== 'string') {
    return false;
  }
  
  // Must not start or end with dot
  if (condition.startsWith('.') || condition.endsWith('.')) {
    return false;
  }
  
  // Must not have consecutive dots
  if (condition.includes('..')) {
    return false;
  }
  
  // Must have valid identifier characters
  const pathRegex = /^[a-zA-Z_][a-zA-Z0-9_]*(\.[a-zA-Z_][a-zA-Z0-9_]*)*$/;
  return pathRegex.test(condition);
}

/**
 * Check if a target path is valid
 * Examples: "species.primary", "planet.region.north"
 */
function isValidTargetPath(target: string): boolean {
  // Same validation rules as condition paths
  return isValidConditionPath(target);
}

/**
 * Categorize actions into asset and game actions by counting them
 */
export function categorizeActions(actions: Action[]): {
  assetActions: string[];
  gameActions: string[];
} {
  const assetActions: string[] = [];
  const gameActions: string[] = [];
  
  function categorizeAction(action: Action, actionIndex: number, prefix = '') {
    const ids = extractActionIds(toRecord(action));
    
    if (['asset_image', 'asset_subtitle', 'asset_cutscene'].includes(action.type)) {
      assetActions.push(...ids);
    } else if (action.type !== 'reason') { // reason actions are not executed
      if (ids.length > 0) {
        gameActions.push(...ids);
      } else {
        // For actions without IDs, create a synthetic identifier for counting
        const syntheticId = `${prefix}${action.type}_${actionIndex}`;
        gameActions.push(syntheticId);
      }
      
      // Handle nested actions
      if (action.type === 'add_player_choice') {
        action.options.forEach((option, optionIndex) => {
          option.reactions.forEach((reaction, reactionIndex) => {
            categorizeAction(reaction, reactionIndex, `${action.id || `choice_${actionIndex}`}_option_${optionIndex}_`);
          });
        });
      } else if (action.type === 'when_then') {
        categorizeAction(action.action, 0, `when_then_${actionIndex}_`);
      }
    }
  }
  
  actions.forEach((action, index) => categorizeAction(action, index));
  
  return { assetActions, gameActions };
}