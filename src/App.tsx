import { useState, useEffect } from 'react';
import { NavBar, PlanetSelectionView, MapView, EvolutionView, TechnologyView, SettingsModal } from './components';

function App() {
  const [currentView, setCurrentView] = useState('planet-selection');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSettingsOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  const handleNavigateToMap = () => {
    setCurrentView('map');
  };

  const handleReportBug = () => {
    window.open('https://github.com/JoernStoehler/tetraspore/issues/new', '_blank');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'planet-selection':
        return <PlanetSelectionView onNavigateToMap={handleNavigateToMap} />;
      case 'map':
        return <MapView />;
      case 'evolution':
        return <EvolutionView />;
      case 'technology':
        return <TechnologyView />;
      default:
        return <PlanetSelectionView onNavigateToMap={handleNavigateToMap} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <NavBar
        currentView={currentView}
        onViewChange={handleViewChange}
        onSettingsClick={() => setIsSettingsOpen(true)}
        onReportBugClick={handleReportBug}
      />
      
      {renderCurrentView()}
      
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App