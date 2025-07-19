import { LLMService, LLMConfig } from './types'
import { MockLLMService } from './mock'
import { GeminiLLMService } from './gemini'

export * from './types'
export { MockLLMService } from './mock'
export { GeminiLLMService } from './gemini'

export function createLLMService(config: LLMConfig): LLMService {
  // Use mock service if explicitly requested or if no API key is available
  if (config.mock || !config.apiKey) {
    console.log('🤖 Using Mock LLM Service for development')
    return new MockLLMService()
  }

  try {
    console.log('🚀 Initializing Gemini LLM Service')
    return new GeminiLLMService(config)
  } catch (error) {
    console.warn('⚠️ Failed to initialize Gemini service, falling back to mock:', error)
    return new MockLLMService()
  }
}

export function createLLMServiceFromEnv(): LLMService {
  const config: LLMConfig = {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY,
    mock: import.meta.env.VITE_LLM_MOCK_MODE === 'true',
    temperature: parseFloat(import.meta.env.VITE_LLM_TEMPERATURE || '0.8'),
    model: import.meta.env.VITE_LLM_MODEL || 'gemini-1.5-flash'
  }

  return createLLMService(config)
}

// Helper function to validate LLM configuration
export function validateLLMConfig(config: LLMConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!config.mock && !config.apiKey) {
    errors.push('API key is required when not in mock mode')
  }

  if (config.temperature !== undefined && (config.temperature < 0 || config.temperature > 2)) {
    errors.push('Temperature must be between 0 and 2')
  }

  if (config.model && !config.model.startsWith('gemini-')) {
    errors.push('Only Gemini models are currently supported')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Singleton instance for easy use throughout the application
let _llmServiceInstance: LLMService | null = null

export function getLLMService(): LLMService {
  if (!_llmServiceInstance) {
    _llmServiceInstance = createLLMServiceFromEnv()
  }
  return _llmServiceInstance
}

// Reset singleton for testing purposes
export function resetLLMService(): void {
  _llmServiceInstance = null
}