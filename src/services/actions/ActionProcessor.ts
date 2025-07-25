import { parseActionDSL, parseActionObject } from './parser/index.js';
import type { ActionGraph, ActionNode } from './parser/types.js';
import { ImageAssetExecutor } from './executors/ImageAssetExecutor.js';
import { SubtitleAssetExecutor } from './executors/SubtitleAssetExecutor.js';
import { CutsceneAssetExecutor } from './executors/CutsceneAssetExecutor.js';
import type { AssetExecutor, ExecutionContext, AssetResult, AssetStorage, Action as ExecutorAction } from './executors/types.js';
import { LocalAssetStorage } from './storage/LocalAssetStorage.js';

export interface ActionProcessorConfig {
  executors?: {
    asset_image?: AssetExecutor<ExecutorAction, AssetResult>;
    asset_subtitle?: AssetExecutor<ExecutorAction, AssetResult>;
    asset_cutscene?: AssetExecutor<ExecutorAction, AssetResult>;
  };
  storage?: AssetStorage;
  apiKeys?: {
    fluxApiKey?: string;
    openaiApiKey?: string;
  };
}

export interface ProcessResult {
  success: boolean;
  assetsGenerated: AssetResult[];
  actionsExecuted: string[];
  errors: Error[];
  totalCost: number;
  executionTime: number;
}

export interface ProcessorStatus {
  isProcessing: boolean;
  currentAction: string | null;
  progress: number;
  queueLength: number;
}

export interface ProcessorCostBreakdown {
  images: { count: number; cost: number };
  audio: { count: number; cost: number };
  total: number;
}

export class ActionProcessor {
  private executors: Map<string, AssetExecutor<ExecutorAction, AssetResult>>;
  private storage: AssetStorage;
  private apiKeys: { fluxApiKey?: string; openaiApiKey?: string };
  private status: ProcessorStatus;
  private costTracker: Map<string, number>;
  private assetCounts: Map<string, number>;

  constructor(config: ActionProcessorConfig = {}) {
    this.storage = config.storage || new LocalAssetStorage();
    this.apiKeys = config.apiKeys || {};
    
    // Initialize executors with defaults if not provided
    this.executors = new Map();
    if (config.executors?.asset_image) {
      this.executors.set('asset_image', config.executors.asset_image);
    } else {
      this.executors.set('asset_image', new ImageAssetExecutor());
    }
    
    if (config.executors?.asset_subtitle) {
      this.executors.set('asset_subtitle', config.executors.asset_subtitle);
    } else {
      this.executors.set('asset_subtitle', new SubtitleAssetExecutor());
    }
    
    if (config.executors?.asset_cutscene) {
      this.executors.set('asset_cutscene', config.executors.asset_cutscene);
    } else {
      this.executors.set('asset_cutscene', new CutsceneAssetExecutor());
    }

    this.status = {
      isProcessing: false,
      currentAction: null,
      progress: 0,
      queueLength: 0
    };

    this.costTracker = new Map();
    this.assetCounts = new Map();
  }

  async processActions(json: string | object): Promise<ProcessResult> {
    const startTime = Date.now();
    const errors: Error[] = [];
    const assetsGenerated: AssetResult[] = [];
    const actionsExecuted: string[] = [];

    try {
      this.status.isProcessing = true;
      
      // Reset counters for new processing
      this.costTracker.clear();
      this.assetCounts.clear();
      
      // Parse the actions
      const parseResult = typeof json === 'string' 
        ? parseActionDSL(json)
        : parseActionObject(json);

      if (!parseResult.success || !parseResult.graph) {
        const parseErrors = parseResult.errors || [];
        errors.push(...parseErrors.map(e => new Error(e.message)));
        return {
          success: false,
          assetsGenerated: [],
          actionsExecuted: [],
          errors,
          totalCost: 0,
          executionTime: Date.now() - startTime
        };
      }

      const graph = parseResult.graph;
      this.status.queueLength = graph.executionOrder.length;

      // Process actions in execution order
      for (let i = 0; i < graph.executionOrder.length; i++) {
        const actionId = graph.executionOrder[i];
        const node = graph.nodes.get(actionId);
        
        if (!node) continue;

        this.status.currentAction = actionId;
        this.status.progress = (i / graph.executionOrder.length) * 100;

        try {
          const result = await this.executeAction(node, graph, actionId);
          
          // Always mark action as executed
          actionsExecuted.push(actionId);
          
          if (result) {
            // Only add to assetsGenerated if it's actually an asset (not a game action)
            if (result && typeof result === 'object' && 'id' in result && 'type' in result && 
                (result.type === 'image' || result.type === 'audio' || result.type === 'cutscene')) {
              assetsGenerated.push(result as AssetResult & { type: string });
            }
          }
        } catch (error) {
          errors.push(error instanceof Error ? error : new Error(String(error)));
          // Continue processing other actions even if one fails
        }
      }

      const totalCost = this.calculateTotalCost();
      const executionTime = Date.now() - startTime;

      return {
        success: errors.length === 0,
        assetsGenerated,
        actionsExecuted,
        errors,
        totalCost,
        executionTime
      };

    } finally {
      this.status = {
        isProcessing: false,
        currentAction: null,
        progress: 100,
        queueLength: 0
      };
    }
  }

  private async executeAction(node: ActionNode, _graph: ActionGraph, actionId: string): Promise<unknown> {
    const action = node.action;

    // Handle asset actions
    if (action.type.startsWith('asset_')) {
      const executor = this.executors.get(action.type);
      if (!executor) {
        throw new Error(`No executor found for action type: ${action.type}`);
      }

      const context = this.createExecutionContext();
      
      // Estimate cost before execution
      await executor.estimateCost(action as ExecutorAction);
      
      // Execute the action
      const result = await executor.execute(action as ExecutorAction, context);
      
      // Track actual cost
      if (result.cost !== undefined) {
        const currentCost = this.costTracker.get(action.type) || 0;
        this.costTracker.set(action.type, currentCost + result.cost);
      }
      
      // Track asset counts
      const currentCount = this.assetCounts.get(action.type) || 0;
      this.assetCounts.set(action.type, currentCount + 1);

      // Add type field based on action type
      const typedResult = {
        ...(result as AssetResult),
        type: action.type === 'asset_image' ? 'image' : 
              action.type === 'asset_subtitle' ? 'audio' : 
              action.type === 'asset_cutscene' ? 'cutscene' : 
              'unknown'
      };

      // For cutscenes, add the definition property
      if (action.type === 'asset_cutscene' && result.metadata?.shots) {
        (typedResult as AssetResult & { type: string; definition?: unknown }).definition = {
          id: result.id,
          shots: result.metadata.shots
        };
      }

      return typedResult;
    }

    // Handle game actions
    if (action.type === 'play_cutscene') {
      // This will be handled by the React component layer
      // Just mark it as executed
      return { type: 'game_action', id: actionId };
    }

    // Handle when_then actions
    if (action.type === 'when_then') {
      // This requires game state evaluation which happens at the React layer
      // Just mark it as registered
      return { type: 'conditional_action', id: actionId };
    }

    // Handle other action types
    if (action.type === 'reason') {
      // Reasoning actions don't produce output but should be marked as executed
      return { type: 'reasoning', id: actionId };
    }
    
    if (action.type === 'add_player_choice') {
      // Player choice actions register choices in the game
      return { type: 'player_choice', id: actionId };
    }

    throw new Error(`Unknown action type: ${action.type}`);
  }

  private createExecutionContext(): ExecutionContext {
    return {
      apiKeys: this.apiKeys,
      storage: this.storage,
      cache: {
        get: async () => null,
        set: async () => {},
        clear: async () => {}
      },
      rateLimiter: {
        acquire: async () => {
          // Simple rate limiter - can be enhanced
          await new Promise(resolve => setTimeout(resolve, 100));
        },
        reset: () => {}
      },
      costTracker: {
        record: (type: 'image' | 'tts', model: string, units: number) => {
          const key = `${type}_${model}`;
          const cost = type === 'image' ? units * 0.01 : units * 0.006;
          const current = this.costTracker.get(key) || 0;
          this.costTracker.set(key, current + cost);
        },
        getTotalCost: () => this.calculateTotalCost(),
        getCostBreakdown: () => ({
          total: this.calculateTotalCost(),
          byType: { image: this.costTracker.get('image_flux-schnell') || 0, tts: this.costTracker.get('tts_openai-tts') || 0 },
          byModel: {}
        })
      }
    };
  }

  private calculateTotalCost(): number {
    let total = 0;
    for (const cost of this.costTracker.values()) {
      total += cost;
    }
    return total;
  }

  getStatus(): ProcessorStatus {
    return { ...this.status };
  }

  getCostBreakdown(): ProcessorCostBreakdown {
    const images = {
      count: this.assetCounts.get('asset_image') || 0,
      cost: this.costTracker.get('asset_image') || 0
    };
    
    const audio = {
      count: (this.assetCounts.get('asset_subtitle') || 0) + 
             (this.assetCounts.get('asset_cutscene') || 0),
      cost: (this.costTracker.get('asset_subtitle') || 0) + 
            (this.costTracker.get('asset_cutscene') || 0)
    };

    return {
      images,
      audio,
      total: images.cost + audio.cost
    };
  }
}