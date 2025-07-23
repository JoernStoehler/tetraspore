import { type FC } from 'react';

interface NavBarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  onSettingsClick: () => void;
  onReportBugClick: () => void;
}

export const NavBar: FC<NavBarProps> = ({
  currentView,
  onViewChange,
  onSettingsClick,
  onReportBugClick
}) => {
  const mainViews = [
    { id: 'planet-selection', label: 'Planet Selection' },
    { id: 'map', label: 'Map' },
    { id: 'evolution', label: 'Evolution' },
    { id: 'technology', label: 'Technology' }
  ];

  return (
    <nav className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
      <div className="flex space-x-6">
        {mainViews.map((view) => (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`px-4 py-2 rounded transition-colors ${
              currentView === view.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>
      
      <div className="flex space-x-4">
        <button
          onClick={onSettingsClick}
          className="px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="Settings (Esc)"
        >
          ⚙️
        </button>
        <button
          onClick={onReportBugClick}
          className="px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors"
          title="Report Bug"
        >
          🐛
        </button>
      </div>
    </nav>
  );
};