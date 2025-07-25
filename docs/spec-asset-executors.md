# Asset Creation Executors Specification

## Overview

Asset Creation Executors are responsible for transforming DSL asset actions into actual assets via API calls to GenAI services. Each executor handles a specific asset type and manages API communication, error handling, and result storage.

## Architecture

```
Action → Executor → API Client → External Service → Asset Storage
                ↓                        ↓
           Validation              Error Handling
```

## Common Interfaces

```typescript
interface AssetExecutor<T extends Action, R extends AssetResult> {
  execute(action: T, context: ExecutionContext): Promise<R>;
  validate(action: T): ValidationResult;
  estimateCost(action: T): CostEstimate;
}

interface ExecutionContext {
  apiKeys: APIKeys;
  storage: AssetStorage;
  cache: AssetCache;
  rateLimiter: RateLimiter;
  costTracker: CostTracker;
}

interface AssetResult {
  id: string;
  url: string;
  metadata: Record<string, any>;
  cost: number;
  duration?: number; // For audio assets
}

interface CostEstimate {
  min: number;
  max: number;
  currency: 'USD';
}
```

## Asset Executors

### 1. Image Asset Executor

**Purpose**: Generate images via AI image generation APIs

**Implementation**:
```typescript
class ImageAssetExecutor implements AssetExecutor<AssetImageAction, ImageAssetResult> {
  async execute(action: AssetImageAction, context: ExecutionContext): Promise<ImageAssetResult> {
    // 1. Check cache
    const cached = await context.cache.get(action);
    if (cached) return cached;
    
    // 2. Apply rate limiting
    await context.rateLimiter.acquire('image_generation');
    
    // 3. Enhance prompt with style guidelines
    const enhancedPrompt = this.enhancePrompt(action.prompt);
    
    // 4. Call appropriate API
    const result = action.model === 'flux-schnell' 
      ? await this.callFluxAPI(enhancedPrompt, action.size, context)
      : await this.callSDXLAPI(enhancedPrompt, action.size, context);
    
    // 5. Store asset
    const stored = await context.storage.store(result.imageData, {
      id: action.id,
      type: 'image',
      format: 'png'
    });
    
    // 6. Track cost
    context.costTracker.record('image', action.model, result.cost);
    
    // 7. Cache result
    await context.cache.set(action, stored);
    
    return stored;
  }
  
  private enhancePrompt(prompt: string): string {
    // Add consistent style modifiers
    return `${prompt}, high quality, detailed, cinematic lighting`;
  }
}
```

**API Integrations**:
- **Flux Schnell** (via Together AI): Free during promotion
- **SDXL** (via Replicate/Together): $0.009 per image

**Error Handling**:
- Retry on transient failures (up to 3 times)
- Fallback to alternative model on persistent failure
- Clear error messages: "Image generation failed: NSFW content detected"

### 2. Subtitle Asset Executor

**Purpose**: Generate audio narration from text via TTS APIs

**Implementation**:
```typescript
class SubtitleAssetExecutor implements AssetExecutor<AssetSubtitleAction, AudioAssetResult> {
  async execute(action: AssetSubtitleAction, context: ExecutionContext): Promise<AudioAssetResult> {
    // 1. Check cache
    const cacheKey = this.getCacheKey(action);
    const cached = await context.cache.get(cacheKey);
    if (cached) return cached;
    
    // 2. Rate limiting
    await context.rateLimiter.acquire('tts_generation');
    
    // 3. Build voice configuration
    const voiceConfig = this.buildVoiceConfig(action);
    
    // 4. Call TTS API
    const audioData = action.model === 'openai-tts'
      ? await this.callOpenAITTS(action.text, voiceConfig, context)
      : await this.callGoogleTTS(action.text, voiceConfig, context);
    
    // 5. Analyze audio for duration
    const duration = await this.getAudioDuration(audioData);
    
    // 6. Store asset
    const stored = await context.storage.store(audioData, {
      id: action.id,
      type: 'audio',
      format: 'mp3',
      duration
    });
    
    // 7. Track cost
    const charCount = action.text.length;
    context.costTracker.record('tts', action.model, charCount);
    
    return stored;
  }
  
  private buildVoiceConfig(action: AssetSubtitleAction): VoiceConfig {
    return {
      voice: this.selectVoice(action.voice_gender, action.voice_tone),
      speed: this.mapPaceToSpeed(action.voice_pace),
      pitch: this.mapToneToPitch(action.voice_tone)
    };
  }
}
```

**API Integrations**:
- **OpenAI TTS**: $15 per million characters
- **Google Cloud TTS**: $4 per million characters (standard voices)

**Voice Mapping**:
```typescript
const VOICE_MAP = {
  'openai-tts': {
    'neutral-epic': 'onyx',
    'neutral-calm': 'nova',
    'feminine-mysterious': 'shimmer',
    'masculine-urgent': 'echo'
  },
  'google-tts': {
    'neutral-epic': 'en-US-Journey-F',
    'neutral-calm': 'en-US-Neural2-C',
    // ...
  }
};
```

### 3. Cutscene Asset Executor

**Purpose**: Assemble images and audio into cutscene definitions

**Implementation**:
```typescript
class CutsceneAssetExecutor implements AssetExecutor<AssetCutsceneAction, CutsceneAssetResult> {
  async execute(action: AssetCutsceneAction, context: ExecutionContext): Promise<CutsceneAssetResult> {
    // 1. Validate all referenced assets exist
    await this.validateReferences(action, context);
    
    // 2. Build cutscene definition
    const definition: CutsceneDefinition = {
      id: action.id,
      shots: await Promise.all(action.shots.map(async shot => ({
        imageUrl: await context.storage.getUrl(shot.image_id),
        audioUrl: await context.storage.getUrl(shot.subtitle_id),
        duration: shot.duration,
        animation: shot.animation,
        audioDuration: await context.storage.getDuration(shot.subtitle_id)
      })))
    };
    
    // 3. Validate timing
    this.validateTiming(definition);
    
    // 4. Store definition
    const stored = await context.storage.storeJSON(definition, {
      id: action.id,
      type: 'cutscene'
    });
    
    return {
      id: action.id,
      url: stored.url,
      metadata: {
        totalDuration: this.calculateTotalDuration(definition),
        shotCount: definition.shots.length
      },
      cost: 0 // No additional cost for assembly
    };
  }
  
  private validateTiming(definition: CutsceneDefinition): void {
    definition.shots.forEach((shot, index) => {
      if (shot.audioDuration > shot.duration) {
        console.warn(`Shot ${index}: Audio (${shot.audioDuration}s) longer than shot duration (${shot.duration}s)`);
      }
    });
  }
}
```

## Asset Storage

```typescript
interface AssetStorage {
  store(data: Buffer | Uint8Array, metadata: AssetMetadata): Promise<StoredAsset>;
  storeJSON(data: object, metadata: AssetMetadata): Promise<StoredAsset>;
  getUrl(id: string): Promise<string>;
  getDuration(id: string): Promise<number | undefined>;
  exists(id: string): Promise<boolean>;
}

// Implementation options:
// 1. Local filesystem (development)
// 2. S3 or CloudFlare R2 (production)
// 3. In-memory (testing)
```

## Cost Tracking

```typescript
class CostTracker {
  private costs: CostRecord[] = [];
  
  record(type: AssetType, model: string, units: number): void {
    const cost = this.calculateCost(type, model, units);
    this.costs.push({
      timestamp: Date.now(),
      type,
      model,
      units,
      cost
    });
  }
  
  getTotalCost(): number {
    return this.costs.reduce((sum, record) => sum + record.cost, 0);
  }
  
  getCostBreakdown(): CostBreakdown {
    // Group by type and model
  }
}
```

## Testing Strategy

### Unit Tests with Mocks

```typescript
describe('ImageAssetExecutor', () => {
  it('should call Flux API with enhanced prompt', async () => {
    const mockAPI = jest.fn().mockResolvedValue({
      imageData: Buffer.from('test'),
      cost: 0
    });
    
    const executor = new ImageAssetExecutor(mockAPI);
    const action: AssetImageAction = {
      type: 'asset_image',
      id: 'test_image',
      prompt: 'alien landscape',
      size: '1024x768',
      model: 'flux-schnell'
    };
    
    await executor.execute(action, mockContext);
    
    expect(mockAPI).toHaveBeenCalledWith(
      expect.stringContaining('alien landscape'),
      expect.stringContaining('high quality'),
      expect.any(Object)
    );
  });
  
  it('should retry on transient failure', async () => {
    // Test retry logic
  });
  
  it('should respect rate limits', async () => {
    // Test rate limiting
  });
});
```

### Integration Tests

```typescript
describe('Asset Executor Integration', () => {
  it('should generate and store real image (requires API key)', async () => {
    if (!process.env.FLUX_API_KEY) {
      return skip('No API key provided');
    }
    
    // Test with real API
  });
});
```

## Error Handling

All executors should handle:

1. **API Errors**: Rate limits, invalid API keys, service downtime
2. **Validation Errors**: Invalid prompts, missing references
3. **Storage Errors**: Disk full, network issues
4. **Cost Limits**: Exceeding budget constraints

Example error types:
```typescript
class AssetGenerationError extends Error {
  constructor(
    message: string,
    public readonly action: Action,
    public readonly retryable: boolean,
    public readonly details?: any
  ) {
    super(message);
  }
}
```

## Performance Optimizations

1. **Caching**: Cache based on normalized action parameters
2. **Batching**: Group similar requests when possible
3. **Preemptive Generation**: Start generating likely assets before needed
4. **Progressive Loading**: Generate low-res previews first
5. **CDN Integration**: Serve assets from edge locations

## Monitoring

Each executor should emit metrics:
- API call success/failure rates
- Generation times
- Cost per asset type
- Cache hit rates
- Error frequencies

## Future Enhancements

1. **Multi-provider Failover**: Automatically switch providers on failure
2. **Quality Scoring**: Rate generated assets and retry if below threshold
3. **Style Consistency**: Maintain visual consistency across sessions
4. **Asset Variations**: Generate multiple versions and select best
5. **Real-time Preview**: Stream generation progress to UI