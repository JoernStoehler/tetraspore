/**
 * @agent-note Loads and validates scenario JSON files for MockLLM
 * @integration-point MockLLM uses this to load game scenarios dynamically
 * @error-handling Returns default scenario if loading fails, logs errors to console
 */

import type { MockScenarioFile } from './types';
import defaultScenarioData from './default.json';

export class ScenarioLoader {
  private cache: Map<string, MockScenarioFile> = new Map();
  
  /**
   * Load a scenario by ID
   * @param scenarioId - The scenario ID to load (e.g., 'default')
   * @returns The loaded scenario or default if not found
   */
  async loadScenario(scenarioId: string): Promise<MockScenarioFile> {
    // Check cache first
    if (this.cache.has(scenarioId)) {
      return this.cache.get(scenarioId)!;
    }
    
    try {
      // In a real implementation, this could load from different sources
      // For now, we only have the default scenario
      if (scenarioId === 'default') {
        // Type assertion needed due to JSON import limitations
        const scenario = defaultScenarioData as unknown as MockScenarioFile;
        this.validateScenario(scenario);
        this.cache.set(scenarioId, scenario);
        return scenario;
      }
      
      // Could add dynamic imports here for other scenarios
      // const module = await import(`./${scenarioId}.json`);
      // const scenario = module.default as MockScenarioFile;
      
      console.warn(`Scenario '${scenarioId}' not found, using default`);
      return this.loadScenario('default');
    } catch (error) {
      console.error(`Failed to load scenario '${scenarioId}':`, error);
      return this.loadScenario('default');
    }
  }
  
  /**
   * Validate scenario structure
   * @throws Error if scenario is invalid
   */
  private validateScenario(scenario: MockScenarioFile): void {
    if (!scenario.metadata?.id) {
      throw new Error('Scenario missing metadata.id');
    }
    
    if (!Array.isArray(scenario.fixedTurns)) {
      throw new Error('Scenario missing fixedTurns array');
    }
    
    if (!Array.isArray(scenario.evolutionPaths)) {
      throw new Error('Scenario missing evolutionPaths array');
    }
    
    if (!Array.isArray(scenario.extinctionReasons)) {
      throw new Error('Scenario missing extinctionReasons array');
    }
    
    // Validate fixed turns
    scenario.fixedTurns.forEach((turn, index) => {
      if (typeof turn.turn !== 'number') {
        throw new Error(`Fixed turn ${index} missing turn number`);
      }
      if (!Array.isArray(turn.actions)) {
        throw new Error(`Fixed turn ${index} missing actions array`);
      }
    });
  }
  
  /**
   * List available scenarios
   * @returns Array of scenario IDs
   */
  listScenarios(): string[] {
    // In a real implementation, this could scan a directory
    return ['default'];
  }
  
  /**
   * Clear the scenario cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const scenarioLoader = new ScenarioLoader();