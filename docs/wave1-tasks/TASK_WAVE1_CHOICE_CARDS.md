# Task: Choice Card Component

## Objective
Build the choice card component system for displaying evolution/development choices to the player.

## Requirements

### 1. Choice Card Component (`src/components/game/ChoiceCard.tsx`)
- Display choice title and description
- Show category with color coding
- Prerequisites (if any)
- Flaver text/quote
- Select button with hover state

### 2. Choice List Component (`src/components/game/ChoiceList.tsx`)
- Grid layout (responsive columns)
- Category filtering tabs
- Smooth animations on filter
- Handle empty states

### 3. Category System
- Physical, Cognitive, Social, Technological categories
- Consistent color scheme:
  - Physical: Earth tones (brown/green)
  - Cognitive: Blue/purple
  - Social: Yellow/orange  
  - Technological: Silver/cyan

### 4. Mock Choices Data (`src/data/mockChoices.ts`)
Create diverse example choices:
- "Develop Cell Walls" (Physical)
- "Basic Sensory Organs" (Physical)
- "Chemical Signaling" (Social)
- "Pattern Recognition" (Cognitive)

### 5. Interaction
- Hover effects
- Selection animation
- Connect to store actions (just console.log for now)
- Disabled state for locked choices

## Styling Requirements
- Card-based design
- Subtle shadows/borders
- Clear visual hierarchy
- Mobile-friendly sizing

## Success Criteria
- Displays grid of choice cards
- Category filtering works
- Responsive layout
- Clear visual feedback
- Accessible (keyboard nav)

## Technical Notes
- Use Tailwind for styling
- Consider framer-motion for animations
- Keep components pure/testable