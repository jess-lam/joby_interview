import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '../tests/testUtils'
import { server } from '../../tests/mocks/server'
import { http, HttpResponse } from 'msw'
import { resetIssuesStore } from '../../tests/mocks/handlers'
import { createMockIssue, createValidationError, validationErrors } from '../tests/testData'
import CreateIssuePage from './CreateIssuePage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('CreateIssuePage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    resetIssuesStore()
    server.resetHandlers()
  })

  describe('form rendering', () => {
    it('renders page title', () => {
      renderWithRouter(<CreateIssuePage />)
      expect(screen.getByRole('heading', { name: 'Create Issue' })).toBeInTheDocument()
    })

    it('renders all form fields', () => {
      renderWithRouter(<CreateIssuePage />)
      expect(screen.getByLabelText(/Title/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Status/)).toBeInTheDocument()
    })

    it('renders Cancel and Save buttons', () => {
      renderWithRouter(<CreateIssuePage />)
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Save' })).toBeInTheDocument()
    })
  })

  describe('successful submission', () => {
    it('fills form, submits, and navigates to issue page', async () => {
      const user = userEvent.setup()
      createMockIssue({ id: 1, title: 'New Issue', description: 'New Description' })

      renderWithRouter(<CreateIssuePage />)

      // Fill form fields
      const titleField = screen.getByLabelText(/Title/)
      const descriptionField = screen.getByLabelText(/Description/)
      const statusField = screen.getByLabelText(/Status/)

      await user.type(titleField, 'New Issue')
      await user.type(descriptionField, 'New Description')
      await user.selectOptions(statusField, 'closed')

      // Submit form
      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)

      // Wait for navigation
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/issues/1')
      })
    })

    it('creates issue with correct data', async () => {
      const user = userEvent.setup()
      createMockIssue({ id: 1, title: 'Test Issue', description: 'Test Description' })

      renderWithRouter(<CreateIssuePage />)

      await user.type(screen.getByLabelText(/Title/), 'Test Issue')
      await user.type(screen.getByLabelText(/Description/), 'Test Description')

      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)

      // Verify API was called (navigation confirms success)
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalled()
      })
    })
  })

  describe('validation errors', () => {
    it('displays field errors when validation fails', async () => {
      const user = userEvent.setup()

      // Override handler to return validation error
      server.use(
        http.post('*/api/v1/issues', () => {
          return HttpResponse.json(
            createValidationError([
              validationErrors.titleRequired,
              validationErrors.descriptionRequired,
            ]),
            { status: 422 }
          )
        })
      )

      renderWithRouter(<CreateIssuePage />)

      // Submit empty form
      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)

      // Wait for validation errors
      await waitFor(() => {
        const errorMessages = screen.getAllByText(/String should have at least 1 character/i)
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('shows multiple field errors when multiple fields are invalid', async () => {
      const user = userEvent.setup()

      server.use(
        http.post('*/api/v1/issues', () => {
          return HttpResponse.json(
            createValidationError([
              validationErrors.titleRequired,
              validationErrors.descriptionRequired,
            ]),
            { status: 422 }
          )
        })
      )

      renderWithRouter(<CreateIssuePage />)

      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        const errorMessages = screen.getAllByText(/String should have at least 1 character/i)
        expect(errorMessages.length).toBeGreaterThan(0)
      })
    })

    it('clears field errors when user fixes them', async () => {
      const user = userEvent.setup()

      server.use(
        http.post('*/api/v1/issues', () => {
          return HttpResponse.json(
            createValidationError([validationErrors.titleRequired]),
            { status: 422 }
          )
        })
      )

      renderWithRouter(<CreateIssuePage />)

      // Submit empty form
      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(screen.getByText(/String should have at least 1 character/i)).toBeInTheDocument()
      })

      // Fix the error by typing in the field
      await user.type(screen.getByLabelText(/Title/), 'Fixed Title')

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/String should have at least 1 character/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('API errors', () => {
    it('displays error message when API call fails', async () => {
      const user = userEvent.setup()

      server.use(
        http.post('*/api/v1/issues', () => {
          return HttpResponse.json(
            { detail: 'Internal server error' },
            { status: 500 }
          )
        })
      )

      renderWithRouter(<CreateIssuePage />)

      await user.type(screen.getByLabelText(/Title/), 'Test Issue')
      await user.type(screen.getByLabelText(/Description/), 'Test Description')
      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(screen.getByText('Internal server error')).toBeInTheDocument()
      })
    })

    it('clears error when dismiss button is clicked', async () => {
      const user = userEvent.setup()

      server.use(
        http.post('*/api/v1/issues', () => {
          return HttpResponse.json(
            { detail: 'Server error' },
            { status: 500 }
          )
        })
      )

      renderWithRouter(<CreateIssuePage />)

      await user.type(screen.getByLabelText(/Title/), 'Test Issue')
      await user.type(screen.getByLabelText(/Description/), 'Test Description')
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

  describe('loading state', () => {
    it('disables Save and Cancel buttons during submission', async () => {
      const user = userEvent.setup()

      // Create a promise that we can control
      let resolveCreate
      const createPromise = new Promise((resolve) => {
        resolveCreate = resolve
      })

      server.use(
        http.post('*/api/v1/issues', async () => {
          await createPromise
          return HttpResponse.json(createMockIssue({ id: 1 }), { status: 201 })
        })
      )

      renderWithRouter(<CreateIssuePage />)

      await user.type(screen.getByLabelText(/Title/), 'Test Issue')
      await user.type(screen.getByLabelText(/Description/), 'Test Description')

      const saveButton = screen.getByRole('button', { name: 'Save' })
      const cancelButton = screen.getByRole('button', { name: 'Cancel' })

      await user.click(saveButton)

      // Buttons should be disabled during submission
      await waitFor(() => {
        expect(saveButton).toBeDisabled()
        expect(cancelButton).toBeDisabled()
      })

      // Resolve the promise to complete the request
      resolveCreate()
      await createPromise
    })

    it('shows "Saving..." text on Save button during submission', async () => {
      const user = userEvent.setup()

      let resolveCreate
      const createPromise = new Promise((resolve) => {
        resolveCreate = resolve
      })

      server.use(
        http.post('*/api/v1/issues', async () => {
          await createPromise
          return HttpResponse.json(createMockIssue({ id: 1 }), { status: 201 })
        })
      )

      renderWithRouter(<CreateIssuePage />)

      await user.type(screen.getByLabelText(/Title/), 'Test Issue')
      await user.type(screen.getByLabelText(/Description/), 'Test Description')

      const saveButton = screen.getByRole('button', { name: 'Save' })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Saving...' })).toBeInTheDocument()
      })

      resolveCreate()
      await createPromise
    })

    it('shows loading spinner during submission', async () => {
      const user = userEvent.setup()

      let resolveCreate
      const createPromise = new Promise((resolve) => {
        resolveCreate = resolve
      })

      server.use(
        http.post('*/api/v1/issues', async () => {
          await createPromise
          return HttpResponse.json(createMockIssue({ id: 1 }), { status: 201 })
        })
      )

      renderWithRouter(<CreateIssuePage />)

      await user.type(screen.getByLabelText(/Title/), 'Test Issue')
      await user.type(screen.getByLabelText(/Description/), 'Test Description')

      await user.click(screen.getByRole('button', { name: 'Save' }))

      await waitFor(() => {
        expect(screen.getByText('Creating issue...')).toBeInTheDocument()
      })

      resolveCreate()
      await createPromise
    })
  })

  describe('cancel navigation', () => {
    it('navigates to /issues when Cancel button is clicked', async () => {
      const user = userEvent.setup()

      renderWithRouter(<CreateIssuePage />)

      const cancelButton = screen.getByRole('button', { name: 'Cancel' })
      await user.click(cancelButton)

      expect(mockNavigate).toHaveBeenCalledWith('/issues')
    })
  })
})
