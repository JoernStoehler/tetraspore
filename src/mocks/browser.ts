import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// Setup MSW worker for browser environment (E2E tests, development)
export const worker = setupWorker(...handlers)

// Start the worker in development
if (import.meta.env.DEV && import.meta.env.VITE_MSW_ENABLED === 'true') {
  worker.start({
    onUnhandledRequest: 'bypass',
  }).then(() => {
    console.log('🔧 MSW worker started for development')
  }).catch((error) => {
    console.error('Failed to start MSW worker:', error)
  })
}