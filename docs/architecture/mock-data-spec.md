# Mock Data Structure Specifications

This document defines the data structures used in Tetraspore for UI prototyping. These structures represent the game state after event aggregation.

## Core Data Types

### Planet

The central entity in the game - a living world with regions, species, and civilizations.

```typescript
interface Planet {
  id: string;
  name: string;
  age: number; // in millions of years

  // Physical properties
  radius: number; // km
  gravity: number; // relative to Earth (1.0)
  atmosphere: Atmosphere;

  // Subdivisions
  regions: Region[];

  // Life
  species: Species[];
  extinctSpecies: Species[]; // Historical record

  // Civilizations
  civilizations: Civilization[];

  // Global stats
  biodiversity: number; // 0-100
  temperature: number; // average in Celsius
  seaLevel: number; // percentage of surface
}

interface Atmosphere {
  oxygen: number; // percentage
  carbonDioxide: number;
  nitrogen: number;
  other: number;
  pressure: number; // atmospheres
}
```

### Region

Geographical areas where species live and evolve.

```typescript
interface Region {
  id: string;
  name: string;
  type: RegionType;

  // Geography
  area: number; // km²
  elevation: number; // meters above sea level
  coordinates: {
    latitude: number;
    longitude: number;
  };

  // Climate
  temperature: number; // average Celsius
  humidity: number; // percentage
  rainfall: number; // mm per year

  // Biome
  biome: BiomeType;
  resources: ResourceMap;

  // Connections
  adjacentRegionIds: string[];

  // Life
  speciesPopulations: SpeciesPopulation[];
}

type RegionType =
  | "continental"
  | "coastal"
  | "island"
  | "ocean"
  | "polar"
  | "mountain";

type BiomeType =
  | "desert"
  | "forest"
  | "grassland"
  | "tundra"
  | "wetland"
  | "ocean"
  | "reef"
  | "volcanic";

interface ResourceMap {
  water: number; // 0-100 abundance
  vegetation: number;
  minerals: number;
  energy: number; // geothermal, solar potential, etc.
}

interface SpeciesPopulation {
  speciesId: string;
  population: number;
  density: number; // per km²
  health: number; // 0-100
}
```

### Species

Living organisms that evolve over time.

```typescript
interface Species {
  id: string;
  name: string;
  scientificName: string;

  // Evolution
  ancestorId: string | null;
  evolutionaryAge: number; // turns since emergence
  extinct: boolean;
  extinctionTurn?: number;

  // Traits
  traits: Trait[];

  // Appearance
  appearance: {
    size: SpeciesSize;
    primaryColor: string; // hex color
    secondaryColor: string;
    texture: TextureType;
    iconUrl?: string; // for UI display
  };

  // Stats
  totalPopulation: number;
  populationTrend: "increasing" | "stable" | "decreasing";

  // Behavior
  diet: DietType;
  habitat: BiomeType[];
  migrationPattern: "sedentary" | "nomadic" | "seasonal";

  // Reproduction
  reproductionRate: number; // offspring per turn
  maturityAge: number; // turns to adulthood
  lifespan: number; // average turns

  // Competition
  preyOf: string[]; // species IDs
  predatorOf: string[]; // species IDs
  competitorOf: string[]; // species IDs
}

interface Trait {
  id: string;
  name: string;
  category: TraitCategory;
  description: string;

  // Mechanical effects
  effects: {
    survivalBonus?: number;
    reproductionBonus?: number;
    adaptationSpeed?: number;
    resourceEfficiency?: number;
  };

  // Evolution
  mutationChance: number; // 0-1
  dominance: "dominant" | "recessive" | "codominant";
}

type SpeciesSize =
  | "microscopic"
  | "tiny"
  | "small"
  | "medium"
  | "large"
  | "gigantic";
type TextureType =
  | "smooth"
  | "furry"
  | "scaly"
  | "feathered"
  | "chitinous"
  | "rocky";
type DietType =
  | "herbivore"
  | "carnivore"
  | "omnivore"
  | "photosynthetic"
  | "chemosynthetic";
type TraitCategory =
  | "physical"
  | "behavioral"
  | "metabolic"
  | "sensory"
  | "cognitive";
```

### Civilization

Advanced species that have developed technology and culture.

```typescript
interface Civilization {
  id: string;
  name: string;
  speciesId: string;

  // Development
  founded: number; // turn number
  technologyLevel: number; // 0-10
  culturalIdentity: string;

  // Territory
  controlledRegionIds: string[];
  capitalRegionId: string;

  // Demographics
  population: number;
  happinessIndex: number; // 0-100

  // Technology
  unlockedTechnologies: string[]; // tech IDs
  currentResearch: string | null;
  researchProgress: number; // 0-100

  // Relations
  relations: Map<string, RelationStatus>; // civId -> status

  // Economy
  resources: {
    food: number;
    materials: number;
    energy: number;
    knowledge: number;
  };
}

type RelationStatus = "allied" | "friendly" | "neutral" | "hostile" | "at_war";
```

### Technology

Discoveries that civilizations can research.

```typescript
interface Technology {
  id: string;
  name: string;
  description: string;
  icon: string;

  // Requirements
  prerequisites: string[]; // tech IDs
  minimumTechLevel: number;

  // Cost
  researchCost: number;

  // Effects
  effects: {
    productionBonus?: number;
    researchBonus?: number;
    happinessBonus?: number;
    unlocks?: string[]; // building/unit types
  };

  // Tree position (for UI)
  category: TechCategory;
  tier: number;
}

type TechCategory =
  | "biology"
  | "physics"
  | "society"
  | "engineering"
  | "philosophy";
```

### Game State

The complete game state combining all entities.

```typescript
interface GameState {
  // Meta
  gameId: string;
  turn: number;
  phase: "player" | "gamemaster" | "processing";

  // Core entities
  planet: Planet;

  // Player data
  player: {
    id: string;
    name: string;
    favoriteSpeciesIds: string[];
    achievements: Achievement[];
  };

  // Current UI focus
  ui: {
    selectedRegionId: string | null;
    selectedSpeciesId: string | null;
    selectedCivilizationId: string | null;
    cameraPosition: CameraPosition;
  };

  // Pending decisions
  pendingDecisions: Decision[];

  // Historical data for graphs/charts
  history: {
    populationHistory: PopulationSnapshot[];
    climateHistory: ClimateSnapshot[];
    eventLog: GameEvent[];
  };
}

interface Decision {
  id: string;
  type: "multiple_choice" | "continuous_choice";
  prompt: string;
  options: DecisionOption[];
  deadline?: number; // turn number
}

interface DecisionOption {
  id: string;
  label: string;
  description: string;
  icon?: string;
  effects?: string[]; // preview of effects
}
```

## Mock Data Examples

### Example Planet State

```json
{
  "id": "planet-1",
  "name": "Tetraspore Prime",
  "age": 500,
  "radius": 6371,
  "gravity": 1.0,
  "atmosphere": {
    "oxygen": 21,
    "carbonDioxide": 0.04,
    "nitrogen": 78,
    "other": 0.96,
    "pressure": 1.0
  },
  "biodiversity": 75,
  "temperature": 15,
  "seaLevel": 71
}
```

### Example Species

```json
{
  "id": "species-1",
  "name": "Crystalline Grazers",
  "scientificName": "Crystalvora pacificus",
  "ancestorId": null,
  "evolutionaryAge": 150,
  "extinct": false,
  "traits": [
    {
      "id": "trait-1",
      "name": "Photosynthetic Crystals",
      "category": "metabolic",
      "description": "Grows crystal structures that convert sunlight to energy",
      "effects": {
        "survivalBonus": 15,
        "resourceEfficiency": 25
      }
    }
  ],
  "appearance": {
    "size": "medium",
    "primaryColor": "#7F3FBF",
    "secondaryColor": "#E0E0E0",
    "texture": "crystalline"
  },
  "totalPopulation": 45000,
  "populationTrend": "increasing",
  "diet": "photosynthetic",
  "habitat": ["desert", "mountain"],
  "migrationPattern": "seasonal"
}
```

## Mock Data Files Structure

Mock data should be organized as:

```
src/mocks/
├── planets/
│   ├── default.json      # Starting planet state
│   ├── evolved.json      # Mid-game with many species
│   └── civilized.json    # Late-game with civilizations
├── species/
│   ├── primitives.json   # Early life forms
│   ├── complex.json      # Evolved species
│   └── extinct.json      # Historical species
├── regions/
│   ├── continents.json   # Land regions
│   └── oceans.json       # Water regions
├── civilizations/
│   └── examples.json     # Sample civilizations
└── gameStates/
    ├── turn0.json        # Game start
    ├── turn50.json       # Early game
    ├── turn200.json      # Mid game
    └── turn500.json      # Late game
```

## Usage in Storybook

```typescript
// Load mock data in stories
import defaultPlanet from '@/mocks/planets/default.json';
import { PlanetView } from '@/components/PlanetView';

export const DefaultPlanet = {
  render: () => <PlanetView planet={defaultPlanet} />
};

export const EvolvedPlanet = {
  render: () => <PlanetView planet={evolvedPlanet} />
};
```

## Validation

All mock data should be validated with Zod schemas:

```typescript
import { z } from "zod";

const PlanetSchema = z.object({
  id: z.string(),
  name: z.string(),
  age: z.number().positive(),
  // ... rest of schema
});

// Validate mock data at load time
const planet = PlanetSchema.parse(mockPlanetData);
```

This ensures mock data matches the expected types and helps catch errors early during development.
