import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useIssueForm } from '../hooks/useIssueForm'
import IssueForm from '../components/IssueForm'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'
import './CreateIssuePage.css'

const CreateIssuePage = () => {
  const navigate = useNavigate()

  const {
    formValues,
    fieldErrors,
    loading,
    error,
    handleFieldChange,
    handleCreate,
    clearError
  } = useIssueForm()

  const handleSave = async () => {
    try {
      const createdIssue = await handleCreate()
      navigate(`/issues/${createdIssue.id}`)
    } catch (err) {
      console.log('Error saving issue:', err);
    }
  }

  const handleCancel = () => {
    navigate('/issues')
  }

  return (
    <div className="create-issue-page">
      <h1 className="create-issue-page__title">Create Issue</h1>

      <ErrorMessage message={error} onDismiss={clearError} />

      <IssueForm
        values={formValues}
        onChange={handleFieldChange}
        errors={fieldErrors}
        isSubmitting={loading}
      />

      <div className="create-issue-page__actions">
        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="create-issue-page__cancel-btn"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="create-issue-page__save-btn"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>

      {loading && <LoadingSpinner message="Creating issue..." />}
    </div>
  )
}

export default CreateIssuePage
