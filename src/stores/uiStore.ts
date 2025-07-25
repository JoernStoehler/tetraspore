import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type ViewType = 'planet-selection' | 'map' | 'evolution' | 'technology';

interface UIState {
  // State
  currentView: ViewType;
  isSettingsOpen: boolean;
  
  // Actions
  setCurrentView: (view: ViewType) => void;
  setSettingsOpen: (isOpen: boolean) => void;
  toggleSettings: () => void;
  navigateToMap: () => void;
}

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
      name: 'ui-store', // Name for devtools
    }
  )
);