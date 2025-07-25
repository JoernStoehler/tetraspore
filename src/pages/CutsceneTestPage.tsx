import { type FC, useState, useEffect } from 'react';
import { useActionProcessor } from '../hooks/useActionProcessor.js';
import { CutscenePlayer } from '../components/CutscenePlayer/index.js';
import type { AssetResult } from '../services/actions/executors/types.js';
import planetCreationExample from '../services/actions/examples/planet-creation.json';
import evolutionChoiceExample from '../services/actions/examples/evolution-choice.json';
import catastropheExample from '../services/actions/examples/catastrophe.json';

const exampleScenarios = {
  'planet-creation': planetCreationExample,
  'evolution-choice': evolutionChoiceExample,
  'catastrophe': catastropheExample
};

export const CutsceneTestPage: FC = () => {
  const [jsonInput, setJsonInput] = useState<string>(
    JSON.stringify(planetCreationExample, null, 2)
  );
  const [selectedExample, setSelectedExample] = useState<string>('planet-creation');
  const [currentCutsceneId, setCurrentCutsceneId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<Record<string, boolean>>({
    planet_just_created: false,
    catastrophe_triggered: false,
    species_has_underground_adaptation: false
  });

  const {
    processActions,
    status,
    lastResult,
    error,
    costBreakdown,
    isProcessing,
    reset
  } = useActionProcessor({
    useMockExecutors: true,
    onComplete: (result) => {
      console.log('Processing complete:', result);
      
      // Find and play the first cutscene if any
      const cutsceneAsset = result.assetsGenerated.find(
        asset => 'type' in asset && (asset as AssetResult & { type: string }).type === 'cutscene'
      );
      if (cutsceneAsset && 'id' in cutsceneAsset) {
        setCurrentCutsceneId(cutsceneAsset.id);
      }
    },
    onError: (err) => {
      console.error('Processing error:', err);
    }
  });

  useEffect(() => {
    setJsonInput(JSON.stringify(exampleScenarios[selectedExample as keyof typeof exampleScenarios], null, 2));
  }, [selectedExample]);

  const handleProcess = async () => {
    try {
      const parsed = JSON.parse(jsonInput);
      await processActions(parsed);
    } catch (err) {
      console.error('Invalid JSON:', err);
    }
  };

  const handleExampleChange = (example: string) => {
    setSelectedExample(example);
    reset();
    setCurrentCutsceneId(null);
  };

  const toggleGameState = (key: string) => {
    setGameState(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Action System Test Page</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Example Scenarios
              </label>
              <select
                value={selectedExample}
                onChange={(e) => handleExampleChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md"
              >
                <option value="planet-creation">Planet Creation</option>
                <option value="evolution-choice">Evolution Choice</option>
                <option value="catastrophe">Catastrophe</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                JSON Input
              </label>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                className="w-full h-96 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md font-mono text-sm"
                spellCheck={false}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Game State (for conditionals)
              </label>
              <div className="space-y-2">
                {Object.entries(gameState).map(([key, value]) => (
                  <label key={key} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={() => toggleGameState(key)}
                      className="rounded"
                    />
                    <span className="text-sm">{key}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleProcess}
              disabled={isProcessing}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 rounded-md font-medium transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Process Actions'}
            </button>

            {error && (
              <div className="p-4 bg-red-900/50 border border-red-700 rounded-md">
                <p className="font-medium">Error:</p>
                <p className="text-sm mt-1">{error.message}</p>
              </div>
            )}
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            {/* Status */}
            <div className="bg-gray-800 p-4 rounded-md">
              <h3 className="font-medium mb-2">Processing Status</h3>
              <div className="space-y-2 text-sm">
                <div>Status: {status.isProcessing ? 'Processing' : 'Idle'}</div>
                <div>Current Action: {status.currentAction || 'None'}</div>
                <div>Progress: {status.progress.toFixed(1)}%</div>
                <div>Queue Length: {status.queueLength}</div>
              </div>
              
              {status.isProcessing && (
                <div className="mt-2">
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${status.progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Cost Breakdown */}
            <div className="bg-gray-800 p-4 rounded-md">
              <h3 className="font-medium mb-2">Cost Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div>Images: {costBreakdown.images.count} (${costBreakdown.images.cost.toFixed(3)})</div>
                <div>Audio: {costBreakdown.audio.count} (${costBreakdown.audio.cost.toFixed(3)})</div>
                <div className="font-medium pt-2 border-t border-gray-700">
                  Total: ${costBreakdown.total.toFixed(3)}
                </div>
              </div>
            </div>

            {/* Results */}
            {lastResult && (
              <div className="bg-gray-800 p-4 rounded-md">
                <h3 className="font-medium mb-2">Processing Results</h3>
                <div className="space-y-2 text-sm">
                  <div>Success: {lastResult.success ? '✅' : '❌'}</div>
                  <div>Assets Generated: {lastResult.assetsGenerated.length}</div>
                  <div>Actions Executed: {lastResult.actionsExecuted.length}</div>
                  <div>Execution Time: {lastResult.executionTime}ms</div>
                  
                  {lastResult.errors.length > 0 && (
                    <div className="mt-2 p-2 bg-red-900/50 rounded">
                      <p className="font-medium">Errors:</p>
                      {lastResult.errors.map((err, i) => (
                        <p key={i} className="text-xs mt-1">{err.message}</p>
                      ))}
                    </div>
                  )}

                  {lastResult.assetsGenerated.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium">Generated Assets:</p>
                      <ul className="mt-1 space-y-1">
                        {lastResult.assetsGenerated.map((asset, i) => (
                          <li key={i} className="text-xs">
                            {'type' in asset ? (asset as AssetResult & { type: string }).type : 'unknown'}: {asset.id}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Cutscene Player */}
            {currentCutsceneId && (
              <div className="bg-gray-800 p-4 rounded-md">
                <h3 className="font-medium mb-2">Cutscene Player</h3>
                <CutscenePlayer
                  cutsceneId={currentCutsceneId}
                  onComplete={() => {
                    console.log('Cutscene completed');
                    setCurrentCutsceneId(null);
                  }}
                  onSkip={() => {
                    console.log('Cutscene skipped');
                    setCurrentCutsceneId(null);
                  }}
                  autoplay
                  allowSkip
                  allowReplay
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};