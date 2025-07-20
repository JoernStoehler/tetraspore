import { http, HttpResponse } from 'msw'

// Mock API handlers for testing
export const handlers = [
  // Mock Gemini API responses
  http.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent', () => {
    return HttpResponse.json({
      candidates: [{
        content: {
          parts: [{
            text: JSON.stringify({
              choices: [
                {
                  title: "Develop Swimming",
                  description: "Your species could develop swimming abilities to explore aquatic environments.",
                  category: "movement",
                  impact: "medium"
                },
                {
                  title: "Enhanced Vision", 
                  description: "Improve visual acuity to better detect predators and prey.",
                  category: "sensory",
                  impact: "low"
                },
                {
                  title: "Cooperative Hunting",
                  description: "Form hunting groups to take down larger prey.",
                  category: "social", 
                  impact: "high"
                }
              ]
            })
          }]
        }
      }]
    })
  }),

  // Mock local storage API calls if any
  http.get('/api/game/save', () => {
    return HttpResponse.json({
      success: true,
      saves: [
        {
          id: 'save-1',
          name: 'Early Ocean Life',
          turn: 5,
          timestamp: Date.now() - 86400000, // 1 day ago
        },
        {
          id: 'save-2', 
          name: 'Terrestrial Expansion',
          turn: 15,
          timestamp: Date.now() - 43200000, // 12 hours ago
        }
      ]
    })
  }),

  http.post('/api/game/save', async () => {
    return HttpResponse.json({
      success: true,
      saveId: `save-${Date.now()}`,
      message: 'Game saved successfully'
    })
  }),

  http.get('/api/game/load/:saveId', () => {
    return HttpResponse.json({
      success: true,
      gameState: {
        currentTurn: 10,
        species: {
          'Primordial Life': {
            name: 'Primordial Life',
            description: 'Basic cellular organisms',
            traits: ['photosynthesis', 'reproduction'],
            regions: ['Primordial Ocean']
          }
        },
        regions: {
          'Primordial Ocean': {
            name: 'Primordial Ocean',
            description: 'The vast prehistoric ocean',
            species: ['Primordial Life'],
            features: ['hydrothermal_vents']
          }
        }
      }
    })
  }),

  // Mock any other API endpoints your app might use
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok', timestamp: Date.now() })
  }),
]