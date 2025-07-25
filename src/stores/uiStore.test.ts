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
    it('should have correct initial values', () => {
      const { result } = renderHook(() => useUIStore());
      
      expect(result.current.currentView).toBe('planet-selection');
      expect(result.current.isSettingsOpen).toBe(false);
    });
  });

  describe('setCurrentView', () => {
    it('should update current view', () => {
      const { result } = renderHook(() => useUIStore());
      
      act(() => {
        result.current.setCurrentView('map');
      });
      
      expect(result.current.currentView).toBe('map');
    });

    it('should handle all view types', () => {
      const { result } = renderHook(() => useUIStore());
      const views = ['planet-selection', 'map', 'evolution', 'technology'] as const;
      
      views.forEach(view => {
        act(() => {
          result.current.setCurrentView(view);
        });
        expect(result.current.currentView).toBe(view);
      });
    });
  });

  describe('setSettingsOpen', () => {
    it('should open settings', () => {
      const { result } = renderHook(() => useUIStore());
      
      act(() => {
        result.current.setSettingsOpen(true);
      });
      
      expect(result.current.isSettingsOpen).toBe(true);
    });

    it('should close settings', () => {
      const { result } = renderHook(() => useUIStore());
      
      // First open settings
      act(() => {
        result.current.setSettingsOpen(true);
      });
      
      // Then close them
      act(() => {
        result.current.setSettingsOpen(false);
      });
      
      expect(result.current.isSettingsOpen).toBe(false);
    });
  });

  describe('toggleSettings', () => {
    it('should toggle settings from closed to open', () => {
      const { result } = renderHook(() => useUIStore());
      
      act(() => {
        result.current.toggleSettings();
      });
      
      expect(result.current.isSettingsOpen).toBe(true);
    });

    it('should toggle settings from open to closed', () => {
      const { result } = renderHook(() => useUIStore());
      
      // First open settings
      act(() => {
        result.current.setSettingsOpen(true);
      });
      
      // Then toggle
      act(() => {
        result.current.toggleSettings();
      });
      
      expect(result.current.isSettingsOpen).toBe(false);
    });
  });

  describe('navigateToMap', () => {
    it('should set current view to map', () => {
      const { result } = renderHook(() => useUIStore());
      
      act(() => {
        result.current.navigateToMap();
      });
      
      expect(result.current.currentView).toBe('map');
    });
  });

  describe('selective subscriptions', () => {
    it('should only re-render when subscribed state changes', () => {
      let renderCount = 0;
      
      renderHook(() => {
        renderCount++;
        return useUIStore((state) => state.currentView);
      });
      
      expect(renderCount).toBe(1);
      
      // Changing settings should not trigger re-render
      act(() => {
        useUIStore.getState().setSettingsOpen(true);
      });
      
      expect(renderCount).toBe(1);
      
      // Changing view should trigger re-render
      act(() => {
        useUIStore.getState().setCurrentView('map');
      });
      
      expect(renderCount).toBe(2);
    });
  });
});