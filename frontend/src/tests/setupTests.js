/**
 * Global test setup file
 * This file runs before all tests
 */

import { beforeAll, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'

// Import jest-dom matchers for better assertions
import '@testing-library/jest-dom'

// Setup MSW server
import { server } from '../../tests/mocks/server'
import { resetIssuesStore } from '../../tests/mocks/handlers'

// Establish API mocking before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

// Reset handlers and store after each test (important for test isolation)
afterEach(() => {
  server.resetHandlers()
  resetIssuesStore()
  cleanup() // Clean up React Testing Library after each test
})

// Clean up after all tests are done
afterAll(() => {
  server.close()
})

// Suppress console errors/warnings in tests (optional - remove if you want to see them)
// Uncomment the following lines if you want to suppress console output during tests
/*
const originalError = console.error
const originalWarn = console.warn

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || args[0].includes('Not implemented'))
    ) {
      return
    }
    originalError.call(console, ...args)
  }
  
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('DeprecationWarning')
    ) {
      return
    }
    originalWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalError
  console.warn = originalWarn
})
*/

