import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/**
 * MSW server setup for Node.js environment (Vitest)
 * This server intercepts HTTP requests during tests
 */
export const server = setupServer(...handlers)

// Setup server before all tests
export const setup = () => {
  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
  })

  // Reset handlers after each test (useful for test isolation)
  afterEach(() => {
    server.resetHandlers()
  })

  // Clean up after all tests
  afterAll(() => {
    server.close()
  })
}

