function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
        Tetraspore
      </h1>
      <p className="text-xl text-gray-400 mb-8">
        Evolution & Civilization Game
      </p>
      <div className="flex gap-4">
        <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          New Game
        </button>
        <button className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
          Load Game
        </button>
      </div>
      <p className="mt-8 text-sm text-gray-500">
        v0.0.1 - DevOps Test Build ✓
      </p>
    </div>
  )
}

export default App