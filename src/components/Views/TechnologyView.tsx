import { type FC } from 'react';

export const TechnologyView: FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Technology</h1>
        
        <div className="bg-white p-12 rounded-lg shadow-md border-2 border-gray-300">
          <div className="text-6xl mb-6">🔬</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Technology Tree
          </h2>
          <p className="text-gray-600 text-lg">
            This view will contain the technology research and advancement systems.
          </p>
          <div className="mt-8 p-4 bg-gray-100 rounded">
            <p className="text-gray-500 text-sm">
              Placeholder view - Technology features will be implemented in future updates.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};