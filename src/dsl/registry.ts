/**
 * @agent-note Component Registry - Dynamic UI component management
 * @integration-point Allows LLM to reference UI components by name in DSL
 * @architecture-context Enables data-driven UI without hardcoding component references
 * 
 * How it works:
 * 1. Components are registered at app startup (see main.tsx)
 * 2. LLM can reference components by name in DSL output
 * 3. React dynamically renders the requested component
 * 
 * Current registered components:
 * - TreeView: Renders the species evolution tree
 * - GameControls: Shows turn controls and game state
 * 
 * Adding new components:
 * 1. Create component in src/components/
 * 2. Define props interface extending DSL types
 * 3. Register in main.tsx: registry.register('Name', Component)
 * 4. LLM can now use it: { "component": "Name", "props": {...} }
 * 
 * Common mistakes:
 * - Forgetting to register component before LLM references it
 * - Component name mismatch between registration and LLM usage
 * - Props type mismatch between component and DSL
 * 
 * Testing: Use registry.getNames() to see all available components
 */

import type { ComponentType } from 'react';
import type { ComponentRegistry } from './interfaces';

export class Registry implements ComponentRegistry {
  private components = new Map<string, ComponentType<any>>();

  register(name: string, component: ComponentType<any>): void {
    if (!name) {
      throw new Error('Component name is required');
    }
    if (!component) {
      throw new Error('Component is required');
    }
    
    this.components.set(name, component);
  }

  get(name: string): ComponentType<any> | undefined {
    return this.components.get(name);
  }

  getAll(): Map<string, ComponentType<any>> {
    return new Map(this.components);
  }

  // Helper to check if component is registered
  has(name: string): boolean {
    return this.components.has(name);
  }

  // Helper to unregister (useful for testing)
  unregister(name: string): boolean {
    return this.components.delete(name);
  }

  // Helper to clear all registrations (useful for testing)
  clear(): void {
    this.components.clear();
  }

  // Get all registered component names
  getNames(): string[] {
    return Array.from(this.components.keys());
  }
}

// Export singleton instance
export const registry = new Registry();

// Re-export for convenience
export type { ComponentRegistry } from './interfaces';