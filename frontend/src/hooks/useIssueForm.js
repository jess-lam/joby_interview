import { useState, useCallback, useMemo } from 'react'
import * as issuesService from '../services/issues'

/**
 * Manages:
 * - Form field values (title, description, status)
 * - Field-level validation errors (from backend)
 * - Loading state for form operations
 * - Error state for API errors
 *
 * Validation: Backend-only (Pydantic schemas handle all validation)
 * 
 * @param {Object} initialValues - Initial form values (for edit mode)
 * @returns {Object} Hook return value with state and functions
 */
export const useIssueForm = (initialValues = {}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [originalValues, setOriginalValues] = useState({
    title: initialValues.title || '',
    description: initialValues.description || '',
    status: initialValues.status || 'open'
  })
  
  const [formValues, setFormValues] = useState({
    title: initialValues.title || '',
    description: initialValues.description || '',
    status: initialValues.status || 'open'
  })
  
  const [fieldErrors, setFieldErrors] = useState({
    title: null,
    description: null,
    status: null
  })

  const hasChanges = useMemo(() => {
    const titleChanged = formValues.title.trim() !== originalValues.title.trim()
    const descriptionChanged = formValues.description.trim() !== originalValues.description.trim()
    const statusChanged = formValues.status !== originalValues.status
    
    return titleChanged || descriptionChanged || statusChanged
  }, [formValues, originalValues])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearFieldErrors = useCallback(() => {
    setFieldErrors({
      title: null,
      description: null,
      status: null
    })
  }, [])

    /**
   * Handle field value change
   * @param {string} field - Field name ('title', 'description', or 'status')
   * @param {string} value - New field value
   */
    const handleFieldChange = useCallback((field, value) => {
      setFormValues(prev => ({
        ...prev,
        [field]: value
      }))
  
      if (fieldErrors[field]) {
        setFieldErrors(prev => ({
          ...prev,
          [field]: null
        }))
      }
    }, [fieldErrors])

  /**
   * Map backend validation errors to field errors
   * Backend returns 422 errors in Pydantic format:
   * [
   *   {
   *     "loc": ["body", "title"],
   *     "msg": "String should have at least 1 character",
   *     "type": "string_too_short"
   *   }
   * ]
   * 
   * @param {Array} backendErrors - Array of backend validation errors
   */
  const mapBackendErrorsToFields = useCallback((backendErrors) => {
    const errors = {
      title: null,
      description: null,
      status: null
    }

    if (Array.isArray(backendErrors)) {
      backendErrors.forEach(error => {
        const field = error.loc?.[1]
        if (field && Object.prototype.hasOwnProperty.call(errors, field)) {
          errors[field] = error.msg || 'Invalid value'
        }
      })
    }

    setFieldErrors(errors)
  }, [])

  /**
   * Create an issue
   * @returns {Promise<Object>}
   * @throws {Error}
   */
  const handleCreate = useCallback(async () => {
    setError(null)
    clearFieldErrors()

    setLoading(true)

    try {
      const issueData = {
        title: formValues.title.trim(),
        description: formValues.description.trim(),
        status: formValues.status
      }

      const createdIssue = await issuesService.createIssue(issueData)
      
      return createdIssue
    } catch (err) {
      if (err.response?.status === 422) {
        const backendErrors = err.response.data?.detail || []

        mapBackendErrorsToFields(backendErrors)
        
        setError('Please fix the validation errors below')
      } else {
        const errorMessage = err.response?.data?.detail || 'Failed to create issue'
        setError(errorMessage)
      }
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [formValues, clearFieldErrors, mapBackendErrorsToFields])

  /**
   * Update an existing issue
   * 
   * @param {number} id - Issue ID
   * @returns {Promise<Object>}
   * @throws {Error}
   */
  const handleUpdate = useCallback(async (id) => {
    setError(null)
    clearFieldErrors()

    setLoading(true)

    try {
      const issueData = {}
      
      if (formValues.title !== originalValues.title) {
        issueData.title = formValues.title.trim()
      }
      if (formValues.description !== originalValues.description) {
        issueData.description = formValues.description.trim()
      }
      if (formValues.status !== originalValues.status) {
        issueData.status = formValues.status
      }

      if (Object.keys(issueData).length === 0) {
        setLoading(false)
        return null
      }

      const updatedIssue = await issuesService.updateIssue(id, issueData)
      
      return updatedIssue
    } catch (err) {
      if (err.response?.status === 422) {
        const backendErrors = err.response.data?.detail || []

        mapBackendErrorsToFields(backendErrors)
        
        setError('Please fix the validation errors below')
      } else {
        const errorMessage = err.response?.data?.detail || 'Failed to update issue'
        setError(errorMessage)
      }
      
      throw err
    } finally {
      setLoading(false)
    }
  }, [formValues, originalValues, clearFieldErrors, mapBackendErrorsToFields])

  /**
   * Initialize form values from new data
   * Clears all errors and resets form to the provided values
   * Also updates originalValues for change detection
   */
  const initializeFromValues = useCallback((newValues) => {
    if (!newValues) return
    
    const values = {
      title: newValues.title || '',
      description: newValues.description || '',
      status: newValues.status || 'open'
    }
    
    setOriginalValues(values)
    setFormValues(values)
    setFieldErrors({
      title: null,
      description: null,
      status: null
    })
    setError(null)
  }, [])

  return {
    // State
    formValues,
    fieldErrors,
    loading,
    error,
    hasChanges,
    
    // Functions
    handleFieldChange,
    handleCreate,
    handleUpdate,
    clearError,
    initializeFromValues,
  }
}
