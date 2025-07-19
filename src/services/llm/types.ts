import { Choice, Species, Feature, GameState } from '../../types'
import { GameEvent } from '../../types/events'

export interface GameContext {
  gameState: GameState
  currentTurn: number
  recentEvents: GameEvent[]
  activeSpecies: Species[]
  availableFeatures: Feature[]
}

export interface LLMConfig {
  apiKey?: string
  mock: boolean
  temperature?: number
  model?: string
}

export interface LLMService {
  generateChoices(context: GameContext): Promise<Choice[]>
  generateNarration(event: GameEvent): Promise<string>
  generateSpeciesDescription(species: Species): Promise<string>
  evolveSpeciesName(species: Species, feature: Feature): Promise<string>
}

export interface LLMResponse<T> {
  data: T
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model?: string
}

export interface PromptTemplate {
  system: string
  user: string
  examples?: Array<{
    input: string
    output: string
  }>
}