import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { UIState, ViewType } from '../types'

interface UIStore extends UIState {
  setView: (view: ViewType) => void
  selectRegion: (regionName: string | null) => void
  selectSpecies: (speciesName: string | null) => void
  selectChoice: (choiceId: string | null) => void
  setLoading: (isLoading: boolean) => void
  reset: () => void
}

const initialState: UIState = {
  currentView: 'main',
  selectedRegion: null,
  selectedSpecies: null,
  selectedChoice: null,
  isLoading: false
}

export const useUIStore = create<UIStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setView: (view: ViewType) => {
        set({ currentView: view })
      },

      selectRegion: (regionName: string | null) => {
        set({ selectedRegion: regionName })
      },

      selectSpecies: (speciesName: string | null) => {
        set({ selectedSpecies: speciesName })
      },

      selectChoice: (choiceId: string | null) => {
        set({ selectedChoice: choiceId })
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading })
      },

      reset: () => {
        set(initialState)
      }
    }),
    {
      name: 'UIStore'
    }
  )
)