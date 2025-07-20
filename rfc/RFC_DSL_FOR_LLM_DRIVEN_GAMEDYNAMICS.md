# DSL Implementation Specification & Prototype Requirements

## Overview

Implement a unified JSON-based DSL that serves as the single language for game state, actions, and UI definitions. The DSL should be optimized for LLM interaction while providing clean mapping to React components.

## Core Architecture

**Information Flow**:
1. Zustand State gets converted to State-DSL format and serialized as JSON for the LLM
2. LLM reads the state and outputs Action-DSL commands  
3. Action processor applies the DSL actions to update the Zustand State
4. React re-renders based on the updated state using DSL-defined UI components
5. Player actions generate immediate DSL actions (often pre-authored reaction scripts) that update state without LLM involvement

## DSL Specification

### State-DSL Format

**Game State Structure**:
```json
{
  "metadata": {
    "turn": 1,
    "yearsPerTurn": 50,
    "phase": "biological_evolution"
  },
  "world": {
    "species": {
      "moss_001": {
        "id": "moss_001",
        "name": "Basic Moss",
        "description": "Simple photosynthetic organism",
        "traits": {
          "photosynthetic": {"value": 0.8, "description": "Converts sunlight to energy"},
          "reproduction_rate": {"value": 0.5, "description": "Rate of population growth"}
        },
        "population": {"size": "common", "trend": "stable"},
        "parent": null,
        "children": []
      }
    }
  },
  "ui": {
    "activeViews": ["tree_of_life"],
    "pendingChoices": [],
    "components": {}
  }
}
```

### Action-DSL Format

**LLM Turn Actions**:
```json
{
  "turnActions": [
    {
      "type": "SetTurnDuration",
      "years": 75
    },
    {
      "type": "CreateSpeciesMutation",
      "parentId": "moss_001",
      "newSpecies": {
        "id": "moss_002", 
        "name": "Hardy Moss",
        "description": "Moss adapted to harsh conditions",
        "traits": {
          "photosynthetic": {"value": 0.8, "description": "Converts sunlight to energy"},
          "reproduction_rate": {"value": 0.3, "description": "Slower but more reliable reproduction"},
          "cold_resistance": {"value": 0.7, "description": "Survives freezing temperatures"}
        }
      }
    },
    {
      "type": "CreatePlayerChoice",
      "id": "environmental_pressure",
      "prompt": "A harsh winter is approaching. How should evolution respond?",
      "options": [
        {
          "id": "favor_hardy",
          "text": "Favor cold-resistant variants",
          "reactions": [
            {"type": "BoostSpeciesPopulation", "speciesId": "moss_002", "factor": 1.5},
            {"type": "ReduceSpeciesPopulation", "speciesId": "moss_001", "factor": 0.7}
          ]
        },
        {
          "id": "maintain_diversity",
          "text": "Maintain genetic diversity", 
          "reactions": [
            {"type": "BoostSpeciesPopulation", "speciesId": "moss_001", "factor": 1.1},
            {"type": "BoostSpeciesPopulation", "speciesId": "moss_002", "factor": 1.1}
          ]
        }
      ]
    }
  ]
}
```

**Player Choice Actions**:
```json
{
  "playerAction": {
    "type": "ExecuteChoice",
    "choiceId": "environmental_pressure",
    "optionId": "favor_hardy",
    "reactions": [
      {"type": "BoostSpeciesPopulation", "speciesId": "moss_002", "factor": 1.5},
      {"type": "ReduceSpeciesPopulation", "speciesId": "moss_001", "factor": 0.7}
    ]
  }
}
```

### UI Component DSL

**Component Definitions**:
```json
{
  "ui": {
    "components": {
      "species_node": {
        "type": "TreeNode",
        "props": {
          "title": "{{species.name}}",
          "subtitle": "Population: {{species.population.size}}",
          "description": "{{species.description}}",
          "collapsible": true
        },
        "actions": [
          {
            "type": "MutationChoice",
            "label": "Guide Mutation",
            "generates": "species_mutation_choice"
          }
        ]
      }
    },
    "views": {
      "tree_of_life": {
        "type": "TreeView",
        "title": "Species Evolution",
        "data": "{{world.species}}",
        "nodeComponent": "species_node"
      }
    }
  }
}
```

## Implementation Requirements

### 1. DSL Parser & Validator

**Required Functions**:
```typescript
interface DSLParser {
  parseState(zustandState: GameState): StateDSL;
  parseActions(llmOutput: string): ActionDSL;
  validateActions(actions: ActionDSL): ValidationResult;
  applyActions(actions: ActionDSL, state: GameState): GameState;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}
```

### 2. Action Processor

**Core Action Types to Implement**:
- `SetTurnDuration`: Update turn metadata
- `CreateSpeciesMutation`: Add new species with parent relationship
- `BoostSpeciesPopulation`: Increase species population
- `ReduceSpeciesPopulation`: Decrease species population  
- `CreatePlayerChoice`: Add choice to pending choices
- `ExecuteChoice`: Apply choice reactions immediately

### 3. UI Component Registry

**React Component Mapping**:
```typescript
interface ComponentRegistry {
  register(dslType: string, reactComponent: React.FC<any>): void;
  render(dslComponent: DSLComponent, props: any): React.ReactElement;
}

// Example Registration
registry.register("TreeNode", SpeciesTreeNode);
registry.register("TreeView", SpeciesTreeView);
```

### 4. Templating Engine

**Variable Interpolation**: Support `{{path.to.value}}` syntax
**Simple Conditionals**: Support basic `{{condition ? valueA : valueB}}` expressions

### 5. HTML Subset Parser

**Allowed Elements**: `<p>, <strong>, <em>, <span>, <br>, <icon>`
**Allowed Attributes**: `style="color: #hex"`, `name`, `size`, `color` (for icons)
**Validation**: Whitelist approach, reject any non-allowed elements

## Prototype Specification

### Goal
Create a simple tree-of-life mutation game that demonstrates the DSL architecture working end-to-end.

### Features to Implement

**1. Species Tree Visualization**
- Display species as nodes in a tree structure
- Show parent-child evolutionary relationships
- Each node displays: name, description, population status
- Collapsible nodes to manage complexity

**2. LLM-Driven Evolution**
- LLM generates new species mutations periodically
- Species get traits with numerical values (0.0 to 1.0)
- Population dynamics (growing/stable/declining/extinct)

**3. Single Choice Type: Environmental Pressure**
- LLM occasionally presents environmental challenges
- Player chooses how evolution responds
- Immediate visual feedback as reactions execute

**4. Turn-Based Progression**
- "Next Turn" button triggers LLM processing
- Turn counter and years-per-turn display
- Visual loading state during LLM calls

### Sample Game Flow

1. **Initial State**: Single species "Basic Moss" 
2. **Turn 1**: LLM creates a mutation → "Hardy Moss" appears as child node
3. **Turn 2**: LLM presents environmental choice → Player selects response
4. **Turn 3**: LLM creates another mutation branch
5. **Continue**: More species, more choices, tree grows

### Technical Requirements

**Stack**: React + TypeScript + Zustand + TailwindCSS
**LLM Integration**: OpenAI API (mock responses acceptable for prototype)
**Validation**: JSON Schema validation for DSL structures
**Testing**: Unit tests for action processor and templating engine

### Deliverables

1. **Working Prototype**: Demonstrates full DSL → React → Player → DSL loop
2. **Code Documentation**: Clear examples of adding new action types and UI components
3. **DSL Examples**: JSON files showing valid state and action formats
4. **Demo Video**: 2-3 minute walkthrough of prototype functionality

### Success Criteria

- [ ] LLM can output valid Action-DSL that updates game state
- [ ] React renders UI based purely on DSL definitions
- [ ] Player choices execute pre-authored reaction scripts instantly
- [ ] New species appear in tree visualization with correct parent relationships
- [ ] Turn progression works smoothly with visual feedback

### Implementation Notes

**Start Simple**: Begin with hardcoded DSL components, add dynamic generation later
**Mock LLM**: Use pre-written JSON responses to avoid API dependencies during development
**Focus on Architecture**: Ensure clean separation between DSL, game logic, and UI
**Extensibility**: Design component registry and action processor to easily add new types

## Example Files Needed

**Initial State JSON**: Complete valid state for game start
**Sample LLM Responses**: 3-4 example turn actions in valid format
**Component Definitions**: DSL definitions for all UI components
**Action Schemas**: JSON schemas for validation

This prototype will validate the core architecture and provide a foundation for the full evolution game.