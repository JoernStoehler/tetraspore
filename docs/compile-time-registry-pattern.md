# Compile-Time Registry Pattern Research

## Current Runtime Registry

Our current implementation uses a runtime registry where components are registered at app startup:

```typescript
// main.tsx
registry.register('TreeView', TreeView)
registry.register('GameControls', GameControls)
```

## Standard Compile-Time Patterns

### 1. **Module Declaration Merging** (TypeScript Standard)

```typescript
// components/tree/TreeView.tsx
declare module '@/dsl/registry' {
  interface RegisteredComponents {
    TreeView: typeof TreeView
  }
}

// Usage gets type checking:
const Component = registry.get<'TreeView'>('TreeView') // Type-safe!
```

**Pros**: 
- Zero runtime overhead
- Full TypeScript integration
- Distributed registration (each component registers itself)

**Cons**: 
- Requires TypeScript module augmentation knowledge
- Can be fragile with build tools

### 2. **Build-Time Code Generation** (Industry Standard)

Many large projects use code generation:

```typescript
// build-registry.js (build script)
const components = glob.sync('./src/components/**/index.tsx')
const registryCode = generateRegistryModule(components)
fs.writeFileSync('./src/generated/registry.ts', registryCode)
```

**Pros**: 
- Automatic discovery of components
- Single source of truth
- Can generate types, docs, etc.

**Cons**: 
- Requires build tooling
- Additional build step complexity

### 3. **Const Assertion Pattern** (Simple TypeScript)

```typescript
// registry.ts
export const componentRegistry = {
  TreeView,
  GameControls,
} as const

export type ComponentName = keyof typeof componentRegistry
export type ComponentType<T extends ComponentName> = typeof componentRegistry[T]

// Usage is fully typed:
const tree = componentRegistry.TreeView // Type-safe!
```

**Pros**: 
- Simple and idiomatic TypeScript
- No build tools needed
- Excellent IDE support

**Cons**: 
- Central file must import all components
- Not as flexible as runtime registry

## Recommendation for Tetraspore

Given our LLM-driven architecture, I recommend **keeping the runtime registry** with these improvements:

```typescript
// Enhanced registry with type safety
export class Registry<T extends Record<string, ComponentType<any>>> {
  private components = new Map<keyof T, T[keyof T]>()
  
  register<K extends keyof T>(name: K, component: T[K]): void {
    this.components.set(name, component)
  }
  
  get<K extends keyof T>(name: K): T[K] | undefined {
    return this.components.get(name) as T[K]
  }
}

// Type-safe registry instance
export const registry = new Registry<{
  TreeView: typeof TreeView
  GameControls: typeof GameControls
}>()
```

This gives us:
- Runtime flexibility for LLM integration
- Type safety for development
- No build complexity

## Why Runtime Registry Makes Sense Here

1. **LLM Integration**: The LLM needs to dynamically reference components by string name
2. **Plugin Architecture**: Future components can be added without recompiling
3. **Testing**: Easy to mock/swap components for testing
4. **Simplicity**: No build tools or code generation needed

The slight runtime cost (a Map lookup) is negligible compared to the flexibility gained for our LLM-driven use case.