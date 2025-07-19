import { useUIStore } from '../../stores'
import { TreeView } from './TreeView'
import { MapView } from './MapView'
import { ChoicesView } from './ChoicesView'

export function ViewRouter() {
  const { currentView } = useUIStore()

  switch (currentView) {
    case 'tree':
      return <TreeView />
    case 'map':
      return <MapView />
    case 'choices':
      return <ChoicesView />
    case 'main':
    default:
      // For main view, default to tree view for now
      return <TreeView />
  }
}