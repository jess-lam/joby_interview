import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

/**
 * Custom render function that includes Router for components that use routing
 * Use this instead of the default render from @testing-library/react when testing
 * components that use React Router hooks (useNavigate, useLocation, etc.)
 * 
 * @param {React.ReactElement} ui - The component to render
 * @param {Object} [options={}] - Render options
 * @param {string|string[]} [options.initialEntries=['/']] - Initial route entries for MemoryRouter
 * @returns {Object} Render result with all testing utilities from @testing-library/react
 * 
 * @example
 * // Default route
 * const { getByText } = renderWithRouter(<IssueListPage />)
 * 
 * @example
 * // Specific route
 * const { getByText } = renderWithRouter(
 *   <IssueListPage />,
 *   { initialEntries: ['/issues'] }
 * )
 * 
 * @example
 * // Multiple route entries (for testing navigation history)
 * const { getByText } = renderWithRouter(
 *   <IssueListPage />,
 *   { initialEntries: ['/issues', '/issues/1'] }
 * )
 */
export function renderWithRouter(ui, options = {}) {
  const { initialEntries = ['/'], ...renderOptions } = options

  return render(ui, {
    wrapper: ({ children }) => (
      <MemoryRouter 
        initialEntries={initialEntries}
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        {children}
      </MemoryRouter>
    ),
    ...renderOptions,
  })
}

export function createMockNavigate() {
  return vi.fn()
}

export * from '@testing-library/react'
