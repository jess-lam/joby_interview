import { useState, useCallback } from 'react'
import * as issuesService from '../services/issues'

/**
 * Manages:
 * - Issue data (single issue object)
 * - Loading state for fetch/delete operations
 * - Error state for API errors
 * 
 * @returns {Object} Hook return value with state and functions
 */
export const useIssueShow = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [issue, setIssue] = useState(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Fetch a single issue by ID
   * 
   * @param {number} id
   * @returns {Promise<Object>}
   * @throws {Error}
   */
  const fetchIssue = useCallback(async (id) => {
    setLoading(true)
    setError(null)

    try {
      const issueData = await issuesService.getIssue(id)
      setIssue(issueData)
      return issueData
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to fetch issue'
      setError(errorMessage)
      setIssue(null)
      console.error('Error fetching issue:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Delete an issue by ID
   * 
   * @param {number} id
   * @returns {Promise<null>}
   * @throws {Error}
   */
  const handleDelete = useCallback(async (id) => {
    setLoading(true)
    setError(null)

    try {
      await issuesService.deleteIssue(id)
      setIssue(null)
      return null
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to delete issue'
      setError(errorMessage)
      console.error('Error deleting issue:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    // State
    issue,
    loading,
    error,
    
    // Functions
    fetchIssue,
    handleDelete,
    clearError,
  }
}
