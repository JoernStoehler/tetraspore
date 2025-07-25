# DSL Parser Specification

## Overview

The DSL Parser is responsible for parsing, validating, and preparing Action DSL JSON for execution. It transforms raw JSON into a validated action graph ready for execution.

## Architecture

```
JSON Input → Schema Validation → Semantic Validation → Dependency Analysis → Action Graph
```

## Components

### 1. Schema Validator

**Purpose**: Ensure JSON structure matches the DSL specification

**Implementation**:
- Use Zod or JSON Schema for validation
- Validate all required fields are present
- Ensure enum values are valid
- Type-check all fields

**Example**:
```typescript
const ActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("reason"),
    ephemeral_reasoning: z.string()
  }),
  z.object({
    type: z.literal("asset_image"),
    id: z.string(),
    prompt: z.string(),
    size: z.enum(["1024x768", "768x1024", "1024x1024"]),
    model: z.enum(["flux-schnell", "sdxl"])
  }),
  // ... other action types
]);

const ActionsSchema = z.object({
  actions: z.array(ActionSchema)
});
```

### 2. Semantic Validator

**Purpose**: Validate semantic correctness beyond schema

**Validations**:

#### ID Uniqueness
- All asset IDs must be unique within the action set
- Build a Set of IDs and check for duplicates
- Error: "Duplicate ID: {id}"

#### Reference Validation
- All referenced IDs must exist in the action set
- Build ID registry first, then validate references
- Check: cutscene image_id/subtitle_id, play_cutscene cutscene_id
- Error: "Unknown reference: {id}"

#### Condition Path Validation
- Validate condition strings are valid dot-notation paths
- Check against known game state schema
- Error: "Invalid condition path: {path}"

#### Feature Type Validation
- Validate feature_type against known feature types
- Error: "Unknown feature type: {type}"

### 3. Dependency Analyzer

**Purpose**: Build execution order from implicit dependencies

**Algorithm**:
1. Create directed graph of dependencies
2. Detect cycles using DFS
3. Generate topological sort for execution order

**Dependencies**:
- `asset_cutscene` depends on referenced `asset_image` and `asset_subtitle`
- `play_cutscene` depends on referenced `asset_cutscene`
- `show_modal` depends on referenced assets
- Actions within `when_then` depend on the condition evaluation
- Player choice reactions execute after choice selection

**Error Cases**:
- Circular dependencies: "Circular dependency detected: A → B → C → A"
- Missing dependencies: handled by reference validation

### 4. Action Graph Builder

**Purpose**: Transform validated actions into executable graph

**Output Structure**:
```typescript
interface ActionNode {
  action: Action;
  dependencies: Set<string>; // IDs this action depends on
  dependents: Set<string>;   // IDs that depend on this action
  status: 'pending' | 'ready' | 'executing' | 'completed' | 'failed';
}

interface ActionGraph {
  nodes: Map<string, ActionNode>;
  executionOrder: string[]; // Topologically sorted IDs
  assetActions: string[];   // IDs of asset creation actions
  gameActions: string[];    // IDs of game state actions
}
```

## Parser API

```typescript
interface ParserResult {
  success: boolean;
  graph?: ActionGraph;
  errors?: ValidationError[];
}

interface ValidationError {
  type: 'schema' | 'duplicate_id' | 'unknown_reference' | 'circular_dependency' | 'invalid_condition';
  message: string;
  actionIndex?: number;
  actionId?: string;
  path?: string;
}

class DSLParser {
  parse(json: string): ParserResult;
  parseObject(obj: object): ParserResult;
}
```

## Error Reporting

Errors should be descriptive and actionable:

```json
{
  "success": false,
  "errors": [
    {
      "type": "unknown_reference",
      "message": "Unknown image reference 'planet_surfce' in cutscene 'intro_cutscene'. Did you mean 'planet_surface'?",
      "actionIndex": 5,
      "actionId": "intro_cutscene"
    }
  ]
}
```

## Performance Considerations

- Parse in single pass where possible
- Build indices for O(1) ID lookups
- Use efficient cycle detection (Tarjan's algorithm)
- Cache parsed results for repeated execution

## Testing Strategy

### Unit Tests
1. Valid DSL examples should parse successfully
2. Each validation rule should have positive and negative tests
3. Edge cases: empty actions, single action, deeply nested conditions

### Integration Tests
1. Parse example cutscenes from files
2. Validate against known game state schemas
3. Test with LLM-generated output

### Property Tests
1. Any valid schema should not crash parser
2. Circular dependencies always detected
3. Execution order respects dependencies

## Example Usage

```typescript
const parser = new DSLParser();
const result = parser.parse(jsonString);

if (result.success) {
  const { graph } = result;
  // Execute asset actions in parallel
  await Promise.all(
    graph.assetActions.map(id => 
      executeAction(graph.nodes.get(id).action)
    )
  );
  
  // Execute game actions in order
  for (const id of graph.gameActions) {
    await executeAction(graph.nodes.get(id).action);
  }
} else {
  console.error("Parsing failed:", result.errors);
}
```

## Future Enhancements

1. **Streaming Parser**: Parse and execute actions as they arrive
2. **Partial Execution**: Resume from failed actions
3. **Dry Run Mode**: Validate without executing
4. **Optimization**: Detect and merge similar asset requests
5. **Caching**: Skip regenerating identical assets