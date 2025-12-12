import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useIssueShow } from './useIssueShow'
import * as issuesService from '../services/issues'
import { createMockIssue } from '../tests/testData'

vi.mock('../services/issues', () => ({
  getIssue: vi.fn(),
  deleteIssue: vi.fn(),
}))

describe('useIssueShow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('initializes with default state values', () => {
      const { result } = renderHook(() => useIssueShow())

      expect(result.current.issue).toBe(null)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(null)
    })
  })

  describe('fetching issue', () => {
    it('successfully fetches issue and sets issue state', async () => {
      const mockIssue = createMockIssue({
        id: 1,
        title: 'Test Issue',
        description: 'Test Description',
      })
      issuesService.getIssue.mockResolvedValue(mockIssue)

      const { result } = renderHook(() => useIssueShow())

      await act(async () => {
        await result.current.fetchIssue(1)
      })

      expect(result.current.issue).toEqual(mockIssue)
      expect(issuesService.getIssue).toHaveBeenCalledWith(1)
    })

    it('returns the fetched issue', async () => {
      const mockIssue = createMockIssue({ id: 1 })
      issuesService.getIssue.mockResolvedValue(mockIssue)

      const { result } = renderHook(() => useIssueShow())

      let fetchedIssue
      await act(async () => {
        fetchedIssue = await result.current.fetchIssue(1)
      })

      expect(fetchedIssue).toEqual(mockIssue)
    })

    it('sets loading state during fetch', async () => {
      const mockIssue = createMockIssue({ id: 1 })

      let resolveFetch
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve
      })
      issuesService.getIssue.mockReturnValue(fetchPromise)

      const { result } = renderHook(() => useIssueShow())

      act(() => {
        result.current.fetchIssue(1)
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(true)
      })

      await act(async () => {
        resolveFetch(mockIssue)
        await fetchPromise
      })
    })

    it('sets loading to false after fetch completes', async () => {
      const mockIssue = createMockIssue({ id: 1 })
      issuesService.getIssue.mockResolvedValue(mockIssue)

      const { result } = renderHook(() => useIssueShow())

      await act(async () => {
        await result.current.fetchIssue(1)
      })

      expect(result.current.loading).toBe(false)
      expect(result.current.issue).toEqual(mockIssue)
    })
  })

  describe('loading state', () => {
    it('sets loading to true during fetch', async () => {
      const mockIssue = createMockIssue({ id: 1 })

      let resolveFetch
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve
      })
      issuesService.getIssue.mockReturnValue(fetchPromise)

      const { result } = renderHook(() => useIssueShow())

      act(() => {
        result.current.fetchIssue(1)
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(true)
      })

      await act(async () => {
        resolveFetch(mockIssue)
        await fetchPromise
      })
    })

    it('sets loading to false after fetch completes', async () => {
      const mockIssue = createMockIssue({ id: 1 })
      issuesService.getIssue.mockResolvedValue(mockIssue)

      const { result } = renderHook(() => useIssueShow())

      await act(async () => {
        await result.current.fetchIssue(1)
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })
  })

  describe('error state', () => {
    it('sets error state when fetch fails', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: {
            detail: 'Internal server error',
          },
        },
      }
      issuesService.getIssue.mockRejectedValue(errorResponse)

      const { result } = renderHook(() => useIssueShow())

      await act(async () => {
        try {
          await result.current.fetchIssue(1)
        } catch (err) {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('Internal server error')
      expect(result.current.loading).toBe(false)
    })

    it('sets issue to null when fetch fails', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: {
            detail: 'Server error',
          },
        },
      }
      issuesService.getIssue.mockRejectedValue(errorResponse)

      const { result } = renderHook(() => useIssueShow())

      await act(async () => {
        try {
          await result.current.fetchIssue(1)
        } catch (err) {
          // Expected to throw
        }
      })

      expect(result.current.issue).toBe(null)
      expect(result.current.error).toBeTruthy()
    })

    it('uses error message from API response', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: {
            detail: 'Custom error message',
          },
        },
      }
      issuesService.getIssue.mockRejectedValue(errorResponse)

      const { result } = renderHook(() => useIssueShow())

      await act(async () => {
        try {
          await result.current.fetchIssue(1)
        } catch (err) {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('Custom error message')
    })

    it('uses default error message when API error has no detail', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: {},
        },
      }
      issuesService.getIssue.mockRejectedValue(errorResponse)

      const { result } = renderHook(() => useIssueShow())

      await act(async () => {
        try {
          await result.current.fetchIssue(1)
        } catch (err) {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('Failed to fetch issue')
    })

    it('throws error when fetch fails', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: {
            detail: 'Server error',
          },
        },
      }
      issuesService.getIssue.mockRejectedValue(errorResponse)

      const { result } = renderHook(() => useIssueShow())

      await expect(
        act(async () => {
          await result.current.fetchIssue(1)
        })
      ).rejects.toThrow()
    })
  })

  describe('404 handling', () => {
    it('handles 404 error correctly', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: {
            detail: 'Issue with id 1 not found',
          },
        },
      }
      issuesService.getIssue.mockRejectedValue(errorResponse)

      const { result } = renderHook(() => useIssueShow())

      await act(async () => {
        try {
          await result.current.fetchIssue(1)
        } catch (err) {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('Issue with id 1 not found')
      expect(result.current.issue).toBe(null)
      expect(result.current.loading).toBe(false)
    })

    it('throws error for 404', async () => {
      const errorResponse = {
        response: {
          status: 404,
          data: {
            detail: 'Issue not found',
          },
        },
      }
      issuesService.getIssue.mockRejectedValue(errorResponse)

      const { result } = renderHook(() => useIssueShow())

      await expect(
        act(async () => {
          await result.current.fetchIssue(1)
        })
      ).rejects.toThrow()
    })
  })

  describe('error clearing', () => {
    it('clearError clears the error state', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: {
            detail: 'Server error',
          },
        },
      }
      issuesService.getIssue.mockRejectedValue(errorResponse)

      const { result } = renderHook(() => useIssueShow())

      await act(async () => {
        try {
          await result.current.fetchIssue(1)
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
  })

  describe('delete functionality', () => {
    it('successfully deletes issue and sets issue to null', async () => {
      const mockIssue = createMockIssue({ id: 1 })
      issuesService.getIssue.mockResolvedValue(mockIssue)
      issuesService.deleteIssue.mockResolvedValue(null)

      const { result } = renderHook(() => useIssueShow())

      await act(async () => {
        await result.current.fetchIssue(1)
      })

      expect(result.current.issue).toEqual(mockIssue)

      await act(async () => {
        await result.current.handleDelete(1)
      })

      expect(result.current.issue).toBe(null)
      expect(issuesService.deleteIssue).toHaveBeenCalledWith(1)
    })

    it('returns null on successful delete', async () => {
      const mockIssue = createMockIssue({ id: 1 })
      issuesService.getIssue.mockResolvedValue(mockIssue)
      issuesService.deleteIssue.mockResolvedValue(null)

      const { result } = renderHook(() => useIssueShow())

      await act(async () => {
        await result.current.fetchIssue(1)
      })

      let deleteResult
      await act(async () => {
        deleteResult = await result.current.handleDelete(1)
      })

      expect(deleteResult).toBe(null)
    })

    it('sets loading state during delete', async () => {
      const mockIssue = createMockIssue({ id: 1 })
      issuesService.getIssue.mockResolvedValue(mockIssue)

      let resolveDelete
      const deletePromise = new Promise((resolve) => {
        resolveDelete = resolve
      })
      issuesService.deleteIssue.mockReturnValue(deletePromise)

      const { result } = renderHook(() => useIssueShow())

      await act(async () => {
        await result.current.fetchIssue(1)
      })

      act(() => {
        result.current.handleDelete(1)
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(true)
      })

      await act(async () => {
        resolveDelete(null)
        await deletePromise
      })
    })

    it('sets loading to false after delete completes', async () => {
      const mockIssue = createMockIssue({ id: 1 })
      issuesService.getIssue.mockResolvedValue(mockIssue)
      issuesService.deleteIssue.mockResolvedValue(null)

      const { result } = renderHook(() => useIssueShow())

      await act(async () => {
        await result.current.fetchIssue(1)
      })

      await act(async () => {
        await result.current.handleDelete(1)
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('sets error state when delete fails', async () => {
      const mockIssue = createMockIssue({ id: 1 })
      issuesService.getIssue.mockResolvedValue(mockIssue)

      const errorResponse = {
        response: {
          status: 500,
          data: {
            detail: 'Failed to delete issue',
          },
        },
      }
      issuesService.deleteIssue.mockRejectedValue(errorResponse)

      const { result } = renderHook(() => useIssueShow())

      await act(async () => {
        await result.current.fetchIssue(1)
      })

      await act(async () => {
        try {
          await result.current.handleDelete(1)
        } catch (err) {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('Failed to delete issue')
      expect(result.current.loading).toBe(false)
    })

    it('keeps issue when delete fails', async () => {
      const mockIssue = createMockIssue({ id: 1 })
      issuesService.getIssue.mockResolvedValue(mockIssue)

      const errorResponse = {
        response: {
          status: 500,
          data: {
            detail: 'Delete error',
          },
        },
      }
      issuesService.deleteIssue.mockRejectedValue(errorResponse)

      const { result } = renderHook(() => useIssueShow())

      await act(async () => {
        await result.current.fetchIssue(1)
      })

      expect(result.current.issue).toEqual(mockIssue)

      await act(async () => {
        try {
          await result.current.handleDelete(1)
        } catch (err) {
          // Expected to throw
        }
      })

      // Issue should remain after delete error
      expect(result.current.issue).toEqual(mockIssue)
    })

    it('throws error when delete fails', async () => {
      const mockIssue = createMockIssue({ id: 1 })
      issuesService.getIssue.mockResolvedValue(mockIssue)

      const errorResponse = {
        response: {
          status: 500,
          data: {
            detail: 'Delete error',
          },
        },
      }
      issuesService.deleteIssue.mockRejectedValue(errorResponse)

      const { result } = renderHook(() => useIssueShow())

      await act(async () => {
        await result.current.fetchIssue(1)
      })

      await expect(
        act(async () => {
          await result.current.handleDelete(1)
        })
      ).rejects.toThrow()
    })

    it('uses default error message when delete error has no detail', async () => {
      const mockIssue = createMockIssue({ id: 1 })
      issuesService.getIssue.mockResolvedValue(mockIssue)

      const errorResponse = {
        response: {
          status: 500,
          data: {},
        },
      }
      issuesService.deleteIssue.mockRejectedValue(errorResponse)

      const { result } = renderHook(() => useIssueShow())

      await act(async () => {
        await result.current.fetchIssue(1)
      })

      await act(async () => {
        try {
          await result.current.handleDelete(1)
        } catch (err) {
          // Expected to throw
        }
      })

      expect(result.current.error).toBe('Failed to delete issue')
    })
  })
})
