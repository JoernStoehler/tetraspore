/**
 * Subtitle Asset Executor
 * 
 * Generates audio narration from text via TTS APIs (OpenAI TTS, Google Cloud TTS).
 * Handles voice mapping, caching, rate limiting, and cost tracking.
 */

import { BaseExecutor } from './BaseExecutor';
import {
  AssetSubtitleAction,
  AudioAssetResult,
  ExecutionContext,
  ValidationResult,
  ExecutorValidationError,
  CostEstimate,
  VoiceConfig,
  OpenAITTSResponse,
  GoogleTTSResponse
} from './types';

export class SubtitleAssetExecutor extends BaseExecutor<AssetSubtitleAction, AudioAssetResult> {

  // Voice mapping configuration
  private static readonly VOICE_MAP = {
    'openai-tts': {
      'neutral-epic': 'onyx',
      'neutral-calm': 'nova',
      'feminine-mysterious': 'shimmer',
      'feminine-calm': 'nova',
      'feminine-epic': 'shimmer',
      'feminine-urgent': 'shimmer',
      'masculine-urgent': 'echo',
      'masculine-calm': 'onyx',
      'masculine-epic': 'onyx',
      'masculine-mysterious': 'echo'
    },
    'google-tts': {
      'neutral-epic': 'en-US-Journey-F',
      'neutral-calm': 'en-US-Neural2-C',
      'feminine-mysterious': 'en-US-Neural2-F',
      'feminine-calm': 'en-US-Neural2-A',
      'feminine-epic': 'en-US-Neural2-F',
      'feminine-urgent': 'en-US-Neural2-G',
      'masculine-urgent': 'en-US-Neural2-D',
      'masculine-calm': 'en-US-Neural2-J',
      'masculine-epic': 'en-US-Neural2-I',
      'masculine-mysterious': 'en-US-Neural2-D'
    }
  };

  /**
   * Execute TTS generation with caching and error handling
   */
  async execute(action: AssetSubtitleAction, context: ExecutionContext): Promise<AudioAssetResult> {
    const startTime = Date.now();

    // Validate action
    this.validateAction(action);

    // Check cache first
    const cached = await this.checkCache(action, context);
    if (cached) {
      return cached;
    }

    // Apply rate limiting
    await this.applyRateLimit('tts_generation', context);

    // Generate audio with retry logic
    const result = await this.executeWithRetry(
      () => this.generateAudio(action, context),
      { action, operation: 'TTS generation' }
    );

    // Store in cache
    await this.storeInCache(action, result, context);

    // Log metrics
    this.logMetrics(action, startTime, result);

    return result;
  }

  /**
   * Validate subtitle action parameters
   */
  validate(action: AssetSubtitleAction): ValidationResult {
    const errors: ExecutorValidationError[] = [];

    // Validate required fields
    if (!action.id?.trim()) {
      errors.push({
        field: 'id',
        message: 'ID is required and cannot be empty',
        code: 'REQUIRED'
      });
    }

    if (!action.text?.trim()) {
      errors.push({
        field: 'text',
        message: 'Text is required and cannot be empty',
        code: 'REQUIRED'
      });
    }

    // Validate voice parameters
    const validGenders = ['neutral', 'feminine', 'masculine'];
    if (!validGenders.includes(action.voice_gender)) {
      errors.push({
        field: 'voice_gender',
        message: `Voice gender must be one of: ${validGenders.join(', ')}`,
        code: 'INVALID_VALUE'
      });
    }

    const validTones = ['epic', 'calm', 'mysterious', 'urgent'];
    if (!validTones.includes(action.voice_tone)) {
      errors.push({
        field: 'voice_tone',
        message: `Voice tone must be one of: ${validTones.join(', ')}`,
        code: 'INVALID_VALUE'
      });
    }

    const validPaces = ['slow', 'normal', 'fast'];
    if (!validPaces.includes(action.voice_pace)) {
      errors.push({
        field: 'voice_pace',
        message: `Voice pace must be one of: ${validPaces.join(', ')}`,
        code: 'INVALID_VALUE'
      });
    }

    // Validate model
    const validModels = ['openai-tts', 'google-tts'];
    if (!validModels.includes(action.model)) {
      errors.push({
        field: 'model',
        message: `Model must be one of: ${validModels.join(', ')}`,
        code: 'INVALID_VALUE'
      });
    }

    // Validate text length (reasonable limits for TTS)
    if (action.text && action.text.length > 4000) {
      errors.push({
        field: 'text',
        message: 'Text must be 4000 characters or less',
        code: 'TOO_LONG'
      });
    }

    if (action.text && action.text.length < 1) {
      errors.push({
        field: 'text',
        message: 'Text must be at least 1 character',
        code: 'TOO_SHORT'
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Estimate cost for TTS generation
   */
  estimateCost(action: AssetSubtitleAction): CostEstimate {
    const charCount = action.text.length;

    // Cost per million characters by model
    const modelCosts = {
      'openai-tts': 15, // $15 per million characters
      'google-tts': 4   // $4 per million characters (standard voices)
    };

    const costPerChar = (modelCosts[action.model] || 15) / 1_000_000;
    const estimatedCost = charCount * costPerChar;

    return {
      min: estimatedCost,
      max: estimatedCost,
      currency: 'USD'
    };
  }

  /**
   * Generate audio using appropriate TTS API
   */
  private async generateAudio(action: AssetSubtitleAction, context: ExecutionContext): Promise<AudioAssetResult> {
    // Build voice configuration
    const voiceConfig = this.buildVoiceConfig(action);

    // Call appropriate TTS API based on model
    const apiResponse = action.model === 'openai-tts'
      ? await this.callOpenAITTS(action.text, voiceConfig, context)
      : await this.callGoogleTTS(action.text, voiceConfig, context);

    // Analyze audio for duration
    const duration = await this.getAudioDuration(apiResponse.audioData);

    // Store the generated audio
    const storedAsset = await context.storage.store(apiResponse.audioData, {
      id: action.id,
      type: 'audio',
      format: 'mp3',
      duration
    });

    // Track cost based on character count
    const charCount = action.text.length;
    context.costTracker.record('tts', action.model, charCount);

    // Create result
    const result: AudioAssetResult = {
      id: action.id,
      url: storedAsset.url,
      duration,
      metadata: {
        format: 'mp3' as const,
        model: action.model,
        voice: voiceConfig.voice,
        text: action.text,
        sampleRate: 22050, // Standard sample rate
        voiceGender: action.voice_gender,
        voiceTone: action.voice_tone,
        voicePace: action.voice_pace,
        characterCount: charCount,
        ...this.createBaseMetadata(action)
      },
      cost: apiResponse.cost
    };

    return result;
  }

  /**
   * Build voice configuration from action parameters
   */
  private buildVoiceConfig(action: AssetSubtitleAction): VoiceConfig {
    const voiceKey = `${action.voice_gender}-${action.voice_tone}`;
    const voiceMap = SubtitleAssetExecutor.VOICE_MAP[action.model];
    const voice = voiceMap[voiceKey as keyof typeof voiceMap] || voiceMap['neutral-calm'];

    return {
      voice,
      speed: this.mapPaceToSpeed(action.voice_pace),
      pitch: this.mapToneToPitch(action.voice_tone)
    };
  }

  /**
   * Map pace to speed value
   */
  private mapPaceToSpeed(pace: string): number {
    const speedMap = {
      slow: 0.8,
      normal: 1.0,
      fast: 1.2
    };

    return speedMap[pace as keyof typeof speedMap] || 1.0;
  }

  /**
   * Map tone to pitch adjustment
   */
  private mapToneToPitch(tone: string): number {
    const pitchMap = {
      epic: 0.0,      // Normal pitch for epic
      calm: -0.1,     // Slightly lower for calm
      mysterious: -0.2, // Lower for mysterious
      urgent: 0.1     // Slightly higher for urgent
    };

    return pitchMap[tone as keyof typeof pitchMap] || 0.0;
  }

  /**
   * Call OpenAI TTS API
   */
  private async callOpenAITTS(text: string, voiceConfig: VoiceConfig, context: ExecutionContext): Promise<OpenAITTSResponse> {
    this.validateApiKeys(['openaiApiKey'], context.apiKeys);

    try {
      // Mock API call for now - would be replaced with actual OpenAI API
      console.log(`[MOCK] Calling OpenAI TTS: ${text.substring(0, 50)}... (${voiceConfig.voice})`);
      
      // Simulate API delay
      await this.sleep(1500);

      // Create mock audio data (in production, this would be actual audio)
      const audioData = Buffer.from(`Mock OpenAI TTS audio data for: ${text}`);

      // Calculate cost ($15 per million characters)
      const cost = (text.length / 1_000_000) * 15;

      return {
        audioData,
        cost
      };

    } catch (error) {
      throw this.createError(
        `OpenAI TTS API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { type: 'asset_subtitle', id: 'temp', text, voice_gender: 'neutral', voice_tone: 'calm', voice_pace: 'normal', model: 'openai-tts' } as AssetSubtitleAction,
        true, // Retryable
        { originalError: error }
      );
    }
  }

  /**
   * Call Google Cloud TTS API
   */
  private async callGoogleTTS(text: string, voiceConfig: VoiceConfig, context: ExecutionContext): Promise<GoogleTTSResponse> {
    this.validateApiKeys(['googleCloudApiKey'], context.apiKeys);

    try {
      // Mock API call for now - would be replaced with actual Google Cloud TTS API
      console.log(`[MOCK] Calling Google TTS: ${text.substring(0, 50)}... (${voiceConfig.voice})`);
      
      // Simulate API delay
      await this.sleep(2000);

      // Create mock audio data
      const audioData = Buffer.from(`Mock Google TTS audio data for: ${text}`);

      // Calculate cost ($4 per million characters for standard voices)
      const cost = (text.length / 1_000_000) * 4;

      return {
        audioData,
        cost
      };

    } catch (error) {
      throw this.createError(
        `Google TTS API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { type: 'asset_subtitle', id: 'temp', text, voice_gender: 'neutral', voice_tone: 'calm', voice_pace: 'normal', model: 'google-tts' } as AssetSubtitleAction,
        true, // Retryable
        { originalError: error }
      );
    }
  }

  /**
   * Get audio duration from audio data
   * In production, this would analyze the actual audio file
   */
  private async getAudioDuration(audioData: Buffer): Promise<number> {
    // Mock duration calculation based on mock text length
    // In production, would use audio analysis library like 'node-ffmpeg' or 'music-metadata'
    const mockText = audioData.toString();
    const textMatch = mockText.match(/Mock .* TTS audio data for: (.+)/);
    const text = textMatch ? textMatch[1] : mockText;
    
    const estimatedWordsPerMinute = 150;
    const words = text.trim().split(/\s+/).length;
    
    // Calculate duration in seconds: words / (words per minute) * 60
    const durationSeconds = Math.max(1, Math.round((words / estimatedWordsPerMinute) * 60));
    
    return durationSeconds;
  }

  /**
   * Get recommended model based on use case
   */
  static getRecommendedModel(useCase: 'narrative' | 'dialog' | 'ui_feedback'): 'openai-tts' | 'google-tts' {
    // OpenAI generally has better quality for narrative content
    // Google TTS is more cost-effective for shorter content
    const modelMap = {
      narrative: 'openai-tts' as const,  // Better for longer narrative content
      dialog: 'openai-tts' as const,     // Better character voices
      ui_feedback: 'google-tts' as const // Cost-effective for short feedback
    };

    return modelMap[useCase];
  }

  /**
   * Get recommended voice configuration for game context
   */
  static getRecommendedVoice(context: 'narrator' | 'character' | 'system'): {
    voice_gender: 'neutral' | 'feminine' | 'masculine';
    voice_tone: 'epic' | 'calm' | 'mysterious' | 'urgent';
    voice_pace: 'slow' | 'normal' | 'fast';
  } {
    const voiceMap = {
      narrator: {
        voice_gender: 'neutral' as const,
        voice_tone: 'epic' as const,
        voice_pace: 'normal' as const
      },
      character: {
        voice_gender: 'feminine' as const,
        voice_tone: 'mysterious' as const,
        voice_pace: 'normal' as const
      },
      system: {
        voice_gender: 'neutral' as const,
        voice_tone: 'calm' as const,
        voice_pace: 'normal' as const
      }
    };

    return voiceMap[context];
  }

  /**
   * Calculate estimated speech duration from text
   */
  static estimateSpeechDuration(text: string, pace: 'slow' | 'normal' | 'fast' = 'normal'): number {
    const wordsPerMinuteMap = {
      slow: 120,
      normal: 150,
      fast: 180
    };

    const wordsPerMinute = wordsPerMinuteMap[pace];
    const wordCount = text.trim().split(/\s+/).length;
    const durationMinutes = wordCount / wordsPerMinute;
    
    return Math.max(1, Math.round(durationMinutes * 60)); // Return seconds, minimum 1 second
  }

  /**
   * Clean text for optimal TTS processing
   */
  static cleanTextForTTS(text: string): string {
    return text
      // Remove markdown formatting
      .replace(/[*_`]/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      // Remove extra punctuation
      .replace(/[.]{2,}/g, '.')
      // Ensure proper sentence endings
      .replace(/([^.!?])$/, '$1.')
      .trim();
  }
}