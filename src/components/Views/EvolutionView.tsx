import { type FC } from 'react';

export const EvolutionView: FC = () => {
  return (
    <div className="h-full bg-gray-100 p-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Evolution</h1>
      
      <div className="bg-white p-4 rounded shadow-sm h-full flex flex-col items-center justify-center" style={{height: 'calc(100% - 3rem)'}}>
        <div className="text-6xl mb-4">🧬</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Evolution System
        </h2>
        <p className="text-gray-600 text-center mb-4">
          This view will contain the evolution mechanics and organism development features.
        </p>
        <div className="p-3 bg-gray-100 rounded">
          <p className="text-gray-500 text-sm">
            Placeholder view - Evolution features will be implemented in future updates.
          </p>
        </div>
      </div>
    </div>
  );
};