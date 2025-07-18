# Task: LLM Service with Gemini Integration

## Objective
Create the LLM service layer with Gemini API integration and comprehensive mock mode for development.

## Requirements

### 1. LLM Service Interface (`src/services/llm/types.ts`)
```typescript
interface LLMService {
  generateChoices(context: GameContext): Promise<Choice[]>;
  generateNarration(event: GameEvent): Promise<string>;
  generateSpeciesDescription(species: Species): Promise<string>;
  evolveSpeciesName(species: Species, feature: Feature): Promise<string>;
}
```

### 2. Gemini Implementation (`src/services/llm/gemini.ts`)
- Use Gemini API (will need API key in .env)
- Structured prompt templates
- Response parsing and validation
- Rate limiting and error handling
- Retry logic for failures

### 3. Mock Implementation (`src/services/llm/mock.ts`)
- Rich mock data for all methods
- Deterministic but varied responses
- Realistic delay simulation
- Category-appropriate choices

### 4. Service Factory (`src/services/llm/index.ts`)
```typescript
export function createLLMService(config: LLMConfig): LLMService {
  if (config.mock || !config.apiKey) {
    return new MockLLMService();
  }
  return new GeminiLLMService(config);
}
```

### 5. Mock Data Examples
- Choices: 50+ varied evolution options
- Narrations: Atmospheric descriptions
- Species names that evolve sensibly

## Gemini Integration Details
- Model: `gemini-1.5-flash` (free tier)
- Temperature: 0.8 for creativity
- Structured prompts with examples
- JSON response format

## Environment Setup
```env
VITE_GEMINI_API_KEY=your-key-here
VITE_LLM_MOCK_MODE=true
```

## Success Criteria
- Mock mode works without API key
- Gemini integration with proper key
- Response validation and typing
- Good variety in mock responses
- Graceful error handling

## Prompt Engineering Notes
- Include genre/tone in prompts
- Provide context about current state
- Use few-shot examples
- Constrain response format