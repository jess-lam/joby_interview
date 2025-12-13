/**
 * Global test setup file
 * This file runs before all tests
 */

import { beforeAll, beforeEach, afterEach, afterAll } from 'vitest'
import { cleanup } from '@testing-library/react'

// Import jest-dom matchers for better assertions
import '@testing-library/jest-dom'

// Setup MSW server
import { server } from '../../tests/mocks/server'
import { resetIssuesStore, handlers } from '../../tests/mocks/handlers'

beforeAll(() => {
  // Suppress expected unhandled rejections from error handling in hooks
  process.on('unhandledRejection', (reason) => {
    // Check if it's an AxiosError from our API calls (expected in error tests)
    if (reason && typeof reason === 'object' && 'response' in reason) {
      const axiosError = reason
      // These are expected errors from hooks that re-throw after handling
      // They're already handled (error state set, logged), so we can safely ignore
      if (axiosError.response?.status === 404 || axiosError.response?.status === 500) {
        return // Suppress this rejection
      }
    }
    // For other unhandled rejections, let them through (will be caught by Vitest)
  })
})

// Establish API mocking before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' })
})

// Restore handlers before each test (after they're reset in afterEach)
beforeEach(() => {
  server.use(...handlers)
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

