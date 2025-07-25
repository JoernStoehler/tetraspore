/**
 * Zod schemas for Action DSL validation
 */

import { z } from 'zod';

// Base schema for actions (unused but kept for reference)
// const BaseActionSchema = z.object({
//   type: z.string(),
// });

// Reason action schema
export const ReasonActionSchema = z.object({
  type: z.literal('reason'),
  ephemeral_reasoning: z.string(),
});

// Asset image action schema
export const AssetImageActionSchema = z.object({
  type: z.literal('asset_image'),
  id: z.string(),
  prompt: z.string(),
  size: z.enum(['1024x768', '768x1024', '1024x1024']),
  model: z.enum(['flux-schnell', 'sdxl']),
});

// Asset subtitle action schema
export const AssetSubtitleActionSchema = z.object({
  type: z.literal('asset_subtitle'),
  id: z.string(),
  text: z.string(),
  voice_tone: z.enum(['epic', 'mysterious', 'calm', 'urgent', 'triumphant']),
  voice_gender: z.enum(['neutral', 'feminine', 'masculine']),
  voice_pace: z.enum(['slow', 'normal', 'fast']),
  model: z.enum(['openai-tts', 'google-tts']),
});

// Cutscene shot schema
export const CutsceneShotSchema = z.object({
  image_id: z.string(),
  subtitle_id: z.string(),
  duration: z.number().positive(),
  animation: z.enum(['none', 'slow_zoom', 'pan_left', 'pan_right', 'fade']),
});

// Asset cutscene action schema
export const AssetCutsceneActionSchema = z.object({
  type: z.literal('asset_cutscene'),
  id: z.string(),
  shots: z.array(CutsceneShotSchema).min(1),
});

// Play cutscene action schema
export const PlayCutsceneActionSchema = z.object({
  type: z.literal('play_cutscene'),
  cutscene_id: z.string(),
});

// Show modal action schema
export const ShowModalActionSchema = z.object({
  type: z.literal('show_modal'),
  title: z.string(),
  content: z.string(),
  image_id: z.string().nullable(),
  subtitle_id: z.string().nullable(),
});

// Add feature action schema
export const AddFeatureActionSchema = z.object({
  type: z.literal('add_feature'),
  feature_type: z.string(),
  feature_data: z.object({}).passthrough(), // Allow any object structure
  target: z.string(),
});

// Remove feature action schema
export const RemoveFeatureActionSchema = z.object({
  type: z.literal('remove_feature'),
  feature_type: z.string(),
  target: z.string(),
});

// Forward reference for recursive when_then actions
export const ActionSchema: z.ZodSchema = z.lazy(() => 
  z.discriminatedUnion('type', [
    ReasonActionSchema,
    AssetImageActionSchema,
    AssetSubtitleActionSchema,
    AssetCutsceneActionSchema,
    PlayCutsceneActionSchema,
    ShowModalActionSchema,
    AddFeatureActionSchema,
    RemoveFeatureActionSchema,
    WhenThenActionSchema,
    AddPlayerChoiceActionSchema,
  ])
);

// When then action schema (needs to be defined after ActionSchema)
export const WhenThenActionSchema = z.object({
  type: z.literal('when_then'),
  condition: z.string(),
  action: ActionSchema,
});

// Player choice option schema
export const PlayerChoiceOptionSchema = z.object({
  label: z.string(),
  description: z.string(),
  reactions: z.array(ActionSchema),
});

// Add player choice action schema
export const AddPlayerChoiceActionSchema = z.object({
  type: z.literal('add_player_choice'),
  id: z.string(),
  prompt: z.string(),
  options: z.array(PlayerChoiceOptionSchema).min(1),
});

// Main actions input schema
export const ActionInputSchema = z.object({
  actions: z.array(ActionSchema),
});

// Helper schemas for validation
export const ImageSizeSchema = z.enum(['1024x768', '768x1024', '1024x1024']);
export const ImageModelSchema = z.enum(['flux-schnell', 'sdxl']);
export const VoiceToneSchema = z.enum(['epic', 'mysterious', 'calm', 'urgent', 'triumphant']);
export const VoiceGenderSchema = z.enum(['neutral', 'feminine', 'masculine']);
export const VoicePaceSchema = z.enum(['slow', 'normal', 'fast']);
export const TTSModelSchema = z.enum(['openai-tts', 'google-tts']);
export const AnimationSchema = z.enum(['none', 'slow_zoom', 'pan_left', 'pan_right', 'fade']);

/**
 * Type guards for action types
 */
export function isAssetAction(action: Record<string, unknown>): boolean {
  return ['asset_image', 'asset_subtitle', 'asset_cutscene'].includes(action.type as string);
}

export function isGameAction(action: Record<string, unknown>): boolean {
  return [
    'play_cutscene',
    'show_modal', 
    'add_feature',
    'remove_feature',
    'when_then',
    'add_player_choice'
  ].includes(action.type as string);
}

export function hasId(action: Record<string, unknown>): action is { id: string } {
  return typeof action.id === 'string';
}

/**
 * Extract all IDs from an action (including nested ones)
 */
export function extractActionIds(action: Record<string, unknown>): string[] {
  const ids: string[] = [];
  
  if (hasId(action)) {
    ids.push(action.id);
  }
  
  // Handle nested actions in player choices
  if (action.type === 'add_player_choice' && Array.isArray(action.options)) {
    for (const option of action.options) {
      if (option && typeof option === 'object' && Array.isArray(option.reactions)) {
        for (const reaction of option.reactions) {
          if (reaction && typeof reaction === 'object') {
            ids.push(...extractActionIds(reaction as Record<string, unknown>));
          }
        }
      }
    }
  }
  
  // Handle nested actions in when_then
  if (action.type === 'when_then' && action.action && typeof action.action === 'object') {
    ids.push(...extractActionIds(action.action as Record<string, unknown>));
  }
  
  return ids;
}

/**
 * Extract all referenced IDs from an action
 */
export function extractReferencedIds(action: Record<string, unknown>): string[] {
  const refs: string[] = [];
  
  switch (action.type) {
    case 'asset_cutscene':
      if (Array.isArray(action.shots)) {
        for (const shot of action.shots) {
          if (shot && typeof shot === 'object') {
            const shotObj = shot as Record<string, unknown>;
            if (typeof shotObj.image_id === 'string') refs.push(shotObj.image_id);
            if (typeof shotObj.subtitle_id === 'string') refs.push(shotObj.subtitle_id);
          }
        }
      }
      break;
      
    case 'play_cutscene':
      if (typeof action.cutscene_id === 'string') refs.push(action.cutscene_id);
      break;
      
    case 'show_modal':
      if (typeof action.image_id === 'string') refs.push(action.image_id);
      if (typeof action.subtitle_id === 'string') refs.push(action.subtitle_id);
      break;
      
    case 'add_player_choice':
      if (Array.isArray(action.options)) {
        for (const option of action.options) {
          if (option && typeof option === 'object' && Array.isArray(option.reactions)) {
            for (const reaction of option.reactions) {
              if (reaction && typeof reaction === 'object') {
                refs.push(...extractReferencedIds(reaction as Record<string, unknown>));
              }
            }
          }
        }
      }
      break;
      
    case 'when_then':
      if (action.action && typeof action.action === 'object') {
        refs.push(...extractReferencedIds(action.action as Record<string, unknown>));
      }
      break;
  }
  
  return refs;
}