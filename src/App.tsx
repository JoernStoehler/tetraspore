import { useState } from 'react';

function App() {
  const [turn, setTurn] = useState(0);

  const handleEndTurn = () => {
    setTurn(turn + 1);
  };

  const handleResetGame = () => {
    setTurn(0);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Tetraspore Evolution Game</h1>
        <h2 className="text-2xl text-gray-700 mb-4">Turn {turn}</h2>
        
        <div className="tree-of-life-container mb-6">
          <svg width="200" height="200" className="border">
            <circle cx="100" cy="100" r="50" fill="green" />
          </svg>
        </div>
        
        <div className="space-x-4 mb-4">
          <button 
            onClick={handleEndTurn}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            End Turn
          </button>
          <button 
            onClick={handleResetGame}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Reset Game
          </button>
        </div>
        
        {turn > 0 && (
          <div>
            <h3>Living Species</h3>
            <p>Placeholder species data</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App