import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/**
 * @agent-note Component Registration - App initialization
 * @integration-point This is where React components become available to the DSL system
 * @critical-for-agents Any component the LLM wants to use MUST be registered here
 * 
 * Registration checklist for new components:
 * 1. Import the component
 * 2. Call registry.register('ExactName', Component)
 * 3. The name MUST match what the LLM will use in DSL
 * 4. Component props MUST be compatible with DSL types
 * 
 * Current components:
 * - TreeView: Displays species evolution tree with D3.js layout
 * - GameControls: Turn controls, accepts/rejects species choices
 * 
 * Future components to register:
 * - RegionMap: Geographic species distribution
 * - SpeciesCard: Detailed species information
 * - Timeline: Historical view of evolution
 */

// Import DSL registry and components
import { registry } from './dsl'
import { TreeView } from './components/tree/TreeView'
import { GameControls } from './components/GameControls'

// Register components with DSL - ORDER DOESN'T MATTER
registry.register('TreeView', TreeView)
registry.register('GameControls', GameControls)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
