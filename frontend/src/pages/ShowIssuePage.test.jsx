import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import { renderWithRouter } from '../tests/testUtils'
import { server } from '../../tests/mocks/server'
import { http, HttpResponse } from 'msw'
import { seedIssuesStore } from '../../tests/mocks/handlers'
import { createMockIssue } from '../tests/testData'
import ShowIssuePage from './ShowIssuePage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('ShowIssuePage', () => {
  // Store original window.confirm
  const originalConfirm = window.confirm

  beforeEach(() => {
    mockNavigate.mockClear()
    server.resetHandlers()
    // Reset window.confirm to default (returns true)
    window.confirm = vi.fn(() => true)
  })

  afterEach(() => {
    // Restore original window.confirm
    window.confirm = originalConfirm
  })

  describe('initial load', () => {
    it('shows loading spinner while fetching issue', async () => {
      const mockIssue = createMockIssue({ id: 1, title: 'Test Issue' })
      seedIssuesStore([mockIssue])

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id" element={<ShowIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1'],
        }
      )

      expect(screen.getByText('Loading issue...')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByText('Loading issue...')).not.toBeInTheDocument()
      })
    })

    it('fetches issue on mount', async () => {
      const mockIssue = createMockIssue({
        id: 1,
        title: 'Test Issue',
        description: 'Test Description',
        status: 'open',
      })
      seedIssuesStore([mockIssue])

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id" element={<ShowIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1'],
        }
      )

      await waitFor(() => {
        expect(screen.getByText('Test Issue')).toBeInTheDocument()
      })
    })
  })

  describe('displaying issue', () => {
    it('displays all issue details', async () => {
      const mockIssue = createMockIssue({
        id: 1,
        title: 'Test Issue Title',
        description: 'Test Issue Description',
        status: 'open',
      })
      seedIssuesStore([mockIssue])

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id" element={<ShowIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1'],
        }
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Issue #1' })).toBeInTheDocument()
        expect(screen.getByText('Test Issue Title')).toBeInTheDocument()
        expect(screen.getByText('Test Issue Description')).toBeInTheDocument()
        expect(screen.getByText('open')).toBeInTheDocument()
      })
    })

    it('displays formatted dates', async () => {
      const mockIssue = createMockIssue({
        id: 1,
        title: 'Test Issue',
        created_at: 1703520000, // December 25, 2023
        updated_at: 1703520000,
      })
      seedIssuesStore([mockIssue])

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id" element={<ShowIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1'],
        }
      )

      await waitFor(() => {
        expect(screen.getByText('Created')).toBeInTheDocument()
        expect(screen.getByText('Updated')).toBeInTheDocument()
      })
    })

    it('displays issue with closed status', async () => {
      const mockIssue = createMockIssue({
        id: 1,
        title: 'Closed Issue',
        status: 'closed',
      })
      seedIssuesStore([mockIssue])

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id" element={<ShowIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1'],
        }
      )

      await waitFor(() => {
        expect(screen.getByText('closed')).toBeInTheDocument()
      })
    })
  })

  describe('navigation', () => {
    it('navigates to issues list when Back button is clicked', async () => {
      const user = userEvent.setup()
      const mockIssue = createMockIssue({ id: 1 })
      seedIssuesStore([mockIssue])

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id" element={<ShowIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1'],
        }
      )

      await waitFor(() => {
        expect(screen.getByText('Test Issue')).toBeInTheDocument()
      })

      const backButton = screen.getByRole('button', { name: 'Back' })
      await user.click(backButton)

      expect(mockNavigate).toHaveBeenCalledWith('/issues')
    })

    it('navigates to edit page when Edit button is clicked', async () => {
      const user = userEvent.setup()
      const mockIssue = createMockIssue({ id: 1 })
      seedIssuesStore([mockIssue])

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id" element={<ShowIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1'],
        }
      )

      await waitFor(() => {
        expect(screen.getByText('Test Issue')).toBeInTheDocument()
      })

      const editButton = screen.getByRole('button', { name: 'Edit' })
      await user.click(editButton)

      expect(mockNavigate).toHaveBeenCalledWith('/issues/1/edit')
    })
  })

  describe('delete functionality', () => {
    it('shows confirmation dialog when Delete button is clicked', async () => {
      const user = userEvent.setup()
      const mockIssue = createMockIssue({ id: 1, title: 'Issue to Delete' })
      seedIssuesStore([mockIssue])

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id" element={<ShowIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1'],
        }
      )

      await waitFor(() => {
        expect(screen.getByText('Issue to Delete')).toBeInTheDocument()
      })

      const deleteButton = screen.getByRole('button', { name: 'Delete' })
      await user.click(deleteButton)

      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete issue #1? This action cannot be undone.'
      )
    })

    it('deletes issue and navigates to list when confirmed', async () => {
      const user = userEvent.setup()
      window.confirm = vi.fn(() => true) // User confirms
      const mockIssue = createMockIssue({ id: 1 })
      seedIssuesStore([mockIssue])

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id" element={<ShowIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1'],
        }
      )

      await waitFor(() => {
        expect(screen.getByText('Test Issue')).toBeInTheDocument()
      })

      const deleteButton = screen.getByRole('button', { name: 'Delete' })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/issues')
      })
    })

    it('does not delete when confirmation is cancelled', async () => {
      const user = userEvent.setup()
      window.confirm = vi.fn(() => false) // User cancels
      const mockIssue = createMockIssue({ id: 1 })
      seedIssuesStore([mockIssue])

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id" element={<ShowIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1'],
        }
      )

      await waitFor(() => {
        expect(screen.getByText('Test Issue')).toBeInTheDocument()
      })

      const deleteButton = screen.getByRole('button', { name: 'Delete' })
      await user.click(deleteButton)

      // Should not navigate
      expect(mockNavigate).not.toHaveBeenCalled()
      // Issue should still be visible
      expect(screen.getByText('Test Issue')).toBeInTheDocument()
    })

    it('shows loading state during delete', async () => {
      const user = userEvent.setup()
      window.confirm = vi.fn(() => true)

      // Override handler to add delay
      server.use(
        http.delete('*/api/v1/issues/1', async () => {
          await new Promise(resolve => setTimeout(resolve, 100))
          return new HttpResponse(null, { status: 204 })
        })
      )

      const mockIssue = createMockIssue({ id: 1 })
      seedIssuesStore([mockIssue])

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id" element={<ShowIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1'],
        }
      )

      await waitFor(() => {
        expect(screen.getByText('Test Issue')).toBeInTheDocument()
      })

      const deleteButton = screen.getByRole('button', { name: 'Delete' })
      await user.click(deleteButton)

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Deleting...')).toBeInTheDocument()
        expect(screen.getByText('Deleting issue...')).toBeInTheDocument()
      })
    })

    it('disables delete button during delete operation', async () => {
      const user = userEvent.setup()
      window.confirm = vi.fn(() => true)

      // Override handler to add delay
      server.use(
        http.delete('*/api/v1/issues/1', async () => {
          await new Promise(resolve => setTimeout(resolve, 100))
          return new HttpResponse(null, { status: 204 })
        })
      )

      const mockIssue = createMockIssue({ id: 1 })
      seedIssuesStore([mockIssue])

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id" element={<ShowIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1'],
        }
      )

      await waitFor(() => {
        expect(screen.getByText('Test Issue')).toBeInTheDocument()
      })

      const deleteButton = screen.getByRole('button', { name: 'Delete' })
      await user.click(deleteButton)

      // Button should be disabled during delete
      await waitFor(() => {
        expect(deleteButton).toBeDisabled()
      })
    })

    it('handles delete error gracefully', async () => {
      const user = userEvent.setup()
      window.confirm = vi.fn(() => true)

      server.use(
        http.delete('*/api/v1/issues/1', () => {
          return HttpResponse.json(
            { detail: 'Failed to delete issue' },
            { status: 500 }
          )
        })
      )

      const mockIssue = createMockIssue({ id: 1 })
      seedIssuesStore([mockIssue])

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id" element={<ShowIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1'],
        }
      )

      await waitFor(() => {
        expect(screen.getByText('Test Issue')).toBeInTheDocument()
      })

      const deleteButton = screen.getByRole('button', { name: 'Delete' })
      await user.click(deleteButton)

      await waitFor(() => {
        expect(mockNavigate).not.toHaveBeenCalled()
        expect(screen.getByText('Test Issue')).toBeInTheDocument()
      })
    })
  })

  describe('error states', () => {
    it('shows error message when fetch fails', async () => {
      server.use(
        http.get('*/api/v1/issues/1', () => {
          return HttpResponse.json(
            { detail: 'Failed to fetch issue' },
            { status: 500 }
          )
        })
      )

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id" element={<ShowIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1'],
        }
      )

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch issue')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Issue #1' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Back to Issues' })).toBeInTheDocument()
      })
    })

    it('shows not found message for 404 error', async () => {
      // Override handler to return 404
      server.use(
        http.get('*/api/v1/issues/999', () => {
          return HttpResponse.json(
            { detail: 'Issue with id 999 not found' },
            { status: 404 }
          )
        })
      )

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id" element={<ShowIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/999'],
        }
      )

      await waitFor(() => {
        // Component shows the API error message for 404
        expect(screen.getByText('Issue with id 999 not found')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Back to Issues' })).toBeInTheDocument()
      })
    })

    it('provides back button in error state', async () => {
      server.use(
        http.get('*/api/v1/issues/1', () => {
          return HttpResponse.json(
            { detail: 'Error message' },
            { status: 500 }
          )
        })
      )

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id" element={<ShowIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1'],
        }
      )

      await waitFor(() => {
        const backButton = screen.getByRole('button', { name: 'Back to Issues' })
        expect(backButton).toBeInTheDocument()
      })

      const user = userEvent.setup()
      const backButton = screen.getByRole('button', { name: 'Back to Issues' })
      await user.click(backButton)

      expect(mockNavigate).toHaveBeenCalledWith('/issues')
    })

    it('allows dismissing error message', async () => {
      server.use(
        http.get('*/api/v1/issues/1', () => {
          return HttpResponse.json(
            { detail: 'Error message' },
            { status: 500 }
          )
        })
      )

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id" element={<ShowIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1'],
        }
      )

      await waitFor(() => {
        expect(screen.getByText('Error message')).toBeInTheDocument()
      })

      const user = userEvent.setup()
      const dismissButton = screen.getByRole('button', { name: 'Dismiss error' })
      await user.click(dismissButton)

      await waitFor(() => {
        expect(screen.queryByText('Error message')).not.toBeInTheDocument()
      })
    })
  })
})
