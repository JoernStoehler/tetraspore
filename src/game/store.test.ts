import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameStore } from './store';
import type { DSLAction } from '../dsl';

// Mock dependencies
vi.mock('./mockLLM', () => ({
  mockLLM: {
    generateTurn: vi.fn().mockResolvedValue({
      turn: {
        actions: [{
          type: 'SpeciesCreate',
          species: {
            id: 'test-species',
            name: 'Test Species',
            description: 'A test species',
            creation_turn: 1
          }
        }]
      }
    })
  }
}));

vi.mock('./persistence', () => ({
  saveToPersistence: vi.fn(),
  loadFromPersistence: vi.fn()
}));

describe('Game Store', () => {
  beforeEach(() => {
    // Reset store to initial state
    const { result } = renderHook(() => useGameStore());
    act(() => {
      result.current.resetGame();
    });
  });

  it('should have initial state', () => {
    const { result } = renderHook(() => useGameStore());
    
    expect(result.current.state.turn).toBe(1);
    expect(result.current.state.species).toHaveLength(0);
    expect(result.current.state.previewCreate).toHaveLength(0);
    expect(result.current.state.previewExtinct).toHaveLength(0);
    expect(result.current.state.isProcessing).toBe(false);
    expect(result.current.actionHistory).toHaveLength(0);
  });

  it('should apply single action', () => {
    const { result } = renderHook(() => useGameStore());
    
    const action: DSLAction = {
      type: 'SpeciesCreate',
      species: {
        id: 'moss-1',
        name: 'Basic Moss',
        description: 'First organism',
        creation_turn: 1
      }
    };

    act(() => {
      result.current.applyAction(action);
    });

    expect(result.current.state.species).toHaveLength(1);
    expect(result.current.state.species[0].id).toBe('moss-1');
    expect(result.current.actionHistory).toHaveLength(1);
  });

  it('should accept species creation preview', () => {
    const { result } = renderHook(() => useGameStore());
    
    // First add a preview
    act(() => {
      result.current.applyAction({
        type: 'SpeciesCreateChoice',
        preview: {
          id: 'preview-moss',
          name: 'Water Moss',
          description: 'Aquatic variant',
          parent_id: 'moss-1',
          creation_turn: 1
        }
      });
    });

    expect(result.current.state.previewCreate).toHaveLength(1);

    // Accept the preview
    act(() => {
      result.current.acceptCreate('preview-moss');
    });

    expect(result.current.state.species).toHaveLength(1);
    expect(result.current.state.species[0].id).toBe('moss');
    expect(result.current.state.species[0].name).toBe('Water Moss');
    expect(result.current.state.previewCreate).toHaveLength(0);
  });

  it('should reject species creation preview', () => {
    const { result } = renderHook(() => useGameStore());
    
    // Add a preview
    act(() => {
      result.current.applyAction({
        type: 'SpeciesCreateChoice',
        preview: {
          id: 'preview-moss',
          name: 'Water Moss',
          description: 'Aquatic variant',
          parent_id: 'moss-1',
          creation_turn: 1
        }
      });
    });

    // Reject the preview
    act(() => {
      result.current.rejectCreate('preview-moss');
    });

    expect(result.current.state.species).toHaveLength(0);
    expect(result.current.state.previewCreate).toHaveLength(0);
  });

  it('should accept extinction preview', () => {
    const { result } = renderHook(() => useGameStore());
    
    // First create a species
    act(() => {
      result.current.applyAction({
        type: 'SpeciesCreate',
        species: {
          id: 'moss-1',
          name: 'Basic Moss',
          description: 'First organism',
          creation_turn: 1
        }
      });
    });

    // Add extinction preview
    act(() => {
      result.current.applyAction({
        type: 'SpeciesExtinctChoice',
        preview: {
          species_id: 'moss-1',
          extinction_turn: 2
        }
      });
    });

    // Accept extinction
    act(() => {
      result.current.acceptExtinct('moss-1');
    });

    expect(result.current.state.species[0].extinction_turn).toBe(2);
    expect(result.current.state.previewExtinct).toHaveLength(0);
  });

  it('should set processing state', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.setProcessing(true);
    });

    expect(result.current.state.isProcessing).toBe(true);

    act(() => {
      result.current.setProcessing(false);
    });

    expect(result.current.state.isProcessing).toBe(false);
  });

  it('should set error state', () => {
    const { result } = renderHook(() => useGameStore());
    
    act(() => {
      result.current.setError('Test error');
    });

    expect(result.current.state.lastError).toBe('Test error');

    act(() => {
      result.current.setError(undefined);
    });

    expect(result.current.state.lastError).toBeUndefined();
  });
});