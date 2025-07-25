import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

/**
 * Valid view types for the main application navigation.
 * Each view represents a major section of the game interface.
 */
export type ViewType = 'planet-selection' | 'map' | 'evolution' | 'technology';

/**
 * UI State Store Interface
 * 
 * Manages all UI-related state that doesn't belong to game logic.
 * This includes navigation state, modal visibility, and UI preferences.
 * 
 * Why Zustand: Provides a simpler API than Redux while still supporting
 * DevTools and selective subscriptions for performance optimization.
 */
interface UIState {
  // State
  /** Currently active view in the main application area */
  currentView: ViewType;
  /** Whether the settings modal is currently open */
  isSettingsOpen: boolean;
  
  // Actions
  /** Navigate to a specific view */
  setCurrentView: (view: ViewType) => void;
  /** Explicitly set the settings modal open/closed state */
  setSettingsOpen: (isOpen: boolean) => void;
  /** Toggle the settings modal (convenience method for keyboard shortcuts) */
  toggleSettings: () => void;
  /** Navigate directly to the map view (convenience method for planet selection) */
  navigateToMap: () => void;
}

/**
 * UI State Store
 * 
 * Central store for all UI-related state management.
 * Uses Zustand for state management with DevTools middleware for debugging.
 * 
 * @example
 * // Use in components with selectors for performance
 * const currentView = useUIStore((state) => state.currentView);
 * const setCurrentView = useUIStore((state) => state.setCurrentView);
 * 
 * @example
 * // Or destructure multiple values
 * const { isSettingsOpen, toggleSettings } = useUIStore();
 */
export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      // Initial state
      currentView: 'planet-selection',
      isSettingsOpen: false,
      
      // Actions
      setCurrentView: (view) => set({ currentView: view }, false, 'setCurrentView'),
      
      setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }, false, 'setSettingsOpen'),
      
      toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen }), false, 'toggleSettings'),
      
      navigateToMap: () => set({ currentView: 'map' }, false, 'navigateToMap'),
    }),
    {
      name: 'ui-store', // Name shown in Redux DevTools
    }
  )
);