import { describe, it, expect, beforeEach, vi } from 'vitest'
import { MockLLMService } from './mock'
import { GeminiLLMService } from './gemini'
import { createLLMService, validateLLMConfig, resetLLMService } from './index'
import { GameContext, LLMConfig } from './types'
import { GameState, Species, Feature } from '../../types'
import { GameEvent } from '../../types/events'

// Mock fetch for Gemini tests
global.fetch = vi.fn()

describe('LLM Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetLLMService()
  })

  describe('MockLLMService', () => {
    let mockService: MockLLMService
    let mockContext: GameContext

    beforeEach(() => {
      mockService = new MockLLMService()
      
      const gameState: GameState = {
        species: new Map([
          ['test-species', {
            name: 'Test Species',
            description: 'A test species for unit testing',
            imagePrompt: 'test image prompt',
            evolutionYear: 1000,
            isExtinct: false,
            currentRegions: new Set(['test-region'])
          }]
        ]),
        regions: new Map([
          ['test-region', {
            name: 'Test Region',
            description: 'A test region',
            imagePrompt: 'test region image',
            center: { lat: 0, lon: 0 },
            currentSpecies: new Set(['test-species']),
            features: new Set(['test-feature'])
          }]
        ]),
        features: new Map([
          ['test-feature', {
            name: 'Test Feature',
            description: 'A test feature',
            category: 'ecology',
            regionName: 'test-region'
          }]
        ]),
        activeChoices: [],
        currentTurn: 5,
        isInitialized: true
      }

      mockContext = {
        gameState,
        currentTurn: 5,
        recentEvents: [],
        activeSpecies: Array.from(gameState.species.values()),
        availableFeatures: Array.from(gameState.features.values())
      }
    })

    it('should generate varied choices', async () => {
      const choices = await mockService.generateChoices(mockContext)
      
      expect(choices.length).toBeGreaterThanOrEqual(4)
      expect(choices.length).toBeLessThanOrEqual(6)
      
      // Check that choices have required properties
      choices.forEach(choice => {
        expect(choice).toHaveProperty('id')
        expect(choice).toHaveProperty('title')
        expect(choice).toHaveProperty('description')
        expect(choice).toHaveProperty('category')
        expect(['physical', 'cognitive', 'social', 'technological']).toContain(choice.category)
      })

      // Should have variety across categories
      const categories = new Set(choices.map(c => c.category))
      expect(categories.size).toBeGreaterThanOrEqual(2)
    })

    it('should generate different choices on subsequent calls', async () => {
      const choices1 = await mockService.generateChoices(mockContext)
      const choices2 = await mockService.generateChoices(mockContext)
      
      // At least some choices should be different
      const titles1 = new Set(choices1.map(c => c.title))
      const titles2 = new Set(choices2.map(c => c.title))
      const intersection = new Set([...titles1].filter(x => titles2.has(x)))
      
      expect(intersection.size).toBeLessThan(Math.min(titles1.size, titles2.size))
    })

    it('should generate narration for events', async () => {
      const event: GameEvent = {
        type: 'CREATE_SPECIES',
        name: 'New Species',
        description: 'A newly evolved species',
        imagePrompt: 'test image',
        evolutionYear: 2000,
        timestamp: Date.now()
      }

      const narration = await mockService.generateNarration(event)
      
      expect(narration).toBeTruthy()
      expect(typeof narration).toBe('string')
      expect(narration.length).toBeGreaterThan(50)
      expect(narration).toContain('New Species')
    })

    it('should generate species descriptions', async () => {
      const species: Species = {
        name: 'Test Species',
        description: 'Original description',
        imagePrompt: 'test',
        evolutionYear: 1000,
        isExtinct: false,
        currentRegions: new Set(['region1'])
      }

      const description = await mockService.generateSpeciesDescription(species)
      
      expect(description).toBeTruthy()
      expect(typeof description).toBe('string')
      expect(description.length).toBeGreaterThan(100)
      expect(description).toContain('Test Species')
    })

    it('should evolve species names', async () => {
      const species: Species = {
        name: 'Base Species',
        description: 'A base species',
        imagePrompt: 'test',
        evolutionYear: 1000,
        isExtinct: false,
        currentRegions: new Set()
      }

      const feature: Feature = {
        name: 'Crystal Caves',
        description: 'Mysterious crystal formations',
        category: 'geology',
        regionName: 'test-region'
      }

      const newName = await mockService.evolveSpeciesName(species, feature)
      
      expect(newName).toBeTruthy()
      expect(typeof newName).toBe('string')
      expect(newName).not.toBe(species.name)
      // Should incorporate either the original name or feature influence
      expect(newName.toLowerCase()).toMatch(/(base|species|crystal|cave|stone|deep)/i)
    })

    it('should simulate realistic delay', async () => {
      const startTime = Date.now()
      await mockService.generateChoices(mockContext)
      const endTime = Date.now()
      
      const delay = endTime - startTime
      expect(delay).toBeGreaterThanOrEqual(800) // Minimum delay
      expect(delay).toBeLessThan(1500) // Should not be too slow for tests
    })
  })

  describe('GeminiLLMService', () => {
    let geminiService: GeminiLLMService
    let mockFetch: ReturnType<typeof vi.fn>

    beforeEach(() => {
      mockFetch = vi.mocked(fetch)
      const config: LLMConfig = {
        apiKey: 'test-api-key',
        mock: false,
        temperature: 0.8,
        model: 'gemini-1.5-flash'
      }
      geminiService = new GeminiLLMService(config)
    })

    it('should throw error without API key', () => {
      expect(() => {
        new GeminiLLMService({ mock: false })
      }).toThrow('Gemini API key is required')
    })

    it('should make successful API call for choices', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify([{
                title: 'Test Choice',
                description: 'A test evolutionary choice',
                category: 'physical',
                flavorText: 'Test flavor text'
              }])
            }]
          },
          finishReason: 'STOP'
        }],
        usageMetadata: {
          promptTokenCount: 100,
          candidatesTokenCount: 50,
          totalTokenCount: 150
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response)

      const mockContext: GameContext = {
        gameState: {
          species: new Map(),
          regions: new Map(),
          features: new Map(),
          activeChoices: [],
          currentTurn: 1,
          isInitialized: true
        },
        currentTurn: 1,
        recentEvents: [],
        activeSpecies: [],
        availableFeatures: []
      }

      const choices = await geminiService.generateChoices(mockContext)
      
      expect(choices).toHaveLength(1)
      expect(choices[0].title).toBe('Test Choice')
      expect(choices[0].category).toBe('physical')
    })

    it('should handle API errors with retry', async () => {
      // First two calls fail, third succeeds
      mockFetch
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            candidates: [{
              content: {
                parts: [{ text: '"Success after retry"' }]
              },
              finishReason: 'STOP'
            }]
          })
        } as Response)

      const mockEvent: GameEvent = {
        type: 'CREATE_SPECIES',
        name: 'Test',
        description: 'Test',
        imagePrompt: 'test',
        evolutionYear: 1000,
        timestamp: Date.now()
      }

      const result = await geminiService.generateNarration(mockEvent)
      expect(result).toBe('Success after retry')
      expect(mockFetch).toHaveBeenCalledTimes(3)
    })

    it('should filter invalid choices', async () => {
      const mockResponse = {
        candidates: [{
          content: {
            parts: [{
              text: JSON.stringify([
                {
                  title: 'Valid Choice',
                  description: 'A valid choice',
                  category: 'physical',
                  flavorText: 'Test'
                },
                {
                  title: '', // Invalid - no title
                  description: 'Invalid choice',
                  category: 'physical'
                },
                {
                  title: 'Another Valid',
                  description: 'Valid description',
                  category: 'invalid-category' // Invalid category
                }
              ])
            }]
          },
          finishReason: 'STOP'
        }]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response)

      const mockContext: GameContext = {
        gameState: {
          species: new Map(),
          regions: new Map(),
          features: new Map(),
          activeChoices: [],
          currentTurn: 1,
          isInitialized: true
        },
        currentTurn: 1,
        recentEvents: [],
        activeSpecies: [],
        availableFeatures: []
      }

      const choices = await geminiService.generateChoices(mockContext)
      
      // Should only return the valid choice
      expect(choices).toHaveLength(1)
      expect(choices[0].title).toBe('Valid Choice')
    })
  })

  describe('LLM Service Factory', () => {
    it('should create mock service when mock=true', () => {
      const config: LLMConfig = {
        mock: true,
        apiKey: 'test-key'
      }
      
      const service = createLLMService(config)
      expect(service).toBeInstanceOf(MockLLMService)
    })

    it('should create mock service when no API key', () => {
      const config: LLMConfig = {
        mock: false
      }
      
      const service = createLLMService(config)
      expect(service).toBeInstanceOf(MockLLMService)
    })

    it('should create Gemini service with valid config', () => {
      const config: LLMConfig = {
        mock: false,
        apiKey: 'test-api-key'
      }
      
      const service = createLLMService(config)
      expect(service).toBeInstanceOf(GeminiLLMService)
    })
  })

  describe('Configuration Validation', () => {
    it('should validate correct config', () => {
      const config: LLMConfig = {
        mock: false,
        apiKey: 'test-key',
        temperature: 0.8,
        model: 'gemini-1.5-flash'
      }
      
      const result = validateLLMConfig(config)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject missing API key in non-mock mode', () => {
      const config: LLMConfig = {
        mock: false
      }
      
      const result = validateLLMConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('API key is required when not in mock mode')
    })

    it('should reject invalid temperature', () => {
      const config: LLMConfig = {
        mock: false,
        apiKey: 'test-key',
        temperature: 3.0 // Invalid
      }
      
      const result = validateLLMConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Temperature must be between 0 and 2')
    })

    it('should reject unsupported model', () => {
      const config: LLMConfig = {
        mock: false,
        apiKey: 'test-key',
        model: 'gpt-4' // Unsupported
      }
      
      const result = validateLLMConfig(config)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Only Gemini models are currently supported')
    })
  })
})