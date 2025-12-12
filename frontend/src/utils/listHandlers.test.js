import { describe, it, expect, beforeEach, vi } from 'vitest'
import {
  handlePageChange,
  handleStatusFilterChange,
  handleSortChange,
} from './listHandlers'

describe('listHandlers', () => {
  let mockFetchList
  let mockScrollTo

  beforeEach(() => {
    mockFetchList = vi.fn()

    mockScrollTo = vi.fn()
    window.scrollTo = mockScrollTo
  })

  describe('handlePageChange', () => {
    it.each([1, 2, 5, 10])('should request page %s and scroll to top', (pageNumber) => {
      handlePageChange(mockFetchList, pageNumber)
      
      expect(mockFetchList).toHaveBeenCalledTimes(1)
      expect(mockFetchList).toHaveBeenCalledWith({ page: pageNumber })
      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      })
    })
  })

  describe('handleStatusFilterChange', () => {
    it.each([
      ['open', 'open'],
      ['closed', 'closed'],
      ['', ''],
    ])('should request status filter "%s" and reset to page 1', (statusFilter, expectedFilter) => {
      handleStatusFilterChange(mockFetchList, statusFilter)
      
      expect(mockFetchList).toHaveBeenCalledTimes(1)
      expect(mockFetchList).toHaveBeenCalledWith({
        statusFilter: expectedFilter,
        page: 1,
      })
      expect(mockScrollTo).not.toHaveBeenCalled()
    })
  })

  describe('handleSortChange', () => {
    it.each([
      ['asc', 'asc'],
      ['desc', 'desc'],
    ])('should request sort "%s" and reset to page 1', (sort, expectedSort) => {
      handleSortChange(mockFetchList, sort)
      
      expect(mockFetchList).toHaveBeenCalledTimes(1)
      expect(mockFetchList).toHaveBeenCalledWith({
        sort: expectedSort,
        page: 1,
      })
      expect(mockScrollTo).not.toHaveBeenCalled()
    })
  })

  describe('integration scenarios', () => {
    it('should handle multiple filter changes correctly', () => {
      handleStatusFilterChange(mockFetchList, 'open')
      handleStatusFilterChange(mockFetchList, 'closed')
      handleStatusFilterChange(mockFetchList, '')
      
      expect(mockFetchList).toHaveBeenCalledTimes(3)
      expect(mockFetchList).toHaveBeenNthCalledWith(1, {
        statusFilter: 'open',
        page: 1,
      })
      expect(mockFetchList).toHaveBeenNthCalledWith(2, {
        statusFilter: 'closed',
        page: 1,
      })
      expect(mockFetchList).toHaveBeenNthCalledWith(3, {
        statusFilter: '',
        page: 1,
      })
    })

    it('should handle page change after filter change', () => {
      handleStatusFilterChange(mockFetchList, 'open')
      handlePageChange(mockFetchList, 2)
      
      expect(mockFetchList).toHaveBeenCalledTimes(2)
      expect(mockFetchList).toHaveBeenNthCalledWith(1, {
        statusFilter: 'open',
        page: 1,
      })
      expect(mockFetchList).toHaveBeenNthCalledWith(2, {
        page: 2,
      })
    })

    it('should handle filter, sort, and page change sequence', () => {
      handleStatusFilterChange(mockFetchList, 'open')
      handleSortChange(mockFetchList, 'asc')
      handlePageChange(mockFetchList, 3)
      
      expect(mockFetchList).toHaveBeenCalledTimes(3)
      expect(mockFetchList).toHaveBeenNthCalledWith(1, {
        statusFilter: 'open',
        page: 1,
      })
      expect(mockFetchList).toHaveBeenNthCalledWith(2, {
        sort: 'asc',
        page: 1,
      })
      expect(mockFetchList).toHaveBeenNthCalledWith(3, {
        page: 3,
      })
    })
  })
})
