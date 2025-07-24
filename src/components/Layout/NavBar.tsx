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
    <nav className="bg-gray-800 text-white px-4 py-2 flex justify-between items-center flex-shrink-0">
      <div className="flex space-x-4">
        {mainViews.map((view) => (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`px-3 py-1 rounded transition-colors text-sm ${
              currentView === view.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>
      
      <div className="flex space-x-2">
        <button
          onClick={onSettingsClick}
          className="px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors text-sm"
          title="Settings (Esc)"
        >
          ⚙️
        </button>
        <button
          onClick={onReportBugClick}
          className="px-2 py-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded transition-colors text-sm"
          title="Report Bug"
        >
          🐛
        </button>
      </div>
    </nav>
  );
};