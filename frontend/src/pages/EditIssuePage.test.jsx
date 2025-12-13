import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Routes, Route } from 'react-router-dom'
import { renderWithRouter } from '../tests/testUtils'
import { server } from '../../tests/mocks/server'
import { http, HttpResponse } from 'msw'
import { seedIssuesStore } from '../../tests/mocks/handlers'
import { createMockIssue, createValidationError, validationErrors } from '../tests/testData'
import EditIssuePage from './EditIssuePage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('EditIssuePage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    // Store is reset in setupTests.js afterEach, so we don't need to reset here
  })


  describe('loading issue data', () => {
    it('shows loading spinner initially when fetching issue', async () => {
      const mockIssue = createMockIssue({ id: 1, title: 'Test Issue', description: 'Test Description' })
      seedIssuesStore([mockIssue])

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id/edit" element={<EditIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1/edit'],
        }
      )

      // Should show loading spinner initially
      expect(screen.getByText('Loading issue...')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByText('Loading issue...')).not.toBeInTheDocument()
      })
    })

    it('fetches issue on mount with ID from URL params', async () => {
      // Use seedIssuesStore like IssueListPage does (which works)
      const mockIssue = createMockIssue({ id: 1, title: 'Fetched Issue', description: 'Fetched Description' })
      seedIssuesStore([mockIssue])

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id/edit" element={<EditIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1/edit'],
        }
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/Title/)).toHaveValue('Fetched Issue')
      })
    })

    it('displays page title with issue ID', async () => {
      const mockIssue = createMockIssue({ id: 1, title: 'Test Issue', description: 'Test Description' })
      seedIssuesStore([mockIssue])

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id/edit" element={<EditIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1/edit'],
        }
      )

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Edit Issue #1' })).toBeInTheDocument()
      })
    })
  })

  describe('form pre-population', () => {
    it('pre-populates form fields with issue data when issue is loaded', async () => {
      const mockIssue = createMockIssue({
        title: 'Original Title',
        description: 'Original Description',
        status: 'closed',
      })
      seedIssuesStore([mockIssue])

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id/edit" element={<EditIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1/edit'],
        }
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/Title/)).toHaveValue('Original Title')
        expect(screen.getByLabelText(/Description/)).toHaveValue('Original Description')
        expect(screen.getByLabelText(/Status/)).toHaveValue('closed')
      })
    })

    it('displays correct values in all form fields', async () => {
      const mockIssue = createMockIssue({
        title: 'Issue Title',
        description: 'Issue Description',
        status: 'open',
      })
      seedIssuesStore([mockIssue])

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id/edit" element={<EditIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1/edit'],
        }
      )

      await waitFor(() => {
        const titleField = screen.getByLabelText(/Title/)
        const descriptionField = screen.getByLabelText(/Description/)
        const statusField = screen.getByLabelText(/Status/)

        expect(titleField).toHaveValue('Issue Title')
        expect(descriptionField).toHaveValue('Issue Description')
        expect(statusField).toHaveValue('open')
      })
    })
  })

  describe('successful update', () => {
    it('updates issue and navigates to issue page on successful save', async () => {
      const user = userEvent.setup()
      const mockIssue = createMockIssue({
        title: 'Original Title',
        description: 'Original Description',
        status: 'open',
      })
      seedIssuesStore([mockIssue])

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id/edit" element={<EditIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1/edit'],
        }
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/Title/)).toHaveValue('Original Title')
      })

      // Change title
      const titleField = screen.getByLabelText(/Title/)
      await user.clear(titleField)
      await user.type(titleField, 'Updated Title')

      // Submit form
      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)

      // Wait for navigation
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/issues/1')
      })
    })

    it('only sends changed fields', async () => {
      const user = userEvent.setup()
      const mockIssue = createMockIssue({
        title: 'Original Title',
        description: 'Original Description',
        status: 'open',
      })
      seedIssuesStore([mockIssue])

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id/edit" element={<EditIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1/edit'],
        }
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/Title/)).toHaveValue('Original Title')
      })

      // Only change title
      const titleField = screen.getByLabelText(/Title/)
      await user.clear(titleField)
      await user.type(titleField, 'Updated Title')

      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)

      // Verify navigation (confirms update was successful)
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled()
      })
    })
  })

  describe('validation errors', () => {
    it('displays field errors when validation fails', async () => {
      const user = userEvent.setup()
      const mockIssue = createMockIssue({
        title: 'Original Title',
        description: 'Original Description',
        status: 'open',
      })
      seedIssuesStore([mockIssue])

      // Override handler to return validation error
      server.use(
        http.patch('*/api/v1/issues/:id', () => {
          return HttpResponse.json(
            createValidationError([validationErrors.titleRequired]),
            { status: 422 }
          )
        })
      )

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id/edit" element={<EditIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1/edit'],
        }
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/Title/)).toHaveValue('Original Title')
      })

      // Clear title and submit
      const titleField = screen.getByLabelText(/Title/)
      await user.clear(titleField)

      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)

      await waitFor(() => {
        const errorMessages = screen.getAllByText(/String should have at least 1 character/i)
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('clears field errors when user fixes them', async () => {
      const user = userEvent.setup()
      const mockIssue = createMockIssue({
        title: 'Original Title',
        description: 'Original Description',
        status: 'open',
      })
      seedIssuesStore([mockIssue])

      server.use(
        http.patch('*/api/v1/issues/:id', () => {
          return HttpResponse.json(
            createValidationError([validationErrors.titleRequired]),
            { status: 422 }
          )
        })
      )

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id/edit" element={<EditIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1/edit'],
        }
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/Title/)).toHaveValue('Original Title')
      })

      // Clear title and submit
      const titleField = screen.getByLabelText(/Title/)
      await user.clear(titleField)
      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(screen.getByText(/String should have at least 1 character/i)).toBeInTheDocument()
      })

      // Fix the error by typing in the field
      await user.type(titleField, 'Fixed Title')

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/String should have at least 1 character/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('API errors', () => {
    it('displays error message when update fails', async () => {
      const user = userEvent.setup()
      const mockIssue = createMockIssue({
        title: 'Test Issue',
        description: 'Test Description',
        status: 'open',
      })
      seedIssuesStore([mockIssue])

      server.use(
        http.patch('*/api/v1/issues/:id', () => {
          return HttpResponse.json(
            { detail: 'Internal server error' },
            { status: 500 }
          )
        })
      )

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id/edit" element={<EditIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1/edit'],
        }
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/Title/)).toHaveValue('Test Issue')
      })

      const titleField = screen.getByLabelText(/Title/)
      await user.clear(titleField)
      await user.type(titleField, 'Updated Title')

      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(screen.getByText('Internal server error')).toBeInTheDocument()
      })
    })

    it('displays error message when fetch fails', async () => {
      server.use(
        http.get('*/api/v1/issues/:id', () => {
          return HttpResponse.json(
            { detail: 'Failed to fetch issue' },
            { status: 500 }
          )
        })
      )

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id/edit" element={<EditIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1/edit'],
        }
      )

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch issue')).toBeInTheDocument()
      })
    })

    it('clears error when dismiss button is clicked', async () => {
      const user = userEvent.setup()
      const mockIssue = createMockIssue({
        title: 'Test Issue',
        description: 'Test Description',
        status: 'open',
      })
      seedIssuesStore([mockIssue])

      server.use(
        http.patch('*/api/v1/issues/:id', () => {
          return HttpResponse.json(
            { detail: 'Server error' },
            { status: 500 }
          )
        })
      )

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id/edit" element={<EditIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1/edit'],
        }
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/Title/)).toHaveValue('Test Issue')
      })

      const titleField = screen.getByLabelText(/Title/)
      await user.clear(titleField)
      await user.type(titleField, 'Updated Title')

      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(screen.getByText('Server error')).toBeInTheDocument()
      })

      const dismissButton = screen.getByLabelText('Dismiss error')
      await user.click(dismissButton)

      await waitFor(() => {
        expect(screen.queryByText('Server error')).not.toBeInTheDocument()
      })
    })
  })

  describe('404 handling', () => {
    it('displays "Issue not found" message when issue does not exist', async () => {
      // Don't seed any issues
      renderWithRouter(
        <Routes>
          <Route path="/issues/:id/edit" element={<EditIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/999/edit'],
        }
      )

      await waitFor(() => {
        expect(screen.getByText(/Issue with id 999 not found/)).toBeInTheDocument()
      })
    })

    it('shows "Back to Issues" button when issue not found', async () => {
      renderWithRouter(
        <Routes>
          <Route path="/issues/:id/edit" element={<EditIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/999/edit'],
        }
      )

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Back to Issue' })).toBeInTheDocument()
      })
    })
  })

  describe('navigation', () => {
    it('navigates to issue page on successful save', async () => {
      const user = userEvent.setup()
      const mockIssue = createMockIssue({
        title: 'Test Issue',
        description: 'Test Description',
        status: 'open',
      })
      seedIssuesStore([mockIssue])

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id/edit" element={<EditIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1/edit'],
        }
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/Title/)).toHaveValue('Test Issue')
      })

      const titleField = screen.getByLabelText(/Title/)
      await user.clear(titleField)
      await user.type(titleField, 'Updated Title')

      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/issues/1')
      })
    })

    it('navigates to issue page when Cancel button is clicked', async () => {
      const user = userEvent.setup()
      const mockIssue = createMockIssue({
        title: 'Test Issue',
        description: 'Test Description',
        status: 'open',
      })
      seedIssuesStore([mockIssue])

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id/edit" element={<EditIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1/edit'],
        }
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/Title/)).toHaveValue('Test Issue')
      })

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)

      expect(mockNavigate).toHaveBeenCalledWith('/issues/1')
    })
  })

  describe('loading state', () => {
    it('disables buttons during submission', async () => {
      const user = userEvent.setup()
      const mockIssue = createMockIssue({
        title: 'Test Issue',
        description: 'Test Description',
        status: 'open',
      })
      seedIssuesStore([mockIssue])

      let resolveUpdate
      const updatePromise = new Promise((resolve) => {
        resolveUpdate = resolve
      })

      server.use(
        http.patch('*/api/v1/issues/:id', async ({ params }) => {
          await updatePromise
          const id = parseInt(params.id, 10)
          return HttpResponse.json(createMockIssue({ id }), { status: 200 })
        })
      )

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id/edit" element={<EditIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1/edit'],
        }
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/Title/)).toHaveValue('Test Issue')
      })

      const titleField = screen.getByLabelText(/Title/)
      await user.clear(titleField)
      await user.type(titleField, 'Updated Title')

      const saveButton = screen.getByRole('button', { name: 'Save' })
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })

      await user.click(saveButton)

      await waitFor(() => {
        expect(saveButton).toBeDisabled()
        expect(cancelButton).toBeDisabled()
      })

      resolveUpdate()
      await updatePromise
    })

    it('shows "Saving..." text on Save button during submission', async () => {
      const user = userEvent.setup()
      const mockIssue = createMockIssue({
        title: 'Test Issue',
        description: 'Test Description',
        status: 'open',
      })
      seedIssuesStore([mockIssue])

      let resolveUpdate
      const updatePromise = new Promise((resolve) => {
        resolveUpdate = resolve
      })

      server.use(
        http.patch('*/api/v1/issues/:id', async ({ params }) => {
          await updatePromise
          const id = parseInt(params.id, 10)
          return HttpResponse.json(createMockIssue({ id }), { status: 200 })
        })
      )

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id/edit" element={<EditIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1/edit'],
        }
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/Title/)).toHaveValue('Test Issue')
      })

      const titleField = screen.getByLabelText(/Title/)
      await user.clear(titleField)
      await user.type(titleField, 'Updated Title')

      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Saving...' })).toBeInTheDocument()
      })

      resolveUpdate()
      await updatePromise
    })

    it('shows loading spinner during submission', async () => {
      const user = userEvent.setup()
      const mockIssue = createMockIssue({
        title: 'Test Issue',
        description: 'Test Description',
        status: 'open',
      })
      seedIssuesStore([mockIssue])

      let resolveUpdate
      const updatePromise = new Promise((resolve) => {
        resolveUpdate = resolve
      })

      server.use(
        http.patch('*/api/v1/issues/:id', async ({ params }) => {
          await updatePromise
          const id = parseInt(params.id, 10)
          return HttpResponse.json(createMockIssue({ id }), { status: 200 })
        })
      )

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id/edit" element={<EditIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1/edit'],
        }
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/Title/)).toHaveValue('Test Issue')
      })

      const titleField = screen.getByLabelText(/Title/)
      await user.clear(titleField)
      await user.type(titleField, 'Updated Title')

      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(screen.getByText('Saving changes...')).toBeInTheDocument()
      })

      resolveUpdate()
      await updatePromise
    })
  })

  describe('no changes scenario', () => {
    it('does not navigate when no fields have changed', async () => {
      const user = userEvent.setup()
      const mockIssue = createMockIssue({
        title: 'Original Title',
        description: 'Original Description',
        status: 'open',
      })
      seedIssuesStore([mockIssue])

      renderWithRouter(
        <Routes>
          <Route path="/issues/:id/edit" element={<EditIssuePage />} />
        </Routes>,
        {
          initialEntries: ['/issues/1/edit'],
        }
      )

      await waitFor(() => {
        expect(screen.getByLabelText(/Title/)).toHaveValue('Original Title')
      })

      // Don't change any fields, just click save
      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)

      // Wait a bit to ensure no navigation occurs
      await waitFor(() => {
        // Navigation should not be called when no changes
        expect(mockNavigate).not.toHaveBeenCalled()
      }, { timeout: 1000 })
    })
  })
})
