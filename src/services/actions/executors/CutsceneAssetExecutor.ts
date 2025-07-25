/**
 * Cutscene Asset Executor
 * 
 * Assembles images and audio into cutscene definitions.
 * Validates all referenced assets exist and creates playable cutscene structures.
 */

import { BaseExecutor } from './BaseExecutor';
import {
  AssetCutsceneAction,
  CutsceneAssetResult,
  ExecutionContext,
  ValidationResult,
  ExecutorValidationError,
  CostEstimate,
  CutsceneDefinition,
  CutsceneDefinitionShot
} from './types';

export class CutsceneAssetExecutor extends BaseExecutor<AssetCutsceneAction, CutsceneAssetResult> {

  /**
   * Execute cutscene assembly with validation and error handling
   */
  async execute(action: AssetCutsceneAction, context: ExecutionContext): Promise<CutsceneAssetResult> {
    const startTime = Date.now();

    // Validate action
    this.validateAction(action);

    // Check cache first
    const cached = await this.checkCache(action, context);
    if (cached) {
      return cached;
    }

    // Assemble cutscene with retry logic
    const result = await this.executeWithRetry(
      () => this.assembleCutscene(action, context),
      { action, operation: 'Cutscene assembly' }
    );

    // Store in cache
    await this.storeInCache(action, result, context);

    // Log metrics
    this.logMetrics(action, startTime, result);

    return result;
  }

  /**
   * Validate cutscene action parameters
   */
  validate(action: AssetCutsceneAction): ValidationResult {
    const errors: ExecutorValidationError[] = [];

    // Validate required fields
    if (!action.id?.trim()) {
      errors.push({
        field: 'id',
        message: 'ID is required and cannot be empty',
        code: 'REQUIRED'
      });
    }

    if (!action.shots || !Array.isArray(action.shots)) {
      errors.push({
        field: 'shots',
        message: 'Shots array is required',
        code: 'REQUIRED'
      });
    } else {
      // Validate each shot
      action.shots.forEach((shot, index) => {
        const shotPrefix = `shots[${index}]`;

        if (!shot.image_id?.trim()) {
          errors.push({
            field: `${shotPrefix}.image_id`,
            message: 'Image ID is required for each shot',
            code: 'REQUIRED'
          });
        }

        if (!shot.subtitle_id?.trim()) {
          errors.push({
            field: `${shotPrefix}.subtitle_id`,
            message: 'Subtitle ID is required for each shot',
            code: 'REQUIRED'
          });
        }

        if (!shot.duration || shot.duration <= 0) {
          errors.push({
            field: `${shotPrefix}.duration`,
            message: 'Duration must be a positive number',
            code: 'INVALID_VALUE'
          });
        }

        if (shot.duration && shot.duration > 30) {
          errors.push({
            field: `${shotPrefix}.duration`,
            message: 'Shot duration should not exceed 30 seconds',
            code: 'TOO_LONG'
          });
        }

        const validAnimations = ['fade_in', 'zoom_in', 'pan_left', 'pan_right', 'static'];
        if (!validAnimations.includes(shot.animation)) {
          errors.push({
            field: `${shotPrefix}.animation`,
            message: `Animation must be one of: ${validAnimations.join(', ')}`,
            code: 'INVALID_VALUE'
          });
        }
      });

      // Validate total cutscene length
      const totalDuration = action.shots.reduce((sum, shot) => sum + (shot.duration || 0), 0);
      if (totalDuration > 300) { // 5 minutes max
        errors.push({
          field: 'shots',
          message: 'Total cutscene duration should not exceed 300 seconds (5 minutes)',
          code: 'TOO_LONG'
        });
      }

      if (totalDuration === 0) {
        errors.push({
          field: 'shots',
          message: 'Cutscene must have at least one shot with positive duration',
          code: 'INVALID_VALUE'
        });
      }

      // Check for empty shots array
      if (action.shots.length === 0) {
        errors.push({
          field: 'shots',
          message: 'Cutscene must have at least one shot',
          code: 'REQUIRED'
        });
      }

      if (action.shots.length > 50) {
        errors.push({
          field: 'shots',
          message: 'Cutscene should not have more than 50 shots',
          code: 'TOO_MANY'
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Estimate cost for cutscene assembly (no additional cost)
   */
  estimateCost(): CostEstimate {
    // Cutscene assembly itself has no cost
    // The cost comes from the individual assets being assembled
    return {
      min: 0,
      max: 0,
      currency: 'USD'
    };
  }

  /**
   * Assemble cutscene from referenced assets
   */
  private async assembleCutscene(action: AssetCutsceneAction, context: ExecutionContext): Promise<CutsceneAssetResult> {
    // 1. Validate all referenced assets exist
    await this.validateReferences(action, context);

    // 2. Build cutscene definition
    const definition = await this.buildCutsceneDefinition(action, context);

    // 3. Validate timing and provide warnings
    this.validateTiming(definition);

    // 4. Store definition as JSON
    const storedAsset = await context.storage.storeJSON(definition, {
      id: action.id,
      type: 'cutscene'
    });

    // 5. Create result
    const result: CutsceneAssetResult = {
      id: action.id,
      url: storedAsset.url,
      metadata: {
        totalDuration: this.calculateTotalDuration(definition),
        shotCount: definition.shots.length,
        shots: definition.shots,
        ...this.createBaseMetadata(action)
      },
      cost: 0 // No additional cost for assembly
    };

    return result;
  }

  /**
   * Validate that all referenced assets exist
   */
  private async validateReferences(action: AssetCutsceneAction, context: ExecutionContext): Promise<void> {
    const missingAssets: string[] = [];

    // Check all image and subtitle references
    for (const shot of action.shots) {
      // Check image exists
      if (!(await context.storage.exists(shot.image_id))) {
        missingAssets.push(`image: ${shot.image_id}`);
      }

      // Check subtitle exists
      if (!(await context.storage.exists(shot.subtitle_id))) {
        missingAssets.push(`subtitle: ${shot.subtitle_id}`);
      }
    }

    if (missingAssets.length > 0) {
      throw this.createError(
        `Missing referenced assets: ${missingAssets.join(', ')}`,
        action,
        false, // Not retryable - assets need to be created first
        { missingAssets }
      );
    }
  }

  /**
   * Build cutscene definition from action
   */
  private async buildCutsceneDefinition(
    action: AssetCutsceneAction, 
    context: ExecutionContext
  ): Promise<CutsceneDefinition> {
    const shots: CutsceneDefinitionShot[] = [];

    for (const shot of action.shots) {
      // Get URLs for referenced assets
      const imageUrl = await context.storage.getUrl(shot.image_id);
      const audioUrl = await context.storage.getUrl(shot.subtitle_id);
      
      // Get audio duration if available
      const audioDuration = await context.storage.getDuration(shot.subtitle_id) || 0;

      shots.push({
        imageUrl,
        audioUrl,
        duration: shot.duration,
        animation: shot.animation,
        audioDuration
      });
    }

    return {
      id: action.id,
      shots
    };
  }

  /**
   * Validate timing and provide warnings for potential issues
   */
  private validateTiming(definition: CutsceneDefinition): void {
    definition.shots.forEach((shot, index) => {
      // Warn if audio is longer than shot duration
      if (shot.audioDuration > shot.duration) {
        console.warn(
          `Shot ${index}: Audio duration (${shot.audioDuration}s) exceeds shot duration (${shot.duration}s). ` +
          'Audio will be cut off.'
        );
      }

      // Warn if audio is much shorter than shot duration
      if (shot.audioDuration > 0 && shot.audioDuration < shot.duration * 0.5) {
        console.warn(
          `Shot ${index}: Audio duration (${shot.audioDuration}s) is much shorter than shot duration (${shot.duration}s). ` +
          'Consider adjusting shot duration or adding background music.'
        );
      }

      // Warn about very short shots (might feel rushed)
      if (shot.duration < 2) {
        console.warn(
          `Shot ${index}: Very short duration (${shot.duration}s). ` +
          'Consider extending for better pacing.'
        );
      }

      // Warn about very long shots (might feel slow)
      if (shot.duration > 15) {
        console.warn(
          `Shot ${index}: Long duration (${shot.duration}s). ` +
          'Consider breaking into multiple shots or adding animation.'
        );
      }
    });

    // Check overall pacing
    const totalDuration = this.calculateTotalDuration(definition);
    const averageShotDuration = totalDuration / definition.shots.length;

    if (averageShotDuration < 3) {
      console.warn(
        `Cutscene pacing might be too fast (avg ${averageShotDuration.toFixed(1)}s per shot). ` +
        'Consider longer shot durations for better comprehension.'
      );
    }

    if (averageShotDuration > 10) {
      console.warn(
        `Cutscene pacing might be too slow (avg ${averageShotDuration.toFixed(1)}s per shot). ` +
        'Consider shorter shot durations or more dynamic content.'
      );
    }
  }

  /**
   * Calculate total duration of cutscene
   */
  private calculateTotalDuration(definition: CutsceneDefinition): number {
    return definition.shots.reduce((total, shot) => total + shot.duration, 0);
  }

  /**
   * Get cutscene statistics for analysis
   */
  static analyzeCutscene(definition: CutsceneDefinition): {
    totalDuration: number;
    shotCount: number;
    averageShotDuration: number;
    animationBreakdown: Record<string, number>;
    timingIssues: string[];
  } {
    const totalDuration = definition.shots.reduce((sum, shot) => sum + shot.duration, 0);
    const averageShotDuration = totalDuration / definition.shots.length;
    
    // Count animations
    const animationBreakdown: Record<string, number> = {};
    definition.shots.forEach(shot => {
      animationBreakdown[shot.animation] = (animationBreakdown[shot.animation] || 0) + 1;
    });

    // Identify timing issues
    const timingIssues: string[] = [];
    definition.shots.forEach((shot, index) => {
      if (shot.audioDuration > shot.duration) {
        timingIssues.push(`Shot ${index}: Audio longer than shot duration`);
      }
      if (shot.duration < 1) {
        timingIssues.push(`Shot ${index}: Very short duration (${shot.duration}s)`);
      }
      if (shot.duration > 20) {
        timingIssues.push(`Shot ${index}: Very long duration (${shot.duration}s)`);
      }
    });

    return {
      totalDuration,
      shotCount: definition.shots.length,
      averageShotDuration,
      animationBreakdown,
      timingIssues
    };
  }

  /**
   * Create optimized cutscene with suggested improvements
   */
  static optimizeCutscene(action: AssetCutsceneAction): AssetCutsceneAction {
    const optimizedShots = action.shots.map(shot => {
      let optimizedDuration = shot.duration;

      // Adjust very short durations
      if (optimizedDuration < 2) {
        optimizedDuration = 2;
      }

      // Adjust very long durations
      if (optimizedDuration > 15) {
        optimizedDuration = 15;
      }

      // Suggest better animations for certain durations
      let optimizedAnimation = shot.animation;
      if (optimizedDuration < 3 && shot.animation === 'static') {
        optimizedAnimation = 'fade_in'; // More dynamic for short shots
      }
      if (optimizedDuration > 10 && shot.animation === 'fade_in') {
        optimizedAnimation = 'pan_left'; // More engaging for long shots
      }

      return {
        ...shot,
        duration: optimizedDuration,
        animation: optimizedAnimation
      };
    });

    return {
      ...action,
      shots: optimizedShots
    };
  }

  /**
   * Validate cutscene accessibility
   */
  static validateAccessibility(definition: CutsceneDefinition): {
    hasAudio: boolean;
    hasVisuals: boolean;
    averageReadingTime: number;
    suggestions: string[];
  } {
    const suggestions: string[] = [];
    
    const hasAudio = definition.shots.every(shot => shot.audioUrl);
    const hasVisuals = definition.shots.every(shot => shot.imageUrl);

    if (!hasAudio) {
      suggestions.push('Consider adding audio narration for visually impaired users');
    }

    if (!hasVisuals) {
      suggestions.push('Consider adding visual elements for hearing impaired users');
    }

    // Estimate reading time for subtitles (approximate)
    const totalDuration = definition.shots.reduce((sum, shot) => sum + shot.duration, 0);
    const averageReadingTime = totalDuration / definition.shots.length;

    if (averageReadingTime < 3) {
      suggestions.push('Shot durations may be too short for comfortable reading');
    }

    return {
      hasAudio,
      hasVisuals,
      averageReadingTime,
      suggestions
    };
  }
}