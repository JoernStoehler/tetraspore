import { Choice, Species, Feature } from '../../types'
import { GameEvent } from '../../types/events'
import { LLMService, GameContext, LLMConfig, LLMResponse, PromptTemplate } from './types'

interface GeminiRequest {
  contents: Array<{
    parts: Array<{
      text: string
    }>
  }>
  generationConfig?: {
    temperature?: number
    topK?: number
    topP?: number
    maxOutputTokens?: number
    responseMimeType?: string
  }
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
    }
    finishReason: string
  }>
  usageMetadata?: {
    promptTokenCount: number
    candidatesTokenCount: number
    totalTokenCount: number
  }
}

export class GeminiLLMService implements LLMService {
  private readonly apiKey: string
  private readonly model: string
  private readonly temperature: number
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models'

  constructor(config: LLMConfig) {
    if (!config.apiKey) {
      throw new Error('Gemini API key is required')
    }
    this.apiKey = config.apiKey
    this.model = config.model || 'gemini-1.5-flash'
    this.temperature = config.temperature || 0.8
  }

  async generateChoices(context: GameContext): Promise<Choice[]> {
    const prompt = this.buildChoicesPrompt(context)
    const response = await this.makeRequest<Choice[]>(prompt)
    return this.validateAndFilterChoices(response.data)
  }

  async generateNarration(event: GameEvent): Promise<string> {
    const prompt = this.buildNarrationPrompt(event)
    const response = await this.makeRequest<string>(prompt)
    return response.data
  }

  async generateSpeciesDescription(species: Species): Promise<string> {
    const prompt = this.buildSpeciesDescriptionPrompt(species)
    const response = await this.makeRequest<string>(prompt)
    return response.data
  }

  async evolveSpeciesName(species: Species, feature: Feature): Promise<string> {
    const prompt = this.buildSpeciesNamePrompt(species, feature)
    const response = await this.makeRequest<string>(prompt)
    return response.data
  }

  private async makeRequest<T>(prompt: PromptTemplate, retries = 3): Promise<LLMResponse<T>> {
    const request: GeminiRequest = {
      contents: [
        {
          parts: [{ text: `${prompt.system}\n\n${prompt.user}` }]
        }
      ],
      generationConfig: {
        temperature: this.temperature,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
        responseMimeType: 'application/json'
      }
    }

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(
          `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(request)
          }
        )

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`Gemini API error (${response.status}): ${errorText}`)
        }

        const geminiResponse: GeminiResponse = await response.json()
        
        if (!geminiResponse.candidates || geminiResponse.candidates.length === 0) {
          throw new Error('No candidates returned from Gemini API')
        }

        const content = geminiResponse.candidates[0].content.parts[0].text
        let parsedData: T

        try {
          parsedData = JSON.parse(content)
        } catch {
          // If JSON parsing fails, return as string for narration-type requests
          parsedData = content as unknown as T
        }

        return {
          data: parsedData,
          usage: geminiResponse.usageMetadata ? {
            promptTokens: geminiResponse.usageMetadata.promptTokenCount,
            completionTokens: geminiResponse.usageMetadata.candidatesTokenCount,
            totalTokens: geminiResponse.usageMetadata.totalTokenCount
          } : undefined,
          model: this.model
        }

      } catch (error) {
        console.error(`Gemini API attempt ${attempt + 1} failed:`, error)
        
        if (attempt === retries - 1) {
          throw new Error(`Gemini API failed after ${retries} attempts: ${error}`)
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }

    throw new Error('Unexpected error in Gemini API request')
  }

  private buildChoicesPrompt(context: GameContext): PromptTemplate {
    const { gameState, currentTurn, recentEvents } = context
    const activeSpeciesNames = Array.from(gameState.species.keys()).slice(0, 5)
    const recentEventSummary = recentEvents.slice(0, 3).map(e => e.type).join(', ')

    return {
      system: `You are an evolutionary game AI generating meaningful evolution choices for the game "Tetraspore". 

CONTEXT: This is a strategic evolution game where players guide species through millions of years of development. Choices should be:
- Scientifically plausible but creative
- Appropriate for the current evolutionary stage
- Balanced between different categories
- Engaging and atmospheric

TONE: Scientific wonder mixed with poetic descriptions. Think David Attenborough meets speculative evolution.`,

      user: `Generate 4-6 evolution choices for turn ${currentTurn}.

CURRENT CONTEXT:
- Active species: ${activeSpeciesNames.join(', ')}
- Recent events: ${recentEventSummary}
- Turn: ${currentTurn}

REQUIREMENTS:
- Include choices from different categories: physical, cognitive, social, technological
- Each choice should have compelling tradeoffs
- Descriptions should be 1-2 sentences
- Include atmospheric flavor text
- Ensure choices are relevant to the current evolutionary stage

Return as JSON array:
[
  {
    "title": "Choice Name",
    "description": "Clear description of the evolutionary change",
    "category": "physical|cognitive|social|technological",
    "flavorText": "Atmospheric description that captures the wonder of evolution"
  }
]`,

      examples: [
        {
          input: "Turn 5, early species development",
          output: `[
  {
    "title": "Enhanced Neural Networks",
    "description": "Develop more complex brain structures for improved problem-solving",
    "category": "cognitive",
    "flavorText": "Synapses spark with new possibilities as consciousness deepens"
  },
  {
    "title": "Pack Coordination",
    "description": "Evolve sophisticated group hunting and social behaviors",
    "category": "social", 
    "flavorText": "Individual voices join in harmony of shared purpose"
  }
]`
        }
      ]
    }
  }

  private buildNarrationPrompt(event: GameEvent): PromptTemplate {
    return {
      system: `You are a narrative AI for the evolution game "Tetraspore". Generate atmospheric, poetic narration for game events.

STYLE: 
- 2-3 sentences maximum
- Poetic but not overwrought
- Scientific accuracy with emotional resonance
- Focus on the wonder and significance of evolutionary moments
- Avoid overly dramatic language`,

      user: `Create narration for this game event:
Event Type: ${event.type}
Event Data: ${JSON.stringify(event)}

The narration should capture the significance of this evolutionary moment while maintaining a sense of scientific wonder.`,

      examples: [
        {
          input: `Event Type: CREATE_SPECIES
Event Data: {"type":"CREATE_SPECIES","name":"Sapien Wanderer","description":"Highly intelligent bipedal species"}`,
          output: `"In the crucible of evolution, Sapien Wanderer emerges with remarkable adaptations. Their bipedal stance lifts eyes toward distant horizons while intelligence sparks in complex neural pathways. This new chapter in life's grand story begins with promise and uncertainty."`
        }
      ]
    }
  }

  private buildSpeciesDescriptionPrompt(species: Species): PromptTemplate {
    return {
      system: `You are generating detailed species descriptions for the evolution game "Tetraspore".

STYLE:
- 3-4 sentences
- Scientific but accessible
- Emphasize unique adaptations and ecological role
- Connect current form to evolutionary history`,

      user: `Generate a rich description for this species:
Name: ${species.name}
Current Description: ${species.description}
Evolution Year: ${species.evolutionYear}
Parent Species: ${species.parentSpecies || 'None'}
Current Regions: ${Array.from(species.currentRegions).join(', ')}
Is Extinct: ${species.isExtinct}

Expand on their current description with details about their adaptations, behavior, and ecological significance.`,

      examples: [
        {
          input: "Species: Tree Climber, evolved from Ground Walker",
          output: `"Tree Climber represents nature's ingenious solution to vertical living. Their elongated limbs and enhanced grip strength allow them to navigate complex canopy environments with remarkable agility. Born from the Ground Walker lineage, they have traded terrestrial stability for arboreal mastery, becoming living bridges between earth and sky."`
        }
      ]
    }
  }

  private buildSpeciesNamePrompt(species: Species, feature: Feature): PromptTemplate {
    return {
      system: `You are generating evolved species names for the evolution game "Tetraspore".

GUIDELINES:
- Names should reflect the influence of the new feature
- Keep the essence of the original species
- Use evocative but not overly complex names
- Consider the feature's category: ecology, geology, technology, culture`,

      user: `Generate an evolved name for this species as they adapt to a new feature:

Current Species: ${species.name}
Species Description: ${species.description}
New Feature: ${feature.name}
Feature Category: ${feature.category}
Feature Description: ${feature.description}

The new name should reflect how this feature influences their evolution while maintaining connection to their original identity.`,

      examples: [
        {
          input: "Species: Forest Dweller, Feature: Crystal Caves (geology)",
          output: `"Crystal Forest Dweller"`
        },
        {
          input: "Species: Swift Hunter, Feature: Sacred Grove (culture)", 
          output: `"Sacred Swift Hunter"`
        }
      ]
    }
  }

  private validateAndFilterChoices(choices: Choice[]): Choice[] {
    if (!Array.isArray(choices)) {
      throw new Error('Generated choices must be an array')
    }

    const validChoices = choices.filter(choice => {
      return choice.title && 
             choice.description && 
             choice.category &&
             ['physical', 'cognitive', 'social', 'technological'].includes(choice.category)
    })

    if (validChoices.length === 0) {
      throw new Error('No valid choices generated')
    }

    // Ensure variety across categories
    const categories = new Set(validChoices.map(c => c.category))
    if (categories.size < 2) {
      console.warn('Generated choices lack category diversity')
    }

    return validChoices.slice(0, 6) // Limit to maximum 6 choices
  }
}