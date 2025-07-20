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