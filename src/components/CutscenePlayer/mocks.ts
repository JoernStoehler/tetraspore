import type { CutsceneDefinition } from './types';

// Mock cutscene data for development
export const mockCutscenes: Record<string, CutsceneDefinition> = {
  'test-cutscene-1': {
    id: 'test-cutscene-1',
    shots: [
      {
        imageUrl: '/test-assets/planet-1.jpg',
        audioUrl: '/test-assets/narration-1.mp3',
        duration: 5,
        animation: 'slow_zoom',
        audioDuration: 4.5
      },
      {
        imageUrl: '/test-assets/planet-2.jpg',
        audioUrl: '/test-assets/narration-2.mp3',
        duration: 6,
        animation: 'pan_right',
        audioDuration: 5.8
      }
    ]
  },
  'animation-showcase': {
    id: 'animation-showcase',
    shots: [
      {
        imageUrl: '/test-assets/demo-1.jpg',
        audioUrl: '/test-assets/demo-1.mp3',
        duration: 4,
        animation: 'slow_zoom',
        audioDuration: 3.5
      },
      {
        imageUrl: '/test-assets/demo-2.jpg',
        audioUrl: '/test-assets/demo-2.mp3',
        duration: 4,
        animation: 'pan_left',
        audioDuration: 3.8
      },
      {
        imageUrl: '/test-assets/demo-3.jpg',
        audioUrl: '/test-assets/demo-3.mp3',
        duration: 4,
        animation: 'pan_right',
        audioDuration: 3.2
      },
      {
        imageUrl: '/test-assets/demo-4.jpg',
        audioUrl: '/test-assets/demo-4.mp3',
        duration: 5,
        animation: 'fade',
        audioDuration: 4.7
      }
    ]
  }
};

export const loadCutsceneDefinition = async (cutsceneId: string): Promise<CutsceneDefinition> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const definition = mockCutscenes[cutsceneId];
  if (!definition) {
    throw new Error(`Cutscene not found: ${cutsceneId}`);
  }
  
  return definition;
};