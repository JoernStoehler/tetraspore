import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUIStore } from './uiStore';

describe('useUIStore', () => {
  beforeEach(() => {
    // Reset the store to initial state before each test
    useUIStore.setState({
      currentView: 'planet-selection',
      isSettingsOpen: false,
    });
  });

  describe('initial state', () => {
    it('starts with planet selection view and closed settings', () => {
      // Arrange
      // Store is reset in beforeEach

      // Act
      const { result } = renderHook(() => useUIStore());
      
      // Assert
      expect(result.current.currentView).toBe('planet-selection');
      expect(result.current.isSettingsOpen).toBe(false);
    });
  });

  describe('setCurrentView', () => {
    it('changes the active view when called', () => {
      // Arrange
      const { result } = renderHook(() => useUIStore());
      
      // Act
      act(() => {
        result.current.setCurrentView('map');
      });
      
      // Assert
      expect(result.current.currentView).toBe('map');
    });

    it('accepts all defined view types', () => {
      // Arrange
      const { result } = renderHook(() => useUIStore());
      const views = ['planet-selection', 'map', 'evolution', 'technology'] as const;
      
      // Act & Assert
      views.forEach(view => {
        act(() => {
          result.current.setCurrentView(view);
        });
        expect(result.current.currentView).toBe(view);
      });
    });
  });

  describe('setSettingsOpen', () => {
    it('opens the settings panel when set to true', () => {
      // Arrange
      const { result } = renderHook(() => useUIStore());
      
      // Act
      act(() => {
        result.current.setSettingsOpen(true);
      });
      
      // Assert
      expect(result.current.isSettingsOpen).toBe(true);
    });

    it('closes the settings panel when set to false', () => {
      // Arrange
      const { result } = renderHook(() => useUIStore());
      act(() => {
        result.current.setSettingsOpen(true);
      });
      
      // Act
      act(() => {
        result.current.setSettingsOpen(false);
      });
      
      // Assert
      expect(result.current.isSettingsOpen).toBe(false);
    });
  });

  describe('toggleSettings', () => {
    it('opens settings when currently closed', () => {
      // Arrange
      const { result } = renderHook(() => useUIStore());
      
      // Act
      act(() => {
        result.current.toggleSettings();
      });
      
      // Assert
      expect(result.current.isSettingsOpen).toBe(true);
    });

    it('closes settings when currently open', () => {
      // Arrange
      const { result } = renderHook(() => useUIStore());
      act(() => {
        result.current.setSettingsOpen(true);
      });
      
      // Act
      act(() => {
        result.current.toggleSettings();
      });
      
      // Assert
      expect(result.current.isSettingsOpen).toBe(false);
    });
  });

  describe('navigateToMap', () => {
    it('switches to the map view when called', () => {
      // Arrange
      const { result } = renderHook(() => useUIStore());
      
      // Act
      act(() => {
        result.current.navigateToMap();
      });
      
      // Assert
      expect(result.current.currentView).toBe('map');
    });
  });

  describe('selective subscriptions', () => {
    it('only re-renders components when their subscribed state changes', () => {
      // Arrange
      let renderCount = 0;
      renderHook(() => {
        renderCount++;
        return useUIStore((state) => state.currentView);
      });
      expect(renderCount).toBe(1);
      
      // Act - change unrelated state
      act(() => {
        useUIStore.getState().setSettingsOpen(true);
      });
      
      // Assert - no re-render for unrelated state
      expect(renderCount).toBe(1);
      
      // Act - change subscribed state
      act(() => {
        useUIStore.getState().setCurrentView('map');
      });
      
      // Assert - re-render occurs for subscribed state
      expect(renderCount).toBe(2);
    });
  });
});