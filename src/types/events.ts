export type GameEvent = 
  | {
      type: 'CREATE_SPECIES'
      name: string
      description: string
      imagePrompt: string
      parentSpecies?: string
      evolutionYear: number
      timestamp: number
    }
  | {
      type: 'EXTINCT_SPECIES'
      speciesName: string
      reason?: string
      time: number
      timestamp: number
    }
  | {
      type: 'SPECIES_ENTERS_REGION'
      speciesName: string
      regionName: string
      time: number
      timestamp: number
    }
  | {
      type: 'SPECIES_LEAVES_REGION'
      speciesName: string
      regionName: string
      time: number
      timestamp: number
    }
  | {
      type: 'CREATE_REGION'
      name: string
      description: string
      imagePrompt: string
      center: { lat: number, lon: number }
      weight?: number
      timestamp: number
    }
  | {
      type: 'CREATE_FEATURE'
      name: string
      description: string
      category: 'ecology' | 'geology' | 'technology' | 'culture'
      regionName: string
      time: number
      timestamp: number
    }
  | {
      type: 'DELETE_FEATURE'
      featureName: string
      regionName: string
      time: number
      timestamp: number
    }
  | {
      type: 'CHOICE_SELECTED'
      choiceId: string
      playerId: string
      selection: number[]
      time: number
      timestamp: number
    }
  | {
      type: 'TURN_PROCESSED'
      turnNumber: number
      outcomes: unknown[]
      time: number
      timestamp: number
    }

export interface EventValidation {
  isValid: boolean
  error?: string
}

export function validateEvent(event: GameEvent): EventValidation {
  if (!event.type) {
    return { isValid: false, error: 'Event must have a type' }
  }
  
  if (!event.timestamp || event.timestamp <= 0) {
    return { isValid: false, error: 'Event must have a valid timestamp' }
  }

  // Exhaustive validation for all event types
  switch (event.type) {
    case 'CREATE_SPECIES':
      if (!event.name || !event.description) {
        return { isValid: false, error: 'Species must have name and description' }
      }
      if (!event.imagePrompt) {
        return { isValid: false, error: 'Species must have imagePrompt' }
      }
      if (typeof event.evolutionYear !== 'number') {
        return { isValid: false, error: 'Species must have valid evolutionYear' }
      }
      break
      
    case 'EXTINCT_SPECIES':
      if (!event.speciesName) {
        return { isValid: false, error: 'Extinction must specify speciesName' }
      }
      if (typeof event.time !== 'number') {
        return { isValid: false, error: 'Extinction must have valid time' }
      }
      break
      
    case 'SPECIES_ENTERS_REGION':
    case 'SPECIES_LEAVES_REGION':
      if (!event.speciesName || !event.regionName) {
        return { isValid: false, error: 'Region transition must have species and region names' }
      }
      if (typeof event.time !== 'number') {
        return { isValid: false, error: 'Region transition must have valid time' }
      }
      break
      
    case 'CREATE_REGION':
      if (!event.name || !event.center || 
          typeof event.center.lat !== 'number' || 
          typeof event.center.lon !== 'number') {
        return { isValid: false, error: 'Region must have name and valid coordinates' }
      }
      if (!event.description || !event.imagePrompt) {
        return { isValid: false, error: 'Region must have description and imagePrompt' }
      }
      break
      
    case 'CREATE_FEATURE':
      if (!event.name || !event.description || !event.regionName) {
        return { isValid: false, error: 'Feature must have name, description, and region' }
      }
      if (!['ecology', 'geology', 'technology', 'culture'].includes(event.category)) {
        return { isValid: false, error: 'Feature must have valid category' }
      }
      if (typeof event.time !== 'number') {
        return { isValid: false, error: 'Feature must have valid time' }
      }
      break
      
    case 'DELETE_FEATURE':
      if (!event.featureName || !event.regionName) {
        return { isValid: false, error: 'Feature deletion must specify feature and region names' }
      }
      if (typeof event.time !== 'number') {
        return { isValid: false, error: 'Feature deletion must have valid time' }
      }
      break
      
    case 'CHOICE_SELECTED':
      if (!event.choiceId || !event.playerId || !Array.isArray(event.selection)) {
        return { isValid: false, error: 'Choice must have ID, player, and selection array' }
      }
      if (typeof event.time !== 'number') {
        return { isValid: false, error: 'Choice must have valid time' }
      }
      break
      
    case 'TURN_PROCESSED':
      if (typeof event.turnNumber !== 'number' || event.turnNumber < 0) {
        return { isValid: false, error: 'Turn must have valid turnNumber' }
      }
      if (!Array.isArray(event.outcomes)) {
        return { isValid: false, error: 'Turn must have outcomes array' }
      }
      if (typeof event.time !== 'number') {
        return { isValid: false, error: 'Turn must have valid time' }
      }
      break
      
    default: {
      // This ensures we handle all cases - TypeScript will error if we miss one
      const _exhaustive: never = event
      return { isValid: false, error: `Unknown event type: ${(_exhaustive as GameEvent).type}` }
    }
  }

  return { isValid: true }
}