/**
 * TypeScript interfaces for the Action DSL Parser
 * Based on the Action DSL Specification
 */

// Base action interface
export interface BaseAction {
  type: string;
}

// Individual action types
export interface ReasonAction extends BaseAction {
  type: 'reason';
  id?: string;
  ephemeral_reasoning: string;
}

export interface AssetImageAction extends BaseAction {
  type: 'asset_image';
  id: string;
  prompt: string;
  size: '1024x768' | '768x1024' | '1024x1024';
  model: 'flux-schnell' | 'sdxl';
}

export interface AssetSubtitleAction extends BaseAction {
  type: 'asset_subtitle';
  id: string;
  text: string;
  voice_tone: 'epic' | 'mysterious' | 'calm' | 'urgent' | 'triumphant';
  voice_gender: 'neutral' | 'feminine' | 'masculine';
  voice_pace: 'slow' | 'normal' | 'fast';
  model: 'openai-tts' | 'google-tts';
}

export interface CutsceneShot {
  image_id: string;
  subtitle_id: string;
  duration: number;
  animation: 'none' | 'slow_zoom' | 'pan_left' | 'pan_right' | 'fade';
}

export interface AssetCutsceneAction extends BaseAction {
  type: 'asset_cutscene';
  id: string;
  shots: CutsceneShot[];
}

export interface PlayCutsceneAction extends BaseAction {
  type: 'play_cutscene';
  cutscene_id: string;
}

export interface ShowModalAction extends BaseAction {
  type: 'show_modal';
  title: string;
  content: string;
  image_id: string | null;
  subtitle_id: string | null;
}

export interface AddFeatureAction extends BaseAction {
  type: 'add_feature';
  feature_type: string;
  feature_data: object;
  target: string;
}

export interface RemoveFeatureAction extends BaseAction {
  type: 'remove_feature';
  feature_type: string;
  target: string;
}

export interface WhenThenAction extends BaseAction {
  type: 'when_then';
  id?: string;
  condition: string;
  action: Action;
}

export interface PlayerChoiceOption {
  label: string;
  description: string;
  reactions: Action[];
}

export interface AddPlayerChoiceAction extends BaseAction {
  type: 'add_player_choice';
  id: string;
  prompt: string;
  options: PlayerChoiceOption[];
}

// Union type for all actions
export type Action = 
  | ReasonAction
  | AssetImageAction
  | AssetSubtitleAction
  | AssetCutsceneAction
  | PlayCutsceneAction
  | ShowModalAction
  | AddFeatureAction
  | RemoveFeatureAction
  | WhenThenAction
  | AddPlayerChoiceAction;

// Parser-specific interfaces
export interface ActionNode {
  action: Action;
  dependencies: Set<string>;
  dependents: Set<string>;
  status: 'pending' | 'ready' | 'executing' | 'completed' | 'failed';
}

export interface ActionGraph {
  nodes: Map<string, ActionNode>;
  executionOrder: string[];
  assetActions: string[];   // Actions that create assets
  gameActions: string[];    // Actions that modify game state
}

export interface ValidationError {
  type: 'schema' | 'duplicate_id' | 'unknown_reference' | 'circular_dependency' | 'invalid_condition' | 'invalid_target';
  message: string;
  actionIndex?: number;
  actionId?: string;
  path?: string;
}

export interface ParserResult {
  success: boolean;
  graph?: ActionGraph;
  errors?: ValidationError[];
}

// Input format for the parser
export interface ActionInput {
  actions: Action[];
}

// Helper types for categorization
export type AssetAction = AssetImageAction | AssetSubtitleAction | AssetCutsceneAction;
export type GameAction = PlayCutsceneAction | ShowModalAction | AddFeatureAction | RemoveFeatureAction | WhenThenAction | AddPlayerChoiceAction;