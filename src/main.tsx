import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Import DSL registry and tree components
import { registry } from './dsl'
import { TreeView } from './components/tree/TreeView'
import { GameControls } from './components/GameControls'

// Register components with DSL
registry.register('TreeView', TreeView)
registry.register('GameControls', GameControls)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
