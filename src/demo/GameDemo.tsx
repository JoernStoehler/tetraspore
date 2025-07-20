import { useEffect } from 'react';
import { useGameStore, useCurrentTurn, useIsProcessing, useSpecies, usePreviews } from '../game';
import { registry, type TreeNode } from '../dsl';

// Simple demo component showing game state
export function GameDemo() {
  const store = useGameStore();
  const turn = useCurrentTurn();
  const isProcessing = useIsProcessing();
  const species = useSpecies();
  const { create: createPreviews, extinct: extinctPreviews } = usePreviews();

  // Convert game state to tree nodes for visualization
  const treeNodes: TreeNode[] = [
    ...species.map(s => ({
      type: s.extinction_turn ? 'extinct' as const : 'species' as const,
      data: s
    })),
    ...createPreviews.map(p => ({
      type: 'createPreview' as const,
      data: p
    })),
    ...extinctPreviews.map(p => {
      const targetSpecies = species.find(s => s.id === p.species_id);
      return targetSpecies ? {
        type: 'extinctPreview' as const,
        data: { ...targetSpecies, preview_extinction_turn: p.extinction_turn }
      } : null;
    }).filter(Boolean) as TreeNode[]
  ];

  // Example of registering a mock tree component
  useEffect(() => {
    // In a real app, this would be the actual Tree component
    const MockTreeView = (props: any) => {
      return (
        <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
          <h3>Tree Visualization (Mock)</h3>
          <p>Nodes: {props.nodes.length}</p>
          <ul>
            {props.nodes.map((node: TreeNode, i: number) => (
              <li key={i}>
                {node.type}: {node.data.name || node.data.id}
              </li>
            ))}
          </ul>
        </div>
      );
    };

    registry.register('TreeView', MockTreeView);
  }, []);

  const TreeComponent = registry.get('TreeView');

  return (
    <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
      <h1>Tetraspore Game Demo</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <h2>Game State</h2>
        <p>Turn: {turn}</p>
        <p>Species Count: {species.filter(s => !s.extinction_turn).length} alive / {species.length} total</p>
        <p>Processing: {isProcessing ? 'Yes' : 'No'}</p>
        {store.state.lastError && (
          <p style={{ color: 'red' }}>Error: {store.state.lastError}</p>
        )}
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Actions</h2>
        <button 
          onClick={() => store.nextTurn()} 
          disabled={isProcessing}
          style={{ 
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            cursor: isProcessing ? 'not-allowed' : 'pointer',
            opacity: isProcessing ? 0.5 : 1
          }}
        >
          {isProcessing ? 'Processing...' : 'Next Turn'}
        </button>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2>Choices</h2>
        
        {createPreviews.length > 0 && (
          <div>
            <h3>New Species Choices:</h3>
            {createPreviews.map(preview => (
              <div key={preview.id} style={{ 
                border: '1px solid green', 
                padding: '1rem', 
                marginBottom: '0.5rem' 
              }}>
                <h4>{preview.name}</h4>
                <p>{preview.description}</p>
                <p>Parent: {preview.parent_id}</p>
                <button onClick={() => store.acceptCreate(preview.id)}>Accept</button>
                <button onClick={() => store.rejectCreate(preview.id)}>Reject</button>
              </div>
            ))}
          </div>
        )}

        {extinctPreviews.length > 0 && (
          <div>
            <h3>Extinction Choices:</h3>
            {extinctPreviews.map(preview => {
              const targetSpecies = species.find(s => s.id === preview.species_id);
              if (!targetSpecies) return null;
              
              return (
                <div key={preview.species_id} style={{ 
                  border: '1px solid red', 
                  padding: '1rem', 
                  marginBottom: '0.5rem' 
                }}>
                  <h4>{targetSpecies.name}</h4>
                  <p>Will go extinct this turn</p>
                  <button onClick={() => store.acceptExtinct(preview.species_id)}>Accept</button>
                  <button onClick={() => store.rejectExtinct(preview.species_id)}>Reject</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {TreeComponent && (
        <TreeComponent
          nodes={treeNodes}
          onAcceptCreate={store.acceptCreate}
          onRejectCreate={store.rejectCreate}
          onAcceptExtinct={store.acceptExtinct}
          onRejectExtinct={store.rejectExtinct}
        />
      )}

      <div style={{ marginTop: '2rem' }}>
        <h2>Species List</h2>
        {species.length === 0 ? (
          <p>No species yet. Click "Next Turn" to begin!</p>
        ) : (
          <ul>
            {species.map(s => (
              <li key={s.id} style={{ 
                textDecoration: s.extinction_turn ? 'line-through' : 'none',
                opacity: s.extinction_turn ? 0.5 : 1
              }}>
                <strong>{s.name}</strong> (Turn {s.creation_turn}
                {s.extinction_turn && ` - ${s.extinction_turn}`})
                <br />
                {s.description}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}