import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIssueList } from '../hooks/useIssueList'
import { 
  handlePageChange, 
  handleStatusFilterChange, 
  handleSortChange 
} from '../utils/listHandlers'
import IssueFilters from '../components/IssueFilters'
import IssueList from '../components/IssueList'
import Pagination from '../components/Pagination'
import PaginationInfo from '../components/PaginationInfo'
import ErrorMessage from '../components/ErrorMessage'
import LoadingSpinner from '../components/LoadingSpinner'
import './IssueListPage.css'

const IssueListPage = () => {
  const navigate = useNavigate()
  
  const {
    issues,
    loading,
    error,
    pagination,
    filters,
    fetchIssues,
    clearError
  } = useIssueList()

  // Create memoized wrapper functions using imported handlers
  const onPageChange = useCallback((newPage) => {
    handlePageChange(fetchIssues, newPage)
  }, [fetchIssues])

  const onStatusFilterChange = useCallback((statusFilter) => {
    handleStatusFilterChange(fetchIssues, statusFilter)
  }, [fetchIssues])

  const onSortChange = useCallback((sort) => {
    handleSortChange(fetchIssues, sort)
  }, [fetchIssues])

  const handleCreateClick = () => {
    navigate('/issues/new')
  }

  if (loading && issues.length === 0) {
    return (
      <div className="issue-list-page">
        <LoadingSpinner message="Loading issues..." />
      </div>
    )
  }

  return (
    <div className="issue-list-page">
      <div className="issue-list-page__header">
        <h1 className="issue-list-page__title">Issues</h1>
        <button 
          className="issue-list-page__create-btn"
          onClick={handleCreateClick}
        >
          Create Issue
        </button>
      </div>
      
      <IssueFilters
        statusFilter={filters.statusFilter}
        sort={filters.sort}
        onStatusFilterChange={onStatusFilterChange}
        onSortChange={onSortChange}
      />

      <ErrorMessage message={error} onDismiss={clearError} />

      <IssueList issues={issues} />

      {pagination.total_pages > 1 && (
        <>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.total_pages}
            onPageChange={onPageChange}
          />

          <PaginationInfo
            page={pagination.page}
            perPage={pagination.per_page}
            total={pagination.total}
          />
        </>
      )}
    </div>
  )
}

export default IssueListPage
