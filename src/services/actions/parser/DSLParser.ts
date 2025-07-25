/**
 * Main DSL Parser implementation
 * Validates Action DSL JSON and creates execution-ready graphs
 */

import type { Action, ActionGraph, ActionNode, ParserResult, ValidationError } from './types';
import { ActionInputSchema, extractActionIds } from './schemas';

/**
 * Utility function to safely cast Action to Record for schema functions
 */
function toRecord(action: Action): Record<string, unknown> {
  return action as unknown as Record<string, unknown>;
}
import { 
  validateUniqueIds, 
  validateReferences, 
  validateDependencies,
  validateConditions,
  validateTargets,
  categorizeActions
} from './validators';
import { errorToValidationError, SchemaValidationError } from './errors';

/**
 * DSL Parser class for validating and parsing Action DSL JSON
 */
export class DSLParser {
  /**
   * Parse JSON string into validated action graph
   */
  parse(json: string): ParserResult {
    try {
      const parsed = JSON.parse(json);
      return this.parseObject(parsed);
    } catch (error) {
      return {
        success: false,
        errors: [errorToValidationError(error)]
      };
    }
  }

  /**
   * Parse JavaScript object into validated action graph
   */
  parseObject(obj: object): ParserResult {
    const errors: ValidationError[] = [];

    // Step 1: Schema validation
    const schemaResult = ActionInputSchema.safeParse(obj);
    if (!schemaResult.success) {
      const zodErrors = schemaResult.error.issues || [];
      const schemaErrors = zodErrors.map((err, index) => {
        const path = (err.path && err.path.length > 0) ? err.path.join('.') : 'root';
        const message = `Schema validation failed at ${path}: ${err.message}`;
        return new SchemaValidationError(message, index).toValidationError();
      });
      
      // Fallback if no specific errors
      if (schemaErrors.length === 0) {
        schemaErrors.push(new SchemaValidationError('Schema validation failed', 0).toValidationError());
      }
      
      return {
        success: false,
        errors: schemaErrors
      };
    }

    const { actions } = schemaResult.data as { actions: Action[] };

    // Step 2: Semantic validation
    errors.push(...validateUniqueIds(actions));
    errors.push(...validateReferences(actions));
    errors.push(...validateConditions(actions));
    errors.push(...validateTargets(actions));

    // If there are validation errors, return early
    if (errors.length > 0) {
      return {
        success: false,
        errors
      };
    }

    // Step 3: Dependency analysis
    const { 
      errors: depErrors, 
      dependencies, 
      executionOrder 
    } = validateDependencies(actions);
    
    errors.push(...depErrors);

    if (errors.length > 0) {
      return {
        success: false,
        errors
      };
    }

    // Step 4: Build action graph
    const graph = this.buildActionGraph(actions, dependencies, executionOrder);

    return {
      success: true,
      graph
    };
  }

  /**
   * Build the final action graph from validated actions
   */
  private buildActionGraph(
    actions: Action[], 
    dependencies: Map<string, Set<string>>,
    executionOrder: string[]
  ): ActionGraph {
    const nodes = new Map<string, ActionNode>();
    
    // Create nodes for all actions with IDs
    actions.forEach((action, index) => {
      const ids = extractActionIds(toRecord(action));
      
      if (ids.length > 0) {
        ids.forEach(id => {
          const deps = dependencies.get(id) || new Set();
          const dependents = this.calculateDependents(id, dependencies);
          
          nodes.set(id, {
            action,
            dependencies: deps,
            dependents,
            status: deps.size === 0 ? 'ready' : 'pending'
          });
        });
      } else if (action.type !== 'reason') {
        // Create synthetic nodes for actions without IDs (like show_modal)
        const syntheticId = `${action.type}_${index}`;
        nodes.set(syntheticId, {
          action,
          dependencies: new Set(),
          dependents: new Set(),
          status: 'ready'
        });
      }
    });

    // Categorize actions  
    const { assetActions, gameActions } = categorizeActions(actions);

    return {
      nodes,
      executionOrder: executionOrder.filter(id => nodes.has(id)),
      assetActions: assetActions.filter(id => nodes.has(id)),
      gameActions: gameActions.filter(id => nodes.has(id))
    };
  }

  /**
   * Calculate which actions depend on a given action
   */
  private calculateDependents(
    actionId: string, 
    dependencies: Map<string, Set<string>>
  ): Set<string> {
    const dependents = new Set<string>();
    
    for (const [id, deps] of dependencies) {
      if (deps.has(actionId)) {
        dependents.add(id);
      }
    }
    
    return dependents;
  }

  /**
   * Get execution statistics from a parsed result
   */
  static getExecutionStats(result: ParserResult): {
    totalActions: number;
    assetActions: number;
    gameActions: number;
    readyActions: number;
  } | null {
    if (!result.success || !result.graph) {
      return null;
    }

    const { graph } = result;
    const readyActions = Array.from(graph.nodes.values())
      .filter(node => node.status === 'ready').length;

    return {
      totalActions: graph.nodes.size,
      assetActions: graph.assetActions.length,
      gameActions: graph.gameActions.length,
      readyActions
    };
  }

  /**
   * Validate that a graph is ready for execution
   */
  static validateGraphReadiness(graph: ActionGraph): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Check that execution order includes all nodes
    const orderSet = new Set(graph.executionOrder);
    const nodeSet = new Set(graph.nodes.keys());
    
    for (const nodeId of nodeSet) {
      if (!orderSet.has(nodeId)) {
        errors.push({
          type: 'circular_dependency',
          message: `Action ${nodeId} is not in execution order`,
          actionId: nodeId
        });
      }
    }
    
    // Check that all asset actions come before game actions in execution order
    const assetSet = new Set(graph.assetActions);
    const gameSet = new Set(graph.gameActions);
    
    let foundGameAction = false;
    for (const actionId of graph.executionOrder) {
      if (gameSet.has(actionId)) {
        foundGameAction = true;
      } else if (assetSet.has(actionId) && foundGameAction) {
        errors.push({
          type: 'circular_dependency',
          message: `Asset action ${actionId} comes after game actions in execution order`,
          actionId
        });
      }
    }
    
    return errors;
  }

  /**
   * Create a minimal parser result for empty action lists
   */
  static createEmptyResult(): ParserResult {
    return {
      success: true,
      graph: {
        nodes: new Map(),
        executionOrder: [],
        assetActions: [],
        gameActions: []
      }
    };
  }
}

/**
 * Convenience function for one-off parsing
 */
export function parseActionDSL(json: string): ParserResult {
  const parser = new DSLParser();
  return parser.parse(json);
}

/**
 * Convenience function for parsing objects
 */
export function parseActionObject(obj: object): ParserResult {
  const parser = new DSLParser();
  return parser.parseObject(obj);
}