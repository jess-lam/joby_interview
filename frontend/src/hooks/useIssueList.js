import { useState, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import * as issuesService from '../services/issues'

/**
 * Manages:
 * - Issues array
 * - Loading state
 * - Error state
 * - Pagination state
 * - Filter state
 * - URL params synchronization
 * 
 * @returns {Object} Hook return value with state and functions
 */
export const useIssueList = () => {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [pagination, setPagination] = useState({
    page: 1,
    per_page: 20,
    total: 0,
    total_pages: 0
  })
  
  const [filters, setFilters] = useState({
    statusFilter: null,
    sort: 'desc'
  })

  const [searchParams, setSearchParams] = useSearchParams()

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Fetch issues with current filters and pagination
   * @param {Object} options - Override options
   * @param {number} options.page - Page number
   * @param {string} options.statusFilter - Status filter
   * @param {string} options.sort - Sort order
   */
  const fetchIssues = useCallback(async (options = {}) => {
    setLoading(true)
    setError(null)
    
    try {
      const page = options.page !== undefined ? options.page : pagination.page
      const statusFilter = options.statusFilter !== undefined ? options.statusFilter : filters.statusFilter
      const sort = options.sort !== undefined ? options.sort : filters.sort
      
      const params = {
        page,
        statusFilter,
        sort,
      }
      
      const data = await issuesService.getIssues(params)
      
      setIssues(data.items)
      setPagination({
        page: data.page,
        per_page: data.per_page,
        total: data.total,
        total_pages: data.total_pages
      })
      
      if (options.statusFilter !== undefined) {
        setFilters(prev => ({ ...prev, statusFilter: options.statusFilter }))
      }
      if (options.sort !== undefined) {
        setFilters(prev => ({ ...prev, sort: options.sort }))
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch issues'
      setError(errorMessage)
      console.error('Error fetching issues:', err)
    } finally {
      setLoading(false)
    }
  }, [pagination.page, filters.statusFilter, filters.sort])

  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1', 10)
    const statusFilter = searchParams.get('status_filter') || null
    const sort = searchParams.get('sort') || 'desc'
    
    fetchIssues({ page, statusFilter, sort })
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    
    if (pagination.page > 1) {
      params.set('page', pagination.page.toString())
    }
    
    if (filters.statusFilter) {
      params.set('status_filter', filters.statusFilter)
    }
    
    if (filters.sort !== 'desc') {
      params.set('sort', filters.sort)
    }
    
    const newSearch = params.toString()
    const currentSearch = searchParams.toString()
    
    if (newSearch !== currentSearch) {
      setSearchParams(params, { replace: true })
    }
  }, [pagination.page, filters.statusFilter, filters.sort, searchParams, setSearchParams])

  return {
    // State
    issues,
    loading,
    error,
    pagination,
    filters,
    
    // Functions
    fetchIssues,
    clearError,
  }
}
