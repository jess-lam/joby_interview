import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useIssueList } from './useIssueList'
import * as issuesService from '../services/issues'
import { createMockIssues, createPaginatedResponse } from '../tests/testData'

vi.mock('../services/issues', () => ({
  getIssues: vi.fn(),
}))

const mockSetSearchParams = vi.fn()
let mockSearchParams

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useSearchParams: () => {
      if (!mockSearchParams) {
        mockSearchParams = new URLSearchParams()
      }
      return [mockSearchParams, mockSetSearchParams]
    },
  }
})

describe('useIssueList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearchParams = new URLSearchParams()
    mockSearchParams.toString = vi.fn(() => '')
    mockSearchParams.get = vi.fn(() => null)
    mockSetSearchParams.mockClear()
  })

  describe('initialization', () => {
    it('initializes with default state values', async () => {
      const mockIssues = createMockIssues(5)
      const mockResponse = createPaginatedResponse(mockIssues, {
        page: 1,
        perPage: 20,
        total: 5,
      })
      issuesService.getIssues.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useIssueList())

      // Initial state before fetch completes
      expect(result.current.issues).toEqual([])
      expect(result.current.error).toBe(null)
      expect(result.current.pagination).toEqual({
        page: 1,
        per_page: 20,
        total: 0,
        total_pages: 0,
      })
      expect(result.current.filters).toEqual({
        statusFilter: '',
        sort: 'desc',
      })

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('fetches issues on mount with default params when no URL params', async () => {
      const mockIssues = createMockIssues(5)
      const mockResponse = createPaginatedResponse(mockIssues, {
        page: 1,
        perPage: 20,
        total: 5,
      })
      issuesService.getIssues.mockResolvedValue(mockResponse)

      renderHook(() => useIssueList())

      await waitFor(() => {
        expect(issuesService.getIssues).toHaveBeenCalledWith({
          page: 1,
          statusFilter: '',
          sort: 'desc',
        })
      })
    })

    it('fetches issues on mount with page from URL params', async () => {
      mockSearchParams.get = vi.fn((key) => {
        if (key === 'page') return '2'
        if (key === 'status_filter') return ''
        if (key === 'sort') return 'desc'
        return null
      })

      const mockIssues = createMockIssues(5)
      const mockResponse = createPaginatedResponse(mockIssues, {
        page: 2,
        perPage: 20,
        total: 5,
      })
      issuesService.getIssues.mockResolvedValue(mockResponse)

      renderHook(() => useIssueList())

      await waitFor(() => {
        expect(issuesService.getIssues).toHaveBeenCalledWith({
          page: 2,
          statusFilter: '',
          sort: 'desc',
        })
      })
    })

    it('fetches issues on mount with statusFilter from URL params', async () => {
      mockSearchParams.get = vi.fn((key) => {
        if (key === 'page') return '1'
        if (key === 'status_filter') return 'open'
        if (key === 'sort') return 'desc'
        return null
      })

      const mockIssues = createMockIssues(3)
      const mockResponse = createPaginatedResponse(mockIssues, {
        page: 1,
        perPage: 20,
        total: 3,
      })
      issuesService.getIssues.mockResolvedValue(mockResponse)

      renderHook(() => useIssueList())

      await waitFor(() => {
        expect(issuesService.getIssues).toHaveBeenCalledWith({
          page: 1,
          statusFilter: 'open',
          sort: 'desc',
        })
      })
    })

    it('fetches issues on mount with sort from URL params', async () => {
      mockSearchParams.get = vi.fn((key) => {
        if (key === 'page') return '1'
        if (key === 'status_filter') return ''
        if (key === 'sort') return 'asc'
        return null
      })

      const mockIssues = createMockIssues(5)
      const mockResponse = createPaginatedResponse(mockIssues, {
        page: 1,
        perPage: 20,
        total: 5,
      })
      issuesService.getIssues.mockResolvedValue(mockResponse)

      renderHook(() => useIssueList())

      await waitFor(() => {
        expect(issuesService.getIssues).toHaveBeenCalledWith({
          page: 1,
          statusFilter: '',
          sort: 'asc',
        })
      })
    })
  })

  describe('loading state', () => {
    it('sets loading to true during fetch', async () => {
      const mockIssues = createMockIssues(5)
      const mockResponse = createPaginatedResponse(mockIssues)

      let resolveFetch
      const fetchPromise = new Promise((resolve) => {
        resolveFetch = resolve
      })
      issuesService.getIssues.mockReturnValue(fetchPromise)

      const { result } = renderHook(() => useIssueList())

      await waitFor(() => {
        expect(result.current.loading).toBe(true)
      })

      await act(async () => {
        resolveFetch(mockResponse)
        await fetchPromise
      })
    })

    it('sets loading to false after fetch completes', async () => {
      const mockIssues = createMockIssues(5)
      const mockResponse = createPaginatedResponse(mockIssues)
      issuesService.getIssues.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useIssueList())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
        expect(result.current.issues).toHaveLength(5)
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
      issuesService.getIssues.mockRejectedValue(errorResponse)

      const { result } = renderHook(() => useIssueList())

      await waitFor(() => {
        expect(result.current.error).toBe('Internal server error')
        expect(result.current.loading).toBe(false)
      })
    })

    it('clearError clears the error state', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: {
            detail: 'Server error',
          },
        },
      }
      issuesService.getIssues.mockRejectedValue(errorResponse)

      const { result } = renderHook(() => useIssueList())

      await waitFor(() => {
        expect(result.current.error).toBeTruthy()
      })

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBe(null)
    })

    it('uses default error message when API error has no detail', async () => {
      const errorResponse = {
        response: {
          status: 500,
          data: {},
        },
      }
      issuesService.getIssues.mockRejectedValue(errorResponse)

      const { result } = renderHook(() => useIssueList())

      await waitFor(() => {
        expect(result.current.error).toBe('Failed to fetch issues')
      })
    })
  })

  describe('filter changes', () => {
    it('updates statusFilter and refetches when fetchIssues called with statusFilter', async () => {
      const mockIssues = createMockIssues(5)
      const mockResponse = createPaginatedResponse(mockIssues)
      issuesService.getIssues.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useIssueList())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Clear previous calls
      vi.clearAllMocks()

      const filteredIssues = createMockIssues(3)
      const filteredResponse = createPaginatedResponse(filteredIssues, {
        page: 1,
        total: 3,
      })
      issuesService.getIssues.mockResolvedValue(filteredResponse)

      await act(async () => {
        await result.current.fetchIssues({ statusFilter: 'open' })
      })

      expect(result.current.filters.statusFilter).toBe('open')
      expect(issuesService.getIssues).toHaveBeenLastCalledWith({
        page: 1,
        statusFilter: 'open',
        sort: 'desc',
      })
    })

    it('updates sort and refetches when fetchIssues called with sort', async () => {
      const mockIssues = createMockIssues(5)
      const mockResponse = createPaginatedResponse(mockIssues)
      issuesService.getIssues.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useIssueList())

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const sortedResponse = createPaginatedResponse(mockIssues, {
        page: 1,
        total: 5,
      })
      issuesService.getIssues.mockResolvedValue(sortedResponse)

      await act(async () => {
        await result.current.fetchIssues({ sort: 'asc' })
      })

      expect(result.current.filters.sort).toBe('asc')
      expect(issuesService.getIssues).toHaveBeenLastCalledWith({
        page: 1,
        statusFilter: '',
        sort: 'asc',
      })
    })

    it('updates filters state correctly', async () => {
      const mockIssues = createMockIssues(5)
      const mockResponse = createPaginatedResponse(mockIssues)
      issuesService.getIssues.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useIssueList())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const filteredResponse = createPaginatedResponse(mockIssues, {
        page: 1,
        total: 5,
      })
      issuesService.getIssues.mockResolvedValue(filteredResponse)

      await act(async () => {
        await result.current.fetchIssues({ statusFilter: 'closed', sort: 'asc' })
      })

      expect(result.current.filters.statusFilter).toBe('closed')
      expect(result.current.filters.sort).toBe('asc')
    })
  })

  describe('pagination', () => {
    it('updates page and refetches when fetchIssues called with page', async () => {
      const mockIssues = createMockIssues(5)
      const mockResponse = createPaginatedResponse(mockIssues, {
        page: 1,
        total: 25,
      })
      issuesService.getIssues.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useIssueList())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Clear previous calls
      vi.clearAllMocks()

      const page2Issues = createMockIssues(5)
      const page2Response = createPaginatedResponse(page2Issues, {
        page: 2,
        perPage: 20,
        total: 25,
      })
      issuesService.getIssues.mockResolvedValue(page2Response)

      await act(async () => {
        await result.current.fetchIssues({ page: 2 })
      })

      expect(result.current.pagination.page).toBe(2)
      expect(issuesService.getIssues).toHaveBeenLastCalledWith({
        page: 2,
        statusFilter: '',
        sort: 'desc',
      })
    })

    it('updates pagination state from API response', async () => {
      const mockIssues = createMockIssues(5)
      const mockResponse = createPaginatedResponse(mockIssues, {
        page: 2,
        perPage: 20,
        total: 45,
      })
      issuesService.getIssues.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useIssueList())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await act(async () => {
        await result.current.fetchIssues({ page: 2 })
      })

      expect(result.current.pagination).toEqual({
        page: 2,
        per_page: 20,
        total: 45,
        total_pages: 3,
      })
    })

    it('uses current page when page option not provided', async () => {
      const mockIssues = createMockIssues(5)
      const mockResponse = createPaginatedResponse(mockIssues, {
        page: 1,
        total: 5,
      })
      issuesService.getIssues.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useIssueList())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Change page first
      const page2Response = createPaginatedResponse(mockIssues, {
        page: 2,
        total: 25,
      })
      issuesService.getIssues.mockResolvedValue(page2Response)

      await act(async () => {
        await result.current.fetchIssues({ page: 2 })
      })

      // Clear previous calls
      vi.clearAllMocks()

      const samePageResponse = createPaginatedResponse(mockIssues, {
        page: 2,
        total: 25,
      })
      issuesService.getIssues.mockResolvedValue(samePageResponse)

      await act(async () => {
        await result.current.fetchIssues({ statusFilter: 'open' })
      })

      expect(issuesService.getIssues).toHaveBeenLastCalledWith({
        page: 2,
        statusFilter: 'open',
        sort: 'desc',
      })
    })
  })

  describe('URL synchronization', () => {
    it('updates URL params when pagination changes', async () => {
      const mockIssues = createMockIssues(5)
      const mockResponse = createPaginatedResponse(mockIssues, {
        page: 1,
        total: 25,
      })
      issuesService.getIssues.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useIssueList())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Clear previous calls
      mockSetSearchParams.mockClear()

      const page2Response = createPaginatedResponse(mockIssues, {
        page: 2,
        total: 25,
      })
      issuesService.getIssues.mockResolvedValue(page2Response)

      await act(async () => {
        await result.current.fetchIssues({ page: 2 })
      })

      await waitFor(() => {
        expect(mockSetSearchParams).toHaveBeenCalled()
        const callArgs = mockSetSearchParams.mock.calls[0]
        const urlParams = callArgs[0]
        expect(urlParams.get('page')).toBe('2')
        expect(urlParams.get('status_filter')).toBeNull()
        expect(urlParams.get('sort')).toBeNull()
      })
    })

    it('updates URL params when filters change', async () => {
      const mockIssues = createMockIssues(5)
      const mockResponse = createPaginatedResponse(mockIssues)
      issuesService.getIssues.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useIssueList())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Clear previous calls
      mockSetSearchParams.mockClear()

      const filteredResponse = createPaginatedResponse(mockIssues, {
        page: 1,
        total: 5,
      })
      issuesService.getIssues.mockResolvedValue(filteredResponse)

      await act(async () => {
        await result.current.fetchIssues({ statusFilter: 'open', sort: 'asc' })
      })

      await waitFor(() => {
        expect(mockSetSearchParams).toHaveBeenCalled()
        const callArgs = mockSetSearchParams.mock.calls[0]
        const urlParams = callArgs[0]
        expect(urlParams.get('status_filter')).toBe('open')
        expect(urlParams.get('sort')).toBe('asc')
      })
    })

    it('does not update URL for default values', async () => {
      const mockIssues = createMockIssues(5)
      const mockResponse = createPaginatedResponse(mockIssues, {
        page: 1,
        total: 5,
      })
      issuesService.getIssues.mockResolvedValue(mockResponse)

      renderHook(() => useIssueList())

      await waitFor(() => {
        expect(issuesService.getIssues).toHaveBeenCalled()
      })

      // After initial fetch with defaults, URL should not have page=1 or sort=desc
      await waitFor(() => {
        if (mockSetSearchParams.mock.calls.length > 0) {
          const callArgs = mockSetSearchParams.mock.calls[0]
          const urlParams = callArgs[0]
          expect(urlParams.get('page')).not.toBe('1')
          expect(urlParams.get('sort')).not.toBe('desc')
        }
      })
    })

    it('replaces URL params instead of pushing to history', async () => {
      const mockIssues = createMockIssues(5)
      const mockResponse = createPaginatedResponse(mockIssues)
      issuesService.getIssues.mockResolvedValue(mockResponse)

      const { result } = renderHook(() => useIssueList())

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const filteredResponse = createPaginatedResponse(mockIssues, {
        page: 1,
        total: 5,
      })
      issuesService.getIssues.mockResolvedValue(filteredResponse)

      await act(async () => {
        await result.current.fetchIssues({ statusFilter: 'open' })
      })

      await waitFor(() => {
        expect(mockSetSearchParams).toHaveBeenLastCalledWith(
          expect.any(URLSearchParams),
          { replace: true }
        )
      })
    })
  })
})
