import { GameState } from '../types'

/**
 * State invariant - something that should always be true about the game state.
 * If these are violated, we have a bug in our event handlers.
 */
export interface StateInvariant {
  name: string
  check: (state: GameState) => string | null  // Returns error message or null if valid
}

/**
 * All state invariants that must hold after every event.
 * Add new invariants here as we discover them.
 */
export const stateInvariants: StateInvariant[] = [
  {
    name: 'Bidirectional Species-Region Consistency',
    check: (state) => {
      // Check that Species.currentRegions matches Region.currentSpecies
      for (const [speciesName, species] of state.species) {
        for (const regionName of species.currentRegions) {
          const region = state.regions.get(regionName)
          if (!region) {
            return `Species ${speciesName} references non-existent region ${regionName}`
          }
          if (!region.currentSpecies.has(speciesName)) {
            return `Species ${speciesName} thinks it's in ${regionName} but region doesn't list it`
          }
        }
      }
      
      // Check reverse direction
      for (const [regionName, region] of state.regions) {
        for (const speciesName of region.currentSpecies) {
          const species = state.species.get(speciesName)
          if (!species) {
            return `Region ${regionName} references non-existent species ${speciesName}`
          }
          if (!species.currentRegions.has(regionName)) {
            return `Region ${regionName} lists ${speciesName} but species doesn't know about it`
          }
        }
      }
      
      return null
    }
  },
  
  {
    name: 'Feature-Region Consistency',
    check: (state) => {
      // Check that all features reference valid regions
      for (const [featureName, feature] of state.features) {
        const region = state.regions.get(feature.regionName)
        if (!region) {
          return `Feature ${featureName} references non-existent region ${feature.regionName}`
        }
        if (!region.features.has(featureName)) {
          return `Feature ${featureName} belongs to ${feature.regionName} but region doesn't list it`
        }
      }
      
      // Check reverse direction
      for (const [regionName, region] of state.regions) {
        for (const featureName of region.features) {
          const feature = state.features.get(featureName)
          if (!feature) {
            return `Region ${regionName} references non-existent feature ${featureName}`
          }
          if (feature.regionName !== regionName) {
            return `Region ${regionName} lists feature ${featureName} but feature belongs to ${feature.regionName}`
          }
        }
      }
      
      return null
    }
  },
  
  {
    name: 'Extinct Species Have No Regions',
    check: (state) => {
      for (const [speciesName, species] of state.species) {
        if (species.isExtinct && species.currentRegions.size > 0) {
          return `Extinct species ${speciesName} still has regions: ${Array.from(species.currentRegions).join(', ')}`
        }
      }
      return null
    }
  },
  
  {
    name: 'Turn Number Non-Negative',
    check: (state) => {
      if (state.currentTurn < 0) {
        return `Turn number is negative: ${state.currentTurn}`
      }
      return null
    }
  },
  
  {
    name: 'No Duplicate Names',
    check: (state) => {
      // Check species names are unique (Map ensures this, but let's be explicit)
      const speciesNames = new Set<string>()
      for (const name of state.species.keys()) {
        if (speciesNames.has(name)) {
          return `Duplicate species name: ${name}`
        }
        speciesNames.add(name)
      }
      
      // Check region names are unique
      const regionNames = new Set<string>()
      for (const name of state.regions.keys()) {
        if (regionNames.has(name)) {
          return `Duplicate region name: ${name}`
        }
        regionNames.add(name)
      }
      
      // Check feature names are unique
      const featureNames = new Set<string>()
      for (const name of state.features.keys()) {
        if (featureNames.has(name)) {
          return `Duplicate feature name: ${name}`
        }
        featureNames.add(name)
      }
      
      return null
    }
  }
]

/**
 * Validate all state invariants.
 * Returns array of error messages (empty if state is valid).
 */
export function validateStateInvariants(state: GameState): string[] {
  const errors: string[] = []
  
  for (const invariant of stateInvariants) {
    const error = invariant.check(state)
    if (error) {
      errors.push(`[${invariant.name}] ${error}`)
    }
  }
  
  return errors
}

/**
 * Development helper - logs state validation errors to console.
 * In production, you might want to send these to error tracking.
 */
export function checkStateHealth(state: GameState): boolean {
  const errors = validateStateInvariants(state)
  
  if (errors.length > 0) {
    console.error('State invariant violations detected:')
    for (const error of errors) {
      console.error(`  - ${error}`)
    }
    return false
  }
  
  return true
}