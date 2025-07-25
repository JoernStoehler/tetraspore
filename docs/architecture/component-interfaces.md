# Component Interface Definitions

This document defines the TypeScript interfaces for all UI components in Tetraspore. These interfaces follow the principle that props contain only logical/game data, not visual details.

## Core Principles

1. **Props contain game data only** - No colors, sizes, or positions
2. **Components decide rendering** - Visual details are component's responsibility
3. **Callbacks for user actions** - Components emit commands via callbacks
4. **No direct state mutation** - All changes go through command system

## View Components

### PlanetView

The main 3D visualization of the planet with regions.

```typescript
interface PlanetViewProps {
  planet: Planet;
  selectedRegionId: string | null;
  highlightedRegionIds: string[];

  // Camera
  cameraPosition?: CameraPosition;

  // Interactions
  onRegionClick?: (regionId: string) => void;
  onRegionHover?: (regionId: string | null) => void;
  onCameraChange?: (position: CameraPosition) => void;

  // Display options
  viewMode?: "terrain" | "political" | "species" | "climate";
  showLabels?: boolean;
  showGrid?: boolean;
}

interface CameraPosition {
  latitude: number;
  longitude: number;
  distance: number; // zoom level
  rotation: number;
}
```

### MapView

2D map interface for detailed region management.

```typescript
interface MapViewProps {
  planet: Planet;
  centerRegionId?: string;
  selectedRegionId: string | null;

  // Overlays
  overlayType?: "species" | "resources" | "civilization" | "climate";

  // Interactions
  onRegionSelect?: (regionId: string) => void;
  onRegionAction?: (regionId: string, action: RegionAction) => void;

  // Filters
  speciesFilter?: string[]; // species IDs to show
  showOnlyHabitable?: boolean;
}

type RegionAction =
  | { type: "migrate_species"; speciesId: string }
  | { type: "establish_colony"; civilizationId: string }
  | { type: "build_structure"; structureType: string };
```

### EvolutionView

Species evolution tree and trait management.

```typescript
interface EvolutionViewProps {
  species: Species[];
  extinctSpecies: Species[];
  selectedSpeciesId: string | null;

  // Display
  timeRange?: { start: number; end: number }; // turn numbers
  showExtinct?: boolean;

  // Interactions
  onSpeciesSelect?: (speciesId: string) => void;
  onTraitSelect?: (speciesId: string, traitId: string) => void;
  onEvolutionGuide?: (speciesId: string, direction: EvolutionDirection) => void;
}

interface EvolutionDirection {
  targetTraits: string[]; // trait IDs to evolve toward
  targetBiome?: BiomeType;
  pressure: "natural" | "artificial";
}
```

### TechnologyView

Technology tree for civilizations.

```typescript
interface TechnologyViewProps {
  civilization: Civilization;
  availableTechnologies: Technology[];
  allTechnologies: Technology[];

  // Display
  centerTechId?: string;
  highlightPath?: string[]; // tech IDs showing a path

  // Interactions
  onTechnologySelect?: (techId: string) => void;
  onResearchStart?: (techId: string) => void;
  onResearchCancel?: () => void;
}
```

## Data Display Components

### SpeciesCard

Detailed information display for a species.

```typescript
interface SpeciesCardProps {
  species: Species;
  population: SpeciesPopulation;
  regions: Region[]; // regions where species lives

  // Actions
  onMigrate?: () => void;
  onEvolve?: () => void;
  onProtect?: () => void;
  onViewDetails?: () => void;

  // Display options
  compact?: boolean;
  showHistory?: boolean;
}
```

### RegionInfo

Information panel for a selected region.

```typescript
interface RegionInfoProps {
  region: Region;
  species: Array<Species & { population: number }>;
  civilization?: Civilization;

  // Actions
  onSpeciesSelect?: (speciesId: string) => void;
  onResourceManage?: (resource: keyof ResourceMap) => void;
  onClimateAdjust?: () => void;
}
```

### CivilizationPanel

Civilization management interface.

```typescript
interface CivilizationPanelProps {
  civilization: Civilization;
  territories: Region[];
  relations: Array<{
    civilization: Civilization;
    status: RelationStatus;
  }>;

  // Actions
  onTerritorySelect?: (regionId: string) => void;
  onDiplomacy?: (targetCivId: string) => void;
  onPolicyChange?: (policy: PolicyType) => void;
  onBuild?: (regionId: string, building: string) => void;
}
```

## Control Components

### TimelineControls

Time manipulation and turn management.

```typescript
interface TimelineControlsProps {
  currentTurn: number;
  maxTurn: number;
  isPlaying: boolean;
  playbackSpeed: number;

  // Callbacks
  onTurnChange?: (turn: number) => void;
  onPlayPause?: () => void;
  onSpeedChange?: (speed: number) => void;
  onEndTurn?: () => void;

  // Dev tools
  showDevTools?: boolean;
  onUndo?: () => void;
  onRedo?: () => void;
  onJumpToEvent?: (eventId: string) => void;
}
```

### DecisionPrompt

Player decision interface.

```typescript
interface DecisionPromptProps {
  decision: Decision;
  remainingTime?: number; // seconds

  // Callbacks
  onSelect?: (optionId: string) => void;
  onDismiss?: () => void;
  onRequestMoreInfo?: () => void;

  // Display
  priority?: "low" | "medium" | "high" | "critical";
  allowDismiss?: boolean;
}
```

### EventFeed

Game event notification display.

```typescript
interface EventFeedProps {
  events: GameEvent[];
  maxEvents?: number;

  // Filters
  eventTypes?: string[]; // filter by type
  severityFilter?: "all" | "important" | "critical";

  // Interactions
  onEventClick?: (eventId: string) => void;
  onEventDismiss?: (eventId: string) => void;

  // Display
  position?: "top-right" | "bottom-right" | "bottom-left";
  compact?: boolean;
}
```

## Composite Components

### GameHUD

Main game interface combining multiple components.

```typescript
interface GameHUDProps {
  gameState: GameState;

  // View management
  currentView: ViewType;
  onViewChange?: (view: ViewType) => void;

  // Global actions
  onMenuOpen?: () => void;
  onSave?: () => void;
  onHelp?: () => void;

  // Notification count
  pendingDecisions: number;
  unreadEvents: number;
}

type ViewType = "planet" | "map" | "evolution" | "technology" | "civilization";
```

### PlanetStats

Global statistics dashboard.

```typescript
interface PlanetStatsProps {
  planet: Planet;
  historicalData: {
    biodiversity: TimeSeriesData;
    temperature: TimeSeriesData;
    population: TimeSeriesData;
  };

  // Display options
  timeWindow?: "recent" | "all" | "custom";
  compareMode?: boolean;

  // Interactions
  onStatClick?: (statType: string) => void;
  onTimeWindowChange?: (window: string) => void;
}

interface TimeSeriesData {
  label: string;
  data: Array<{
    turn: number;
    value: number;
  }>;
}
```

## Utility Types

### Common Callback Patterns

```typescript
// Command emission pattern
type CommandCallback<T = unknown> = (command: {
  type: string;
  payload: T;
}) => void;

// Selection pattern
type SelectionCallback<T> = (id: string, item: T) => void;

// Filter pattern
type FilterCallback<T> = (filters: Partial<T>) => void;
```

### Display State

```typescript
interface UIState {
  selectedIds: {
    region: string | null;
    species: string | null;
    civilization: string | null;
    technology: string | null;
  };

  hoveredIds: {
    region: string | null;
    species: string | null;
  };

  filters: {
    speciesTypes: DietType[];
    biomes: BiomeType[];
    techCategories: TechCategory[];
  };

  viewSettings: {
    showGrid: boolean;
    showLabels: boolean;
    animationSpeed: number;
  };
}
```

## Component Composition Example

```typescript
// Example of how components compose
export const GameScreen: FC = () => {
  const gameState = useGameState();
  const { executeCommand } = useCommands();

  return (
    <GameHUD gameState={gameState}>
      <PlanetView
        planet={gameState.planet}
        selectedRegionId={gameState.ui.selectedRegionId}
        onRegionClick={(regionId) => {
          executeCommand({
            type: 'SELECT_REGION',
            payload: { regionId }
          });
        }}
      />

      {gameState.ui.selectedRegionId && (
        <RegionInfo
          region={getRegionById(gameState.ui.selectedRegionId)}
          species={getSpeciesInRegion(gameState.ui.selectedRegionId)}
        />
      )}

      <EventFeed
        events={gameState.history.eventLog}
        maxEvents={5}
      />
    </GameHUD>
  );
};
```

## Testing Components

Each component should have stories demonstrating:

1. **Default state** - With minimal props
2. **Interactive state** - With selections and hovers
3. **Edge cases** - Empty data, loading, errors
4. **Variations** - Different view modes and options

```typescript
// Example Storybook story
export const SpeciesCardStory = {
  args: {
    species: mockSpecies,
    population: {
      speciesId: "species-1",
      population: 50000,
      density: 25,
      health: 85,
    },
    regions: mockRegions,
  },
};
```

These interfaces provide a complete contract for UI development, allowing parallel work on components and game logic.
