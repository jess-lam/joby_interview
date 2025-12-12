import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useIssueForm } from './useIssueForm'
import * as issuesService from '../services/issues'
import { createMockIssue, createValidationError, validationErrors } from '../tests/testData'

vi.mock('../services/issues', () => ({
  createIssue: vi.fn(),
  updateIssue: vi.fn(),
}))

describe('useIssueForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('initializes with default values when no initialValues provided', () => {
      const { result } = renderHook(() => useIssueForm())
      
      expect(result.current.formValues).toEqual({
        title: '',
        description: '',
        status: 'open',
      })
      expect(result.current.fieldErrors).toEqual({
        title: null,
        description: null,
        status: null,
      })
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })

    it('initializes with provided initialValues', () => {
      const initialValues = {
        title: 'Initial Title',
        description: 'Initial Description',
        status: 'closed',
      }
      
      const { result } = renderHook(() => useIssueForm(initialValues))
      
      expect(result.current.formValues).toEqual(initialValues)
      expect(result.current.formValues.status).toBe('closed')
    })

    it('sets originalValues correctly for change detection', async () => {
      const initialValues = {
        title: 'Original Title',
        description: 'Original Description',
        status: 'open',
      }
      
      const { result } = renderHook(() => useIssueForm(initialValues))

      // test that update only sends changed fields
      act(() => {
        result.current.handleFieldChange('title', 'New Title')
      })

      const mockUpdatedIssue = createMockIssue({ id: 1, title: 'New Title' })
      issuesService.updateIssue.mockResolvedValue(mockUpdatedIssue)
      
      await act(async () => {
        await result.current.handleUpdate(1)
      })
      
      expect(issuesService.updateIssue).toHaveBeenCalledWith(1, {
        title: 'New Title',
      })
    })
  })

  describe('field changes', () => {
    it('updates formValues when handleFieldChange is called', () => {
      const { result } = renderHook(() => useIssueForm())
      
      act(() => {
        result.current.handleFieldChange('title', 'New Title')
      })
      
      expect(result.current.formValues.title).toBe('New Title')
    })

    it('clears field error when field is changed', async () => {
      const { result } = renderHook(() => useIssueForm())
      
      // First set an error
      act(() => {
        result.current.handleFieldChange('title', '')
      })
      
      // Simulate validation error
      const errorResponse = {
        response: {
          status: 422,
          data: {
            detail: createValidationError([validationErrors.titleRequired]).detail,
          },
        },
      }
      
      issuesService.createIssue.mockRejectedValueOnce(errorResponse)
      
      await act(async () => {
        try {
          await result.current.handleCreate()
        } catch (err) {
          // Expected to throw
        }
      })
      
      await waitFor(() => {
        expect(result.current.fieldErrors.title).toBeTruthy()
      })
      
      // Now change the field - error should be cleared
      act(() => {
        result.current.handleFieldChange('title', 'New Title')
      })
      
      expect(result.current.fieldErrors.title).toBe(null)
    })

    it('does not clear other field errors when one field changes', async () => {
      const { result } = renderHook(() => useIssueForm())

      const errorResponse = {
        response: {
          status: 422,
          data: {
            detail: createValidationError([
              validationErrors.titleRequired,
              validationErrors.descriptionRequired,
            ]).detail,
          },
        },
      }
      
      issuesService.createIssue.mockRejectedValueOnce(errorResponse)
      
      await act(async () => {
        try {
          await result.current.handleCreate()
        } catch (err) {
          // Expected to throw
        }
      })
      
      await waitFor(() => {
        expect(result.current.fieldErrors.title).toBeTruthy()
        expect(result.current.fieldErrors.description).toBeTruthy()
      })
      
      // Change only title - description error should remain
      act(() => {
        result.current.handleFieldChange('title', 'New Title')
      })
      
      expect(result.current.fieldErrors.title).toBe(null)
      expect(result.current.fieldErrors.description).toBeTruthy()
    })

    it('handles all three fields correctly', () => {
      const { result } = renderHook(() => useIssueForm())
      
      act(() => {
        result.current.handleFieldChange('title', 'Test Title')
        result.current.handleFieldChange('description', 'Test Description')
        result.current.handleFieldChange('status', 'closed')
      })
      
      expect(result.current.formValues.title).toBe('Test Title')
      expect(result.current.formValues.description).toBe('Test Description')
      expect(result.current.formValues.status).toBe('closed')
    })
  })

  describe('create issue', () => {
    it('successfully creates issue and returns created issue', async () => {
      const { result } = renderHook(() => useIssueForm())
      
      act(() => {
        result.current.handleFieldChange('title', 'New Issue')
        result.current.handleFieldChange('description', 'New Description')
      })
      
      const mockCreatedIssue = createMockIssue({
        id: 1,
        title: 'New Issue',
        description: 'New Description',
      })
      issuesService.createIssue.mockResolvedValue(mockCreatedIssue)
      
      let createdIssue
      await act(async () => {
        createdIssue = await result.current.handleCreate()
      })
      
      expect(createdIssue).toEqual(mockCreatedIssue)
      expect(issuesService.createIssue).toHaveBeenCalledWith({
        title: 'New Issue',
        description: 'New Description',
        status: 'open',
      })
    })

    it('sets loading state during create operation', async () => {
      const { result } = renderHook(() => useIssueForm())
      
      act(() => {
        result.current.handleFieldChange('title', 'Test Issue')
        result.current.handleFieldChange('description', 'Test Description')
      })
      
      let resolveCreate
      const createPromise = new Promise((resolve) => {
        resolveCreate = resolve
      })
      issuesService.createIssue.mockReturnValue(createPromise)
      
      act(() => {
        result.current.handleCreate()
      })
      
      expect(result.current.loading).toBe(true)
      
      await act(async () => {
        resolveCreate(createMockIssue({ id: 1 }))
        await createPromise
      })
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('trims title and description before sending', async () => {
      const { result } = renderHook(() => useIssueForm())
      
      act(() => {
        result.current.handleFieldChange('title', '  Trimmed Title  ')
        result.current.handleFieldChange('description', '  Trimmed Description  ')
      })
      
      const mockCreatedIssue = createMockIssue({ id: 1 })
      issuesService.createIssue.mockResolvedValue(mockCreatedIssue)
      
      await act(async () => {
        await result.current.handleCreate()
      })
      
      expect(issuesService.createIssue).toHaveBeenCalledWith({
        title: 'Trimmed Title',
        description: 'Trimmed Description',
        status: 'open',
      })
    })

    it('maps validation errors (422) to field errors', async () => {
      const { result } = renderHook(() => useIssueForm())
      
      act(() => {
        result.current.handleFieldChange('title', '')
        result.current.handleFieldChange('description', '')
      })
      
      const errorResponse = {
        response: {
          status: 422,
          data: {
            detail: createValidationError([
              validationErrors.titleRequired,
              validationErrors.descriptionRequired,
            ]).detail,
          },
        },
      }
      
      issuesService.createIssue.mockRejectedValue(errorResponse)
      
      await act(async () => {
        try {
          await result.current.handleCreate()
        } catch (err) {
          // Expected to throw
        }
      })
      
      expect(result.current.fieldErrors.title).toBeTruthy()
      expect(result.current.fieldErrors.description).toBeTruthy()
      expect(result.current.error).toBe('Please fix the validation errors below')
    })

    it('sets error message for API errors (non-422)', async () => {
      const { result } = renderHook(() => useIssueForm())
      
      act(() => {
        result.current.handleFieldChange('title', 'Test Issue')
        result.current.handleFieldChange('description', 'Test Description')
      })
      
      const errorResponse = {
        response: {
          status: 500,
          data: {
            detail: 'Internal server error',
          },
        },
      }
      
      issuesService.createIssue.mockRejectedValue(errorResponse)
      
      await act(async () => {
        try {
          await result.current.handleCreate()
        } catch (err) {
          // Expected to throw
        }
      })
      
      expect(result.current.error).toBe('Internal server error')
      expect(result.current.fieldErrors.title).toBe(null)
      expect(result.current.fieldErrors.description).toBe(null)
    })
  })

  describe('update issue', () => {
    it('successfully updates issue and returns updated issue', async () => {
      const initialValues = {
        title: 'Original Title',
        description: 'Original Description',
        status: 'open',
      }
      
      const { result } = renderHook(() => useIssueForm(initialValues))
      
      act(() => {
        result.current.handleFieldChange('title', 'Updated Title')
      })
      
      const mockUpdatedIssue = createMockIssue({
        id: 1,
        title: 'Updated Title',
      })
      issuesService.updateIssue.mockResolvedValue(mockUpdatedIssue)
      
      let updatedIssue
      await act(async () => {
        updatedIssue = await result.current.handleUpdate(1)
      })
      
      expect(updatedIssue).toEqual(mockUpdatedIssue)
      expect(issuesService.updateIssue).toHaveBeenCalledWith(1, {
        title: 'Updated Title',
      })
    })

    it('only sends changed fields', async () => {
      const initialValues = {
        title: 'Original Title',
        description: 'Original Description',
        status: 'open',
      }
      
      const { result } = renderHook(() => useIssueForm(initialValues))
      
      act(() => {
        result.current.handleFieldChange('title', 'Updated Title')
        result.current.handleFieldChange('status', 'closed')
      })
      
      const mockUpdatedIssue = createMockIssue({ id: 1 })
      issuesService.updateIssue.mockResolvedValue(mockUpdatedIssue)
      
      await act(async () => {
        await result.current.handleUpdate(1)
      })
      
      expect(issuesService.updateIssue).toHaveBeenCalledWith(1, {
        title: 'Updated Title',
        status: 'closed',
      })
      expect(issuesService.updateIssue).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ description: expect.anything() })
      )
    })

    it('returns null when no fields have changed', async () => {
      const initialValues = {
        title: 'Original Title',
        description: 'Original Description',
        status: 'open',
      }
      
      const { result } = renderHook(() => useIssueForm(initialValues))
      
      // Don't change any fields
      const resultValue = await act(async () => {
        return await result.current.handleUpdate(1)
      })
      
      expect(resultValue).toBe(null)
      expect(issuesService.updateIssue).not.toHaveBeenCalled()
    })

    it('sets loading state during update operation', async () => {
      const initialValues = {
        title: 'Original Title',
        description: 'Original Description',
        status: 'open',
      }
      
      const { result } = renderHook(() => useIssueForm(initialValues))
      
      act(() => {
        result.current.handleFieldChange('title', 'Updated Title')
      })
      
      let resolveUpdate
      const updatePromise = new Promise((resolve) => {
        resolveUpdate = resolve
      })
      issuesService.updateIssue.mockReturnValue(updatePromise)
      
      act(() => {
        result.current.handleUpdate(1)
      })
      
      expect(result.current.loading).toBe(true)
      
      await act(async () => {
        resolveUpdate(createMockIssue({ id: 1 }))
        await updatePromise
      })
      
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('trims title and description before sending', async () => {
      const initialValues = {
        title: 'Original Title',
        description: 'Original Description',
        status: 'open',
      }
      
      const { result } = renderHook(() => useIssueForm(initialValues))
      
      act(() => {
        result.current.handleFieldChange('title', '  Trimmed Title  ')
        result.current.handleFieldChange('description', '  Trimmed Description  ')
      })
      
      const mockUpdatedIssue = createMockIssue({ id: 1 })
      issuesService.updateIssue.mockResolvedValue(mockUpdatedIssue)
      
      await act(async () => {
        await result.current.handleUpdate(1)
      })
      
      expect(issuesService.updateIssue).toHaveBeenCalledWith(1, {
        title: 'Trimmed Title',
        description: 'Trimmed Description',
      })
    })

    it('maps validation errors (422) to field errors', async () => {
      const initialValues = {
        title: 'Original Title',
        description: 'Original Description',
        status: 'open',
      }
      
      const { result } = renderHook(() => useIssueForm(initialValues))
      
      act(() => {
        result.current.handleFieldChange('title', '')
      })
      
      const errorResponse = {
        response: {
          status: 422,
          data: {
            detail: createValidationError([validationErrors.titleRequired]).detail,
          },
        },
      }
      
      issuesService.updateIssue.mockRejectedValue(errorResponse)
      
      await act(async () => {
        try {
          await result.current.handleUpdate(1)
        } catch (err) {
          // Expected to throw
        }
      })
      
      expect(result.current.fieldErrors.title).toBeTruthy()
      expect(result.current.error).toBe('Please fix the validation errors below')
    })

    it('sets error message for API errors (non-422)', async () => {
      const initialValues = {
        title: 'Original Title',
        description: 'Original Description',
        status: 'open',
      }
      
      const { result } = renderHook(() => useIssueForm(initialValues))
      
      act(() => {
        result.current.handleFieldChange('title', 'Updated Title')
      })
      
      const errorResponse = {
        response: {
          status: 404,
          data: {
            detail: 'Issue not found',
          },
        },
      }
      
      issuesService.updateIssue.mockRejectedValue(errorResponse)
      
      await act(async () => {
        try {
          await result.current.handleUpdate(1)
        } catch (err) {
          // Expected to throw
        }
      })
      
      expect(result.current.error).toBe('Issue not found')
      expect(result.current.fieldErrors.title).toBe(null)
    })
  })

  describe('error handling', () => {
    it('clearError clears the error state', async () => {
      const { result } = renderHook(() => useIssueForm())
      
      // Set an error first
      act(() => {
        result.current.handleFieldChange('title', 'Test')
        result.current.handleFieldChange('description', 'Test Description')
      })
      
      const errorResponse = {
        response: {
          status: 500,
          data: {
            detail: 'Server error',
          },
        },
      }
      
      issuesService.createIssue.mockRejectedValueOnce(errorResponse)
      
      await act(async () => {
        try {
          await result.current.handleCreate()
        } catch (err) {
          // Expected
        }
      })
      
      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })
      
      act(() => {
        result.current.clearError()
      })
      
      expect(result.current.error).toBe(null)
    })

    it('clearFieldErrors is called internally when creating/updating', async () => {
      const { result } = renderHook(() => useIssueForm())
      
      // Set field errors first
      const errorResponse = {
        response: {
          status: 422,
          data: {
            detail: createValidationError([
              validationErrors.titleRequired,
              validationErrors.descriptionRequired,
            ]).detail,
          },
        },
      }
      
      issuesService.createIssue.mockRejectedValueOnce(errorResponse)
      
      await act(async () => {
        try {
          await result.current.handleCreate()
        } catch (err) {
          // Expected
        }
      })
      
      await waitFor(() => {
        expect(result.current.fieldErrors.title).toBeTruthy()
        expect(result.current.fieldErrors.description).toBeTruthy()
      })

      const successResponse = createMockIssue({ id: 1 })
      issuesService.createIssue.mockResolvedValueOnce(successResponse)
      
      act(() => {
        result.current.handleFieldChange('title', 'Valid Title')
        result.current.handleFieldChange('description', 'Valid Description')
      })
      
      await act(async () => {
        await result.current.handleCreate()
      })

      expect(result.current.fieldErrors.title).toBe(null)
      expect(result.current.fieldErrors.description).toBe(null)
      expect(result.current.fieldErrors.status).toBe(null)
    })

    it('error mapping correctly maps backend errors to field errors', async () => {
      const { result } = renderHook(() => useIssueForm())
      
      act(() => {
        result.current.handleFieldChange('title', '')
        result.current.handleFieldChange('description', '')
        result.current.handleFieldChange('status', 'invalid')
      })
      
      const errorResponse = {
        response: {
          status: 422,
          data: {
            detail: createValidationError([
              validationErrors.titleRequired,
              validationErrors.descriptionRequired,
              validationErrors.invalidStatus,
            ]).detail,
          },
        },
      }
      
      issuesService.createIssue.mockRejectedValue(errorResponse)
      
      await act(async () => {
        try {
          await result.current.handleCreate()
        } catch (err) {
          // Expected to throw
        }
      })
      
      expect(result.current.fieldErrors.title).toBeTruthy()
      expect(result.current.fieldErrors.description).toBeTruthy()
      expect(result.current.fieldErrors.status).toBeTruthy()
    })
  })

  describe('initializeFromValues', () => {
    it('initializes form values from provided values', () => {
      const { result } = renderHook(() => useIssueForm())
      
      const newValues = {
        title: 'New Title',
        description: 'New Description',
        status: 'closed',
      }
      
      act(() => {
        result.current.initializeFromValues(newValues)
      })
      
      expect(result.current.formValues).toEqual(newValues)
    })

    it('clears errors when initializing', async () => {
      const { result } = renderHook(() => useIssueForm())
      
      // Set errors first
      act(() => {
        result.current.handleFieldChange('title', '')
        result.current.handleFieldChange('description', '')
      })
      
      const errorResponse = {
        response: {
          status: 422,
          data: {
            detail: createValidationError([validationErrors.titleRequired]).detail,
          },
        },
      }
      
      issuesService.createIssue.mockRejectedValueOnce(errorResponse)
      
      await act(async () => {
        try {
          await result.current.handleCreate()
        } catch (err) {
          // Expected
        }
      })
      
      await waitFor(() => {
        expect(result.current.fieldErrors.title).toBeTruthy()
        expect(result.current.error).toBeTruthy()
      })
      
      const newValues = {
        title: 'New Title',
        description: 'New Description',
        status: 'open',
      }
      
      act(() => {
        result.current.initializeFromValues(newValues)
      })
      
      expect(result.current.fieldErrors.title).toBe(null)
      expect(result.current.fieldErrors.description).toBe(null)
      expect(result.current.fieldErrors.status).toBe(null)
      expect(result.current.error).toBe(null)
    })
  })
})
