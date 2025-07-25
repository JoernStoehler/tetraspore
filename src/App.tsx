// External dependencies
import { useEffect } from 'react';

// Internal imports
import { useUIStore } from '@/stores';

// Relative imports
import { NavBar, PlanetSelectionView, MapView, EvolutionView, TechnologyView, SettingsModal } from './components';

// Type imports
import type { ViewType } from '@/stores';

function App() {
  const currentView = useUIStore((state) => state.currentView);
  const isSettingsOpen = useUIStore((state) => state.isSettingsOpen);
  const setCurrentView = useUIStore((state) => state.setCurrentView);
  const setSettingsOpen = useUIStore((state) => state.setSettingsOpen);
  const toggleSettings = useUIStore((state) => state.toggleSettings);
  const navigateToMap = useUIStore((state) => state.navigateToMap);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        toggleSettings();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleSettings]);

  const handleViewChange = (view: string): void => {
    setCurrentView(view as ViewType);
  };

  const handleReportBug = (): void => {
    window.open('https://github.com/JoernStoehler/tetraspore/issues/new', '_blank');
  };

  const renderCurrentView = (): JSX.Element => {
    switch (currentView) {
      case 'planet-selection':
        return <PlanetSelectionView onNavigateToMap={navigateToMap} />;
      case 'map':
        return <MapView />;
      case 'evolution':
        return <EvolutionView />;
      case 'technology':
        return <TechnologyView />;
      default:
        return <PlanetSelectionView onNavigateToMap={navigateToMap} />;
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <NavBar
        currentView={currentView}
        onViewChange={handleViewChange}
        onSettingsClick={() => setSettingsOpen(true)}
        onReportBugClick={handleReportBug}
      />
      
      <div className="flex-1 overflow-hidden">
        {renderCurrentView()}
      </div>
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}

export default App