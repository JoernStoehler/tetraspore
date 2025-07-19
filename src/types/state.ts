export interface Species {
  name: string
  description: string
  imagePrompt: string
  parentSpecies?: string
  evolutionYear: number
  isExtinct: boolean
  extinctionReason?: string
  currentRegions: Set<string>
}

export interface Region {
  name: string
  description: string
  imagePrompt: string
  center: { lat: number, lon: number }
  weight?: number
  currentSpecies: Set<string>
  features: Set<string>
}

export interface Feature {
  name: string
  description: string
  category: 'ecology' | 'geology' | 'technology' | 'culture'
  regionName: string
}

export interface Choice {
  id: string
  title: string
  description: string
  category: 'physical' | 'cognitive' | 'social' | 'technological'
  prerequisites?: string[]
  flavorText?: string
}

export interface GameState {
  species: Map<string, Species>
  regions: Map<string, Region>
  features: Map<string, Feature>
  activeChoices: Choice[]
  currentTurn: number
  isInitialized: boolean
}

export type ViewType = 'main' | 'tree' | 'map' | 'choices'

export interface UIState {
  currentView: ViewType
  selectedRegion: string | null
  selectedSpecies: string | null
  selectedChoice: string | null
  isLoading: boolean
}