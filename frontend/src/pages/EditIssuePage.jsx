import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useIssueShow } from '../hooks/useIssueShow'
import { useIssueForm } from '../hooks/useIssueForm'
import IssueForm from '../components/IssueForm'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'
import './EditIssuePage.css'

const EditIssuePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const {
    issue,
    loading: fetching,
    error: fetchError,
    fetchIssue,
    clearError: clearFetchError
  } = useIssueShow()

  const {
    formValues,
    fieldErrors,
    loading: submitting,
    error: submitError,
    hasChanges,
    handleFieldChange,
    handleUpdate,
    initializeFromValues,
    clearError: clearSubmitError
  } = useIssueForm({})

  useEffect(() => {
    if (id) {
      fetchIssue(parseInt(id, 10))
    }
  }, [id, fetchIssue])

  useEffect(() => {
    if (issue) {
      initializeFromValues(issue)
    }
  }, [issue, initializeFromValues])

  const handleSave = async () => {
    if (!issue) return

    try {
      const updatedIssue = await handleUpdate(issue.id)
      if (updatedIssue) {
        navigate(`/issues/${id}`)
      }
    } catch (err) {
      console.log('Error saving issue:', err);
    }
  }

  const handleCancel = () => {
    navigate(`/issues/${id}`)
  }

  if (fetching && !issue) {
    return (
      <div className="edit-issue-page">
        <LoadingSpinner message="Loading issue..." />
      </div>
    )
  }

  if (fetchError && !issue) {
    return (
      <div className="edit-issue-page">
        <h1 className="edit-issue-page__title">Edit Issue #{id}</h1>
        <ErrorMessage message={fetchError} onDismiss={clearFetchError} />
        <button
          type="button"
          onClick={() => navigate(`/issues/${id}`)}
          className="edit-issue-page__back-btn"
        >
          Back to Issue
        </button>
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="edit-issue-page">
        <h1 className="edit-issue-page__title">Edit Issue #{id}</h1>
        <p>Issue not found</p>
        <button
          type="button"
          onClick={() => navigate('/issues')}
          className="edit-issue-page__back-btn"
        >
          Back to Issues
        </button>
      </div>
    )
  }

  return (
    <div className="edit-issue-page">
      <h1 className="edit-issue-page__title">Edit Issue #{issue.id}</h1>

      <ErrorMessage message={fetchError} onDismiss={clearFetchError} />
      <ErrorMessage message={submitError} onDismiss={clearSubmitError} />

      <IssueForm
        values={formValues}
        onChange={handleFieldChange}
        errors={fieldErrors}
        isSubmitting={submitting}
      />

      <div className="edit-issue-page__actions">
        <button
          type="button"
          onClick={handleCancel}
          disabled={submitting || fetching}
          className="edit-issue-page__cancel-btn"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={submitting || fetching || !hasChanges}
          className="edit-issue-page__save-btn"
        >
          {submitting ? 'Saving...' : 'Save'}
        </button>
      </div>

      {(fetching || submitting) && (
        <LoadingSpinner message={fetching ? "Loading issue..." : "Saving changes..."} />
      )}
    </div>
  )
}

export default EditIssuePage
