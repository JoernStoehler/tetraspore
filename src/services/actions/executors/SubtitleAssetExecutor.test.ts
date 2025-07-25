/**
 * Tests for SubtitleAssetExecutor
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SubtitleAssetExecutor } from './SubtitleAssetExecutor';
import { 
  createMockExecutionContext, 
  MockAssetStorage, 
  MockAssetCache,
  mockActions
} from './mocks';
import { AudioAssetResult } from './types';

describe('SubtitleAssetExecutor', () => {
  let executor: SubtitleAssetExecutor;
  let mockContext: ReturnType<typeof createMockExecutionContext>;
  let mockStorage: MockAssetStorage;
  let mockCache: MockAssetCache;

  beforeEach(() => {
    executor = new SubtitleAssetExecutor();
    mockStorage = new MockAssetStorage();
    mockCache = new MockAssetCache();
    mockContext = createMockExecutionContext({
      storage: mockStorage,
      cache: mockCache
    });
  });

  describe('validate', () => {
    it('should pass validation for valid action', () => {
      const action = mockActions.subtitle();
      const result = executor.validate(action);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail validation for missing ID', () => {
      const action = mockActions.subtitle({ id: '' });
      const result = executor.validate(action);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'id',
        message: 'ID is required and cannot be empty',
        code: 'REQUIRED'
      });
    });

    it('should fail validation for missing text', () => {
      const action = mockActions.subtitle({ text: '' });
      const result = executor.validate(action);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'text',
        message: 'Text is required and cannot be empty',
        code: 'REQUIRED'
      });
    });

    it('should fail validation for invalid voice gender', () => {
      const action = mockActions.subtitle({ voice_gender: 'robotic' as never });
      const result = executor.validate(action);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'voice_gender',
        message: 'Voice gender must be one of: neutral, feminine, masculine',
        code: 'INVALID_VALUE'
      });
    });

    it('should fail validation for invalid voice tone', () => {
      const action = mockActions.subtitle({ voice_tone: 'angry' as never });
      const result = executor.validate(action);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'voice_tone',
        message: 'Voice tone must be one of: epic, calm, mysterious, urgent',
        code: 'INVALID_VALUE'
      });
    });

    it('should fail validation for invalid voice pace', () => {
      const action = mockActions.subtitle({ voice_pace: 'extremely_fast' as never });
      const result = executor.validate(action);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'voice_pace',
        message: 'Voice pace must be one of: slow, normal, fast',
        code: 'INVALID_VALUE'
      });
    });

    it('should fail validation for invalid model', () => {
      const action = mockActions.subtitle({ model: 'amazon-polly' as never });
      const result = executor.validate(action);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'model',
        message: 'Model must be one of: openai-tts, google-tts',
        code: 'INVALID_VALUE'
      });
    });

    it('should fail validation for text too long', () => {
      const action = mockActions.subtitle({ text: 'a'.repeat(4001) });
      const result = executor.validate(action);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'text',
        message: 'Text must be 4000 characters or less',
        code: 'TOO_LONG'
      });
    });
  });

  describe('estimateCost', () => {
    it('should calculate correct cost for OpenAI TTS', () => {
      const action = mockActions.subtitle({ 
        text: 'a'.repeat(1000), // 1000 characters
        model: 'openai-tts' 
      });
      const estimate = executor.estimateCost(action);
      
      // $15 per million characters = $0.000015 per character
      const expectedCost = 1000 * (15 / 1_000_000);
      
      expect(estimate.min).toBe(expectedCost);
      expect(estimate.max).toBe(expectedCost);
      expect(estimate.currency).toBe('USD');
    });

    it('should calculate correct cost for Google TTS', () => {
      const action = mockActions.subtitle({ 
        text: 'a'.repeat(2000), // 2000 characters
        model: 'google-tts' 
      });
      const estimate = executor.estimateCost(action);
      
      // $4 per million characters = $0.000004 per character
      const expectedCost = 2000 * (4 / 1_000_000);
      
      expect(estimate.min).toBe(expectedCost);
      expect(estimate.max).toBe(expectedCost);
      expect(estimate.currency).toBe('USD');
    });
  });

  describe('execute', () => {
    it('should generate audio successfully', async () => {
      const action = mockActions.subtitle({
        id: 'test-audio',
        text: 'Welcome to the alien world of Kepler-442b.',
        voice_gender: 'neutral',
        voice_tone: 'epic',
        voice_pace: 'normal',
        model: 'openai-tts'
      });

      const result = await executor.execute(action, mockContext);

      expect(result).toMatchObject({
        id: 'test-audio',
        duration: expect.any(Number),
        metadata: {
          format: 'mp3',
          model: 'openai-tts',
          text: 'Welcome to the alien world of Kepler-442b.',
          sampleRate: 22050
        }
      });

      expect(result.url).toBeDefined();
      expect(result.duration).toBeGreaterThan(0);
      expect(result.cost).toBeGreaterThan(0);
    });

    it('should return cached result if available', async () => {
      const action = mockActions.subtitle({ id: 'cached-audio' });
      
      // Pre-populate cache
      const cachedResult: AudioAssetResult = {
        id: 'cached-audio',
        url: '/cached/audio.mp3',
        duration: 5.5,
        metadata: {
          format: 'mp3',
          model: 'openai-tts',
          voice: 'onyx',
          text: 'cached text',
          sampleRate: 22050
        },
        cost: 0.001
      };
      
      await mockCache.set('mock-cache-key', cachedResult);
      
      // Mock getCacheKey to return our known key
      const originalGetCacheKey = executor['getCacheKey'];
      executor['getCacheKey'] = () => 'mock-cache-key';

      const result = await executor.execute(action, mockContext);
      
      expect(result).toEqual(cachedResult);
      
      // Restore original method
      executor['getCacheKey'] = originalGetCacheKey;
    });

    it('should handle different voice configurations', async () => {
      const voiceConfigs = [
        { gender: 'neutral', tone: 'epic', pace: 'normal' },
        { gender: 'feminine', tone: 'mysterious', pace: 'slow' },
        { gender: 'masculine', tone: 'urgent', pace: 'fast' }
      ] as const;

      for (const config of voiceConfigs) {
        const action = mockActions.subtitle({
          id: `test-${config.gender}-${config.tone}`,
          voice_gender: config.gender,
          voice_tone: config.tone,
          voice_pace: config.pace
        });

        const result = await executor.execute(action, mockContext);
        
        expect(result.metadata.voiceGender).toBe(config.gender);
        expect(result.metadata.voiceTone).toBe(config.tone);
        expect(result.metadata.voicePace).toBe(config.pace);
      }
    });

    it('should handle different TTS models', async () => {
      const models: Array<'openai-tts' | 'google-tts'> = ['openai-tts', 'google-tts'];

      for (const model of models) {
        const action = mockActions.subtitle({
          id: `test-${model}`,
          model
        });

        const result = await executor.execute(action, mockContext);
        
        expect(result.metadata.model).toBe(model);
      }
    });

    it('should apply rate limiting', async () => {
      const action = mockActions.subtitle();
      
      const acquireSpy = vi.spyOn(mockContext.rateLimiter, 'acquire');
      
      await executor.execute(action, mockContext);
      
      expect(acquireSpy).toHaveBeenCalledWith('tts_generation');
    });

    it('should track costs correctly', async () => {
      const action = mockActions.subtitle({ 
        text: 'test text',
        model: 'google-tts' 
      });
      
      const recordSpy = vi.spyOn(mockContext.costTracker, 'record');
      
      await executor.execute(action, mockContext);
      
      expect(recordSpy).toHaveBeenCalledWith('tts', 'google-tts', 'test text'.length);
    });
  });

  describe('voice configuration', () => {
    it('should build correct voice config for OpenAI TTS', () => {
      const action = mockActions.subtitle({
        voice_gender: 'neutral',
        voice_tone: 'epic',
        voice_pace: 'normal',
        model: 'openai-tts'
      });

      const voiceConfig = executor['buildVoiceConfig'](action);
      
      expect(voiceConfig.voice).toBe('onyx'); // neutral-epic maps to onyx
      expect(voiceConfig.speed).toBe(1.0); // normal pace
      expect(voiceConfig.pitch).toBe(0.0); // epic tone
    });

    it('should build correct voice config for Google TTS', () => {
      const action = mockActions.subtitle({
        voice_gender: 'feminine',
        voice_tone: 'calm',
        voice_pace: 'slow',
        model: 'google-tts'
      });

      const voiceConfig = executor['buildVoiceConfig'](action);
      
      expect(voiceConfig.voice).toBe('en-US-Neural2-A'); // feminine-calm maps to Neural2-A
      expect(voiceConfig.speed).toBe(0.8); // slow pace
      expect(voiceConfig.pitch).toBe(-0.1); // calm tone
    });

    it('should map pace to speed correctly', () => {
      expect(executor['mapPaceToSpeed']('slow')).toBe(0.8);
      expect(executor['mapPaceToSpeed']('normal')).toBe(1.0);
      expect(executor['mapPaceToSpeed']('fast')).toBe(1.2);
    });

    it('should map tone to pitch correctly', () => {
      expect(executor['mapToneToPitch']('epic')).toBe(0.0);
      expect(executor['mapToneToPitch']('calm')).toBe(-0.1);
      expect(executor['mapToneToPitch']('mysterious')).toBe(-0.2);
      expect(executor['mapToneToPitch']('urgent')).toBe(0.1);
    });
  });

  describe('static utility methods', () => {
    describe('getRecommendedModel', () => {
      it('should recommend correct models for use cases', () => {
        expect(SubtitleAssetExecutor.getRecommendedModel('narrative')).toBe('openai-tts');
        expect(SubtitleAssetExecutor.getRecommendedModel('dialog')).toBe('openai-tts');
        expect(SubtitleAssetExecutor.getRecommendedModel('ui_feedback')).toBe('google-tts');
      });
    });

    describe('getRecommendedVoice', () => {
      it('should return correct voice configurations', () => {
        const narratorVoice = SubtitleAssetExecutor.getRecommendedVoice('narrator');
        expect(narratorVoice).toEqual({
          voice_gender: 'neutral',
          voice_tone: 'epic',
          voice_pace: 'normal'
        });

        const characterVoice = SubtitleAssetExecutor.getRecommendedVoice('character');
        expect(characterVoice).toEqual({
          voice_gender: 'feminine',
          voice_tone: 'mysterious',
          voice_pace: 'normal'
        });

        const systemVoice = SubtitleAssetExecutor.getRecommendedVoice('system');
        expect(systemVoice).toEqual({
          voice_gender: 'neutral',
          voice_tone: 'calm',
          voice_pace: 'normal'
        });
      });
    });

    describe('estimateSpeechDuration', () => {
      it('should estimate duration correctly for different paces', () => {
        const text = 'This is a test sentence with exactly ten words here.';
        
        const slowDuration = SubtitleAssetExecutor.estimateSpeechDuration(text, 'slow');
        const normalDuration = SubtitleAssetExecutor.estimateSpeechDuration(text, 'normal');
        const fastDuration = SubtitleAssetExecutor.estimateSpeechDuration(text, 'fast');
        
        expect(slowDuration).toBeGreaterThan(normalDuration);
        expect(normalDuration).toBeGreaterThan(fastDuration);
        expect(slowDuration).toBeGreaterThan(0);
      });

      it('should return minimum 1 second', () => {
        const shortText = 'Hi';
        const duration = SubtitleAssetExecutor.estimateSpeechDuration(shortText);
        expect(duration).toBeGreaterThanOrEqual(1);
      });
    });

    describe('cleanTextForTTS', () => {
      it('should clean text properly', () => {
        const dirtyText = '**Bold** _italic_ `code` with...extra  spaces   and no ending';
        const cleaned = SubtitleAssetExecutor.cleanTextForTTS(dirtyText);
        
        expect(cleaned).toBe('Bold italic code with.extra spaces and no ending.');
        expect(cleaned).not.toContain('**');
        expect(cleaned).not.toContain('_');
        expect(cleaned).not.toContain('`');
        expect(cleaned).not.toContain('...');
        expect(cleaned).not.toContain('  '); // Multiple spaces
        expect(cleaned.endsWith('.')).toBe(true);
      });

      it('should preserve existing sentence endings', () => {
        const textWithEnding = 'This already ends properly!';
        const cleaned = SubtitleAssetExecutor.cleanTextForTTS(textWithEnding);
        
        expect(cleaned).toBe('This already ends properly!');
      });
    });
  });

  describe('error handling', () => {
    it('should handle API failures with retry', async () => {
      const action = mockActions.subtitle();
      
      // Mock API to fail initially then succeed
      let callCount = 0;
      const originalCallOpenAITTS = executor['callOpenAITTS'];
      executor['callOpenAITTS'] = async (...args) => {
        callCount++;
        if (callCount === 1) {
          throw new Error('API temporary failure');
        }
        return originalCallOpenAITTS.apply(executor, args);
      };

      const result = await executor.execute(action, mockContext);
      
      expect(result).toBeDefined();
      expect(callCount).toBe(2);
    });

    it('should fail after max retries', async () => {
      const action = mockActions.subtitle();
      
      // Mock APIs to always fail
      executor['callOpenAITTS'] = async () => {
        throw new Error('Persistent API failure');
      };
      executor['callGoogleTTS'] = async () => {
        throw new Error('Persistent API failure');
      };

      await expect(executor.execute(action, mockContext)).rejects.toThrow(
        'TTS generation failed after 3 attempts'
      );
    });

    it('should throw error for invalid action', async () => {
      const action = mockActions.subtitle({ id: '', text: '' });

      await expect(executor.execute(action, mockContext)).rejects.toThrow();
    });
  });

  describe('audio duration estimation', () => {
    it('should estimate reasonable durations', async () => {
      const shortText = 'Hello world';
      const longText = 'This is a much longer piece of text that should result in a longer audio duration when converted to speech using text-to-speech technology.';

      const shortAction = mockActions.subtitle({ text: shortText });
      const longAction = mockActions.subtitle({ text: longText });

      const shortResult = await executor.execute(shortAction, mockContext);
      const longResult = await executor.execute(longAction, mockContext);

      expect(shortResult.duration).toBeLessThan(longResult.duration);
      expect(shortResult.duration).toBeGreaterThan(0);
    });
  });
});