# Action DSL Specification

## Overview

The Action DSL is a declarative JSON-based language for defining game actions, asset creation, and player interactions in Tetraspore. It's designed to be:
- Simple for LLMs to generate
- Easy to validate with JSON Schema
- Declarative with automatic dependency resolution
- Extensible for future action types

## Core Concepts

### Actions
Actions are the fundamental unit of the DSL. Each action has a `type` field that determines its behavior and required parameters.

### Action Execution
1. All actions in an array are parsed into a dependency graph
2. Asset creation actions are executed in parallel where possible
3. Game state modifications happen in sequence
4. Conditional actions are evaluated at runtime

## Action Types

### 1. Reasoning Action
```json
{
  "type": "reason",
  "ephemeral_reasoning": "string"
}
```
- Used for LLM to document its thought process
- Not executed, serves as documentation
- Helps with debugging and understanding LLM decisions

### 2. Asset Creation Actions

#### asset_image
```json
{
  "type": "asset_image",
  "id": "string",
  "prompt": "string",
  "size": "1024x768" | "768x1024" | "1024x1024",
  "model": "flux-schnell" | "sdxl"
}
```
- Creates an image asset via AI generation
- `id` must be unique within the action set
- `prompt` should follow art style guidelines

#### asset_subtitle
```json
{
  "type": "asset_subtitle",
  "id": "string",
  "text": "string",
  "voice_tone": "epic" | "mysterious" | "calm" | "urgent" | "triumphant",
  "voice_gender": "neutral" | "feminine" | "masculine",
  "voice_pace": "slow" | "normal" | "fast",
  "model": "openai-tts" | "google-tts"
}
```
- Creates audio narration from text
- Voice parameters affect TTS generation
- Duration is calculated after generation

#### asset_cutscene
```json
{
  "type": "asset_cutscene",
  "id": "string",
  "shots": [
    {
      "image_id": "string",
      "subtitle_id": "string",
      "duration": number,
      "animation": "none" | "slow_zoom" | "pan_left" | "pan_right" | "fade"
    }
  ]
}
```
- Assembles images and subtitles into a cutscene
- References existing asset IDs
- Duration in seconds for each shot
- Animation applies to the image during the shot

### 3. Game Actions

#### play_cutscene
```json
{
  "type": "play_cutscene",
  "cutscene_id": "string"
}
```
- Immediately plays a cutscene
- Cutscene must exist (created via asset_cutscene)

#### show_modal
```json
{
  "type": "show_modal",
  "title": "string",
  "content": "string",
  "image_id": "string" | null,
  "subtitle_id": "string" | null
}
```
- Shows an informational modal
- Can include image and/or audio
- Player can close at will

#### add_feature
```json
{
  "type": "add_feature",
  "feature_type": "string",
  "feature_data": object,
  "target": "string"
}
```
- Adds a feature to a game entity
- `target` uses dot notation: "species.primary", "planet.region.north"
- `feature_data` is feature-specific

#### remove_feature
```json
{
  "type": "remove_feature",
  "feature_type": "string",
  "target": "string"
}
```
- Removes a feature from a game entity

### 4. Control Flow Actions

#### when_then
```json
{
  "type": "when_then",
  "condition": "string",
  "action": Action
}
```
- Conditional execution
- `condition` is a game state path that evaluates to boolean
- `action` is any valid action (including another when_then)

#### add_player_choice
```json
{
  "type": "add_player_choice",
  "id": "string",
  "prompt": "string",
  "options": [
    {
      "label": "string",
      "description": "string",
      "reactions": [Action]
    }
  ]
}
```
- Presents a choice to the player
- Each option has reactions that execute when selected
- Reactions can be any action type

## Example: Complete Cutscene Flow

```json
{
  "actions": [
    {
      "type": "reason",
      "ephemeral_reasoning": "Creating intro cutscene for new methane planet"
    },
    {
      "type": "asset_image",
      "id": "planet_space_view",
      "prompt": "Alien planet with methane atmosphere seen from space, orange-brown swirling clouds, speculative astronomy art",
      "size": "1024x768",
      "model": "flux-schnell"
    },
    {
      "type": "asset_image",
      "id": "planet_surface",
      "prompt": "Crystalline formations on alien planet surface, methane atmosphere, orange sky, no Earth-like features",
      "size": "1024x768",
      "model": "flux-schnell"
    },
    {
      "type": "asset_subtitle",
      "id": "intro_narration_1",
      "text": "A new world emerges from the cosmic forge.",
      "voice_tone": "epic",
      "voice_gender": "neutral",
      "voice_pace": "slow",
      "model": "openai-tts"
    },
    {
      "type": "asset_subtitle",
      "id": "intro_narration_2",
      "text": "Beneath clouds of methane, possibility stirs.",
      "voice_tone": "mysterious",
      "voice_gender": "neutral",
      "voice_pace": "normal",
      "model": "openai-tts"
    },
    {
      "type": "asset_cutscene",
      "id": "planet_intro_cutscene",
      "shots": [
        {
          "image_id": "planet_space_view",
          "subtitle_id": "intro_narration_1",
          "duration": 5.0,
          "animation": "slow_zoom"
        },
        {
          "image_id": "planet_surface",
          "subtitle_id": "intro_narration_2",
          "duration": 6.0,
          "animation": "pan_right"
        }
      ]
    },
    {
      "type": "when_then",
      "condition": "game.planet_just_created",
      "action": {
        "type": "play_cutscene",
        "cutscene_id": "planet_intro_cutscene"
      }
    }
  ]
}
```

## Validation Rules

1. **Unique IDs**: All asset IDs must be unique within an action set
2. **Valid References**: All referenced IDs (in cutscenes, play_cutscene, etc.) must exist
3. **No Circular Dependencies**: The action dependency graph must be acyclic
4. **Valid Conditions**: Condition paths must be valid game state accessors
5. **Required Fields**: All fields are required (no optional fields for schema compliance)

## Future Extensions

The DSL is designed to be extended with new action types:
- Environmental effects (weather, time changes)
- Complex game state modifications
- Multi-stage cutscenes with branching
- Procedural content generation triggers

## Implementation Notes

- Actions should be processed in dependency order
- Asset creation can be parallelized
- Failed asset creation should halt execution
- All text fields support Unicode
- Condition evaluation happens at runtime, not parse time