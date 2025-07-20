import { useGameStore, useTurn, useSpecies, useIsProcessing } from '../store/store';
import { TreeOfLife } from './TreeOfLife/TreeOfLife';
import { useTreeData } from './TreeOfLife/hooks';

export function GameUI() {
  const endTurn = useGameStore(state => state.endTurn);
  const reset = useGameStore(state => state.reset);
  const turn = useTurn();
  const species = useSpecies();
  const isProcessing = useIsProcessing();
  const treeData = useTreeData();
  
  return (
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'system-ui, -apple-system, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h1>Tetraspore Evolution Game</h1>
      
      <div style={{ 
        marginBottom: '2rem',
        padding: '1rem',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <h2>Turn {turn}</h2>
        
        <div style={{ marginBottom: '1rem' }}>
          <strong>Living Species ({species.filter(s => !s.extinctionTurn).length}):</strong>
          {species.filter(s => !s.extinctionTurn).length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              No species yet. Click "End Turn" to begin evolution!
            </p>
          ) : (
            <ul style={{ marginTop: '0.5rem' }}>
              {species
                .filter(s => !s.extinctionTurn)
                .map((speciesObj) => (
                  <li key={speciesObj.id}>
                    {speciesObj.name} 
                    {speciesObj.parentId && (
                      <span style={{ color: '#666', fontSize: '0.9em' }}>
                        {' '}(evolved from {species.find(s => s.id === speciesObj.parentId)?.name || 'unknown'})
                      </span>
                    )}
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={endTurn}
          disabled={isProcessing}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: isProcessing ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s'
          }}
        >
          {isProcessing ? 'Processing...' : 'End Turn'}
        </button>
        
        <button
          onClick={reset}
          disabled={isProcessing}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            opacity: isProcessing ? 0.5 : 1
          }}
        >
          Reset Game
        </button>
      </div>
      
      {turn === 0 && (
        <div style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          color: '#1976d2'
        }}>
          <p>
            <strong>How to play:</strong> Click "End Turn" to trigger the LLM 
            (currently using a mock service). The LLM will analyze the current 
            state and generate events that add or remove species.
          </p>
        </div>
      )}
      
      {/* Tree of Life Visualization */}
      <div style={{ marginTop: '2rem' }}>
        <TreeOfLife 
          nodes={treeData} 
          width={800} 
          height={400}
          onNodeClick={(node) => {
            console.log('Node clicked:', node);
          }}
        />
      </div>
    </div>
  );
}