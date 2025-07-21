# Tree of Life Playground - Tech Stack Options

## Option 1: Storybook (Popular, Feature-Rich)
```bash
npm install --save-dev @storybook/react @storybook/react-vite
```

**Pros:**
- Industry standard, huge ecosystem
- Great UI with controls/knobs
- Supports MDX for documentation
- Add-ons for accessibility, viewport testing

**Cons:**
- Heavy setup (~200MB)
- Overkill for focused experimentation
- Can be slow with complex components

## Option 2: Ladle (Lightweight Alternative)
```bash
npm install --save-dev @ladle/react
```

**Pros:**
- Minimal, fast (built on Vite)
- Simple setup, just works
- Good for rapid prototyping
- ~10x smaller than Storybook

**Cons:**
- Fewer features
- Smaller ecosystem
- Less documentation

## Option 3: Custom Playground Route (Recommended)
```typescript
// src/playground/TreeOfLifePlayground.tsx
export function TreeOfLifePlayground() {
  const [scenario, setScenario] = useState('basic');
  const [speed, setSpeed] = useState(1);
  
  return (
    <div className="tol-playground">
      <Sidebar>
        <ScenarioSelector value={scenario} onChange={setScenario} />
        <Controls speed={speed} onSpeedChange={setSpeed} />
      </Sidebar>
      
      <MainView>
        <TreeOfLife data={scenarios[scenario]} config={config} />
      </MainView>
    </div>
  );
}

// Add route: /playground/tree-of-life
```

**Pros:**
- Zero additional dependencies
- Full control over UI/UX
- Can use existing routing
- Integrated with app state
- Fast iteration

**Cons:**
- Need to build UI ourselves
- No automatic documentation

## My Recommendation: Custom Playground

For Tetraspore's specific needs:

```typescript
// src/playground/index.tsx
export function Playground() {
  return (
    <Routes>
      <Route path="/" element={<PlaygroundHome />} />
      <Route path="/tree-of-life/:scenario?" element={<TreeOfLifePlayground />} />
      <Route path="/combat/:scenario?" element={<CombatPlayground />} />
      {/* Future playgrounds */}
    </Routes>
  );
}

// Access via: http://localhost:3000/playground/tree-of-life/turn-8-to-10
```

### Why Custom?

1. **Specific to Game Development**
   - Scenario timeline scrubbing
   - Event replay controls
   - Game-specific UI needs

2. **Lightweight**
   - No extra build complexity
   - No dependency bloat
   - Uses existing React setup

3. **Flexible**
   - Can add WebSocket for live data
   - Easy to add record/replay
   - Custom visualization controls

### Example Structure:

```
src/playground/
├── index.tsx                 # Playground routes
├── components/
│   ├── ScenarioSelector.tsx  # Choose test data
│   ├── TimelineControls.tsx  # Scrub through turns
│   ├── EventPlayer.tsx       # Replay events
│   └── ConfigPanel.tsx       # Theme/settings
├── scenarios/
│   ├── basic-tree.json       # Simple 3-species tree
│   ├── complex-tree.json     # 50+ species
│   ├── extinction-event.json # Mass extinction test
│   └── replay-8-to-10.json   # Your example
└── TreeOfLifePlayground.tsx

```

## Quick Implementation

```typescript
// TreeOfLifePlayground.tsx
import { scenarios } from './scenarios';
import { TreeOfLife } from '../components/TreeOfLife';

export function TreeOfLifePlayground() {
  const [scenario, setScenario] = useState('basic');
  const [playing, setPlaying] = useState(false);
  const [events, setEvents] = useState([]);
  
  // Event replay logic
  useEffect(() => {
    if (playing && events.length > 0) {
      const timer = setTimeout(() => {
        applyNextEvent();
      }, 1000 / playbackSpeed);
      return () => clearTimeout(timer);
    }
  }, [playing, events]);
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="grid grid-cols-[300px_1fr] gap-4">
        {/* Control Panel */}
        <div className="bg-gray-800 p-4 rounded">
          <h2>Scenarios</h2>
          <select 
            value={scenario} 
            onChange={(e) => setScenario(e.target.value)}
            className="w-full p-2 bg-gray-700"
          >
            <option value="basic">Basic Tree</option>
            <option value="replay-8-10">Replay Turn 8→10</option>
            <option value="extinction">Mass Extinction</option>
          </select>
          
          {/* Playback controls */}
          <div className="mt-4">
            <button onClick={() => setPlaying(!playing)}>
              {playing ? 'Pause' : 'Play'}
            </button>
          </div>
        </div>
        
        {/* Tree View */}
        <div className="bg-gray-800 rounded p-4">
          <TreeOfLife 
            data={scenarios[scenario].data}
            theme={selectedTheme}
          />
        </div>
      </div>
    </div>
  );
}
```

## Decision

Unless you need:
- Component documentation for a team
- Automated visual regression testing  
- Shared component library

...go with the **custom playground**. It's simpler, faster, and exactly what you need for game prototyping.