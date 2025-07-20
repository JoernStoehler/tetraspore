export const NODE_STYLES = {
  species: {
    container: 'border-2 border-gray-800 bg-white rounded-lg p-3 cursor-pointer hover:shadow-lg transition-shadow',
    title: 'font-bold text-gray-900',
    description: 'text-sm text-gray-600 mt-1',
    turn: 'text-xs text-gray-500 mt-2'
  },
  extinct: {
    container: 'border-2 border-gray-600 bg-gray-200 rounded-lg p-3 opacity-60',
    title: 'font-bold text-gray-700',
    description: 'text-sm text-gray-500 mt-1',
    turn: 'text-xs text-gray-400 mt-2'
  },
  createPreview: {
    container: 'border-2 border-dashed border-green-600 bg-green-50 rounded-lg p-3 opacity-80 relative',
    title: 'font-bold text-green-900',
    description: 'text-sm text-green-700 mt-1',
    turn: 'text-xs text-green-600 mt-2',
    buttons: 'absolute top-1 flex gap-1'
  },
  extinctPreview: {
    container: 'border-2 border-dashed border-red-600 bg-red-50 rounded-lg p-3 opacity-80 relative',
    title: 'font-bold text-red-900',
    description: 'text-sm text-red-700 mt-1',
    turn: 'text-xs text-red-600 mt-2',
    buttons: 'absolute top-1 flex gap-1'
  }
};

export const BUTTON_STYLES = {
  accept: 'w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-green-700 transition-colors',
  reject: 'w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-700 transition-colors'
};

export const TREE_DIMENSIONS = {
  nodeWidth: 200,
  nodeHeight: 100,
  horizontalSpacing: 250,
  verticalSpacing: 150,
  turnScale: 100
};

export const CONTROLS_STYLES = {
  container: 'fixed bottom-4 right-4 bg-white rounded-lg shadow-lg p-4 flex items-center gap-4',
  turnCounter: 'text-lg font-semibold text-gray-800',
  button: 'px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed',
  spinner: 'animate-spin h-5 w-5 text-blue-600'
};