import '@testing-library/jest-dom/vitest';

// Mock ResizeObserver for @react-three/fiber
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};