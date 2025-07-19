import { useEffect } from 'react'
import { useUIStore, useGameStore } from '../../stores'
import type { ViewType } from '../../types'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { currentView, setView } = useUIStore()
  const { currentTurn, species } = useGameStore()

  // Get primary species name for display
  const primarySpecies = Array.from(species.values())[0]?.name || 'No Species'

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle shortcuts if no input is focused
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (e.key.toLowerCase()) {
        case 't':
          setView('tree')
          break
        case 'm':
          setView('map')
          break
        case 'c':
          setView('choices')
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [setView])

  const navItems: { view: ViewType; label: string; key: string }[] = [
    { view: 'tree', label: 'Tree', key: 'T' },
    { view: 'map', label: 'Map', key: 'M' },
    { view: 'choices', label: 'Choices', key: 'C' }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Fixed Top Navigation */}
      <nav className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        {/* Navigation Buttons */}
        <div className="flex space-x-1 w-full sm:w-auto">
          {navItems.map(({ view, label, key }) => (
            <button
              key={view}
              onClick={() => setView(view)}
              className={`
                flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors
                ${currentView === view 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
                }
              `}
              title={`Switch to ${label} view (${key})`}
            >
              <span className="sm:hidden">{label} ({key})</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Game Status */}
        <div className="flex items-center space-x-4 sm:space-x-6 text-xs sm:text-sm w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-gray-300">
            Turn <span className="text-white font-semibold">{currentTurn}</span>
          </div>
          <div className="text-gray-300 truncate max-w-32 sm:max-w-none">
            <span className="text-blue-400 font-semibold">{primarySpecies}</span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}