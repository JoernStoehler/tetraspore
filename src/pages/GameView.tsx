import React from 'react'
import { useUIStore } from '../stores/uiStore'
import { TreeOfLife } from '../components/game/TreeOfLife'

export const GameView: React.FC = () => {
  const { currentView, setView } = useUIStore()

  const renderView = () => {
    switch (currentView) {
      case 'tree':
        return (
          <div className="w-full h-full">
            <TreeOfLife />
          </div>
        )
      case 'map':
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Map view coming soon...</p>
          </div>
        )
      case 'history':
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">History view coming soon...</p>
          </div>
        )
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Welcome to Tetraspore</h2>
              <p className="text-gray-600 mb-8">Choose a view to explore your species' evolution</p>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => setView('tree')}
                  className="p-6 bg-green-100 hover:bg-green-200 rounded-lg transition-colors"
                >
                  <div className="text-4xl mb-2">🌳</div>
                  <h3 className="font-semibold">Tree of Life</h3>
                  <p className="text-sm text-gray-600">Evolution paths</p>
                </button>
                <button
                  onClick={() => setView('map')}
                  className="p-6 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                >
                  <div className="text-4xl mb-2">🗺️</div>
                  <h3 className="font-semibold">World Map</h3>
                  <p className="text-sm text-gray-600">Region control</p>
                </button>
                <button
                  onClick={() => setView('history')}
                  className="p-6 bg-purple-100 hover:bg-purple-200 rounded-lg transition-colors"
                >
                  <div className="text-4xl mb-2">📜</div>
                  <h3 className="font-semibold">History</h3>
                  <p className="text-sm text-gray-600">Timeline of events</p>
                </button>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold">Tetraspore</h1>
            <nav className="flex space-x-4">
              <button
                onClick={() => setView('main')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'main' 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setView('tree')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'tree' 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Tree of Life
              </button>
              <button
                onClick={() => setView('map')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'map' 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Map
              </button>
              <button
                onClick={() => setView('history')}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  currentView === 'history' 
                    ? 'bg-gray-900 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                History
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 relative">
        {renderView()}
      </main>
    </div>
  )
}