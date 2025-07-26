# Planet Selection View - Implementation Specification

## Overview

This document outlines the implementation plan for an interactive 3D galaxy view for planet selection in Tetraspore. The view will feature a rotating galaxy with stars, nebulas, and interactive planet markers that respond to user interaction.

## Core Concept

A visually stunning 3D galaxy that:

- Rotates slowly on its own and allows manual rotation
- Uses a "color = life" theme where played regions add color to the galaxy
- Shows planet markers (saved games and pregenerated options)
- Provides hover interactions with planet previews
- Maintains ~6 pregenerated planet slots for variety

## Evaluation Criteria

### 1. Visual Quality

- [ ] Galaxy appears semi-realistic and recognizable
- [ ] Stars have varying sizes and visual effects (halos, blinking)
- [ ] Nebulas fill space effectively without overwhelming
- [ ] Color gradient system works smoothly around played regions
- [ ] Overall aesthetic is "pretty" and engaging

### 2. User Experience

- [ ] Smooth rotation (manual and automatic)
- [ ] Responsive hover effects with planet previews
- [ ] Clear visual distinction between saved and pregenerated planets
- [ ] Intuitive camera controls with proper constraints
- [ ] Toggle for hiding UI markers (pure galaxy view)

### 3. Performance

- [ ] 60 FPS on average hardware
- [ ] Efficient star blinking (unsynchronized)
- [ ] Smooth transitions and animations
- [ ] Reasonable memory usage

### 4. Technical Implementation

- [ ] Clean component architecture
- [ ] Proper separation of concerns
- [ ] Type-safe interfaces
- [ ] Follows project patterns

## Technical Approach

### Libraries Required

1. **@react-three/fiber** (React renderer for Three.js)
   - Pros: React-friendly, declarative 3D, great TypeScript support
   - Cons: Learning curve if unfamiliar with Three.js
   - Already in package.json ✓

2. **@react-three/drei** (Helper components)
   - Pros: Camera controls, effects, utilities, sprite support
   - Cons: Additional dependency
   - Already in package.json ✓

3. **@react-three/postprocessing** (Visual effects)
   - Pros: Bloom, glow effects for stars
   - Cons: Performance impact
   - Installed ✓

4. **Zustand** (State management)
   - Already in use ✓

### Rendering Approach

- **Stars**: Use sprites instead of 3D spheres for efficiency
  - Circular halos with transparency
  - Z-ordering for proper depth
  - Varying sizes and brightness
- **Nebulas**: Volumetric filling technique
  - Efficient alternative to thousands of extra sprites
  - Provides non-blackness to the galaxy
- **Postprocessing**: Bloom effects for enhanced visuals

### Component Architecture

```
PlanetSelectionView/
├── PlanetSelectionView.tsx       # Main container
├── Galaxy3D/
│   ├── Galaxy3D.tsx              # Canvas and scene setup
│   ├── Stars.tsx                 # Star field with blinking
│   ├── Nebula.tsx                # Volumetric nebula effects
│   ├── PlanetMarkers.tsx         # Interactive planet positions
│   └── CameraController.tsx      # Rotation and zoom controls
├── PlanetPreview/
│   ├── PlanetPreview.tsx         # Hover preview overlay
│   └── PlanetInfo.tsx            # Name and game state display
└── types.ts                      # TypeScript interfaces
```

### Data Structures

```typescript
interface Planet {
  id: string;
  name: string;
  position: [number, number, number];
  isPlayed: boolean;
  // For played planets
  gameState?: string; // e.g., "Landfall of the Flufficons"
  lastPlayed?: Date;
  colorIntensity?: number; // 0-1, affects surrounding color
  // For pregenerated planets
  seed?: number;
  type?: "barren" | "lush" | "oceanic" | "volcanic";
}

interface GalaxyState {
  planets: Planet[];
  hoveredPlanetId: string | null;
  cameraRotation: number;
  autoRotate: boolean;
  showMarkers: boolean;
}
```

## Implementation Phases

### Phase 1: Basic Galaxy Structure (Day 1)

1. Set up Three.js scene with react-three-fiber
2. Create star field with varying sizes
3. Implement basic camera controls
4. Add automatic rotation

### Phase 2: Visual Polish (Day 2)

1. Add star blinking effects
2. Implement nebula/gas clouds
3. Add bloom/glow effects
4. Implement color gradient system

### Phase 3: Planet Interaction (Day 3)

1. Add planet markers
2. Implement hover detection
3. Create preview UI
4. Add fade effect for nearby stars

### Phase 4: Polish & Features (Day 4)

1. Fine-tune animations
2. Add UI toggle
3. Performance optimization
4. Testing and refinement

## Visual Design Decisions

### Color Palette

- Base galaxy: Grayscale (white stars on dark background)
- Life colors: Warm gradient (yellows, oranges, reds, purples)
- UI accents: Consistent with existing Tetraspore theme

### Effects

- Stars: Varying sizes, subtle halos, unsynchronized blinking
- Nebulas: Semi-transparent, volumetric appearance
- Planet markers: Glowing orbs with distinct saved/pregenerated styles
- Hover: Circular fade region revealing 2D planet preview

### Camera Behavior

- Y-axis constrained (no full 3D rotation)
- Zoom limits to prevent disorientation
- Smooth momentum-based movement
- Auto-rotation: ~3-5 degrees per second (adjustable)

## Mock Data Approach

Initially use mock data for:

- 3 saved planets with varying game states
- 6 pregenerated planets
- Procedural star positions (1000-2000 stars)
- 3-5 nebula clouds

## Future Considerations

- Sound design integration points
- Performance scaling for more planets
- Save game persistence
- Planet customization view integration

## Questions for Clarification (Answered)

1. ~~Should pregenerated planets contribute to galaxy coloration?~~ **No, only played planets**
2. ~~Preferred color palette for the "life" gradient?~~ **Warm colors, can include greens/blues on tails**
3. ~~Any specific galaxy shape preference (spiral, elliptical)?~~ **Spiral (maybe with bar)**
4. ~~Desired complexity for planet preview information?~~ **Image + name + one-line summary + last played**

## Implementation Notes

- Use TDD approach with tests first
- Focus on Storybook for development (higher priority than App.tsx integration)
- Generate star positions algorithmically for semi-realistic galaxy shape
- Store generated positions in JSON for consistency
- Consider spatial correlation for color distribution
- Nebulas primarily for volumetric filling, not individual objects
