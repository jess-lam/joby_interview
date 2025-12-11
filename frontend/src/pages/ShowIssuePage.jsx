import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useIssueShow } from '../hooks/useIssueShow'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatDate, formatDateTime } from '../utils/dateTimeUtils'
import './ShowIssuePage.css'

const ShowIssuePage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const {
    issue,
    loading,
    error,
    fetchIssue,
    handleDelete,
    clearError
  } = useIssueShow()

  useEffect(() => {
    if (id) {
      fetchIssue(parseInt(id, 10))
    }
  }, [id, fetchIssue])

  const handleDeleteClick = async () => {
    if (!issue) return

    const confirmed = window.confirm(
      `Are you sure you want to delete issue #${issue.id}? This action cannot be undone.`
    )

    if (!confirmed) return

    try {
      await handleDelete(issue.id)
      navigate('/issues')
    } catch (err) {
      console.log('Error deleting issue:', err);
    }
  }

  const handleEditClick = () => {
    navigate(`/issues/${id}/edit`)
  }

  const handleBackClick = () => {
    navigate('/issues')
  }

  if (loading && !issue) {
    return (
      <div className="show-issue-page">
        <LoadingSpinner message="Loading issue..." />
      </div>
    )
  }

  if (error && !issue) {
    return (
      <div className="show-issue-page">
        <h1 className="show-issue-page__title">Issue #{id}</h1>
        <ErrorMessage message={error} onDismiss={clearError} />
        <button
          type="button"
          onClick={handleBackClick}
          className="show-issue-page__back-btn"
        >
          Back to Issues
        </button>
      </div>
    )
  }

  if (!issue) {
    return (
      <div className="show-issue-page">
        <h1 className="show-issue-page__title">Issue #{id}</h1>
        <p>Issue not found</p>
        <button
          type="button"
          onClick={handleBackClick}
          className="show-issue-page__back-btn"
        >
          Back to Issues
        </button>
      </div>
    )
  }

  return (
    <div className="show-issue-page">
      <h1 className="show-issue-page__title">Issue #{issue.id}</h1>

      <ErrorMessage message={error} onDismiss={clearError} />

      <div className="show-issue-page__content">
        <div className="show-issue-page__field">
          <label className="show-issue-page__label">Title</label>
          <div className="show-issue-page__value">{issue.title}</div>
        </div>

        <div className="show-issue-page__field">
          <label className="show-issue-page__label">Description</label>
          <div className="show-issue-page__value show-issue-page__value--multiline">
            {issue.description}
          </div>
        </div>

        <div className="show-issue-page__field">
          <label className="show-issue-page__label">Status</label>
          <div className="show-issue-page__value">
            <span className={`show-issue-page__status show-issue-page__status--${issue.status}`}>
              {issue.status}
            </span>
          </div>
        </div>

        <div className="show-issue-page__field">
          <label className="show-issue-page__label">Created</label>
          <div className="show-issue-page__value">
            {formatDate(issue.created_at)}
          </div>
        </div>

        <div className="show-issue-page__field">
          <label className="show-issue-page__label">Updated</label>
          <div className="show-issue-page__value">
            {formatDateTime(issue.updated_at)}
          </div>
        </div>
      </div>

      <div className="show-issue-page__actions">
        <button
          type="button"
          onClick={handleBackClick}
          className="show-issue-page__back-btn"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleEditClick}
          className="show-issue-page__edit-btn"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={handleDeleteClick}
          disabled={loading}
          className="show-issue-page__delete-btn"
        >
          {loading ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      {loading && <LoadingSpinner message="Deleting issue..." />}
    </div>
  )
}

export default ShowIssuePage
