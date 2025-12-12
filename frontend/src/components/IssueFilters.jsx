import PropTypes from 'prop-types'
import { STATUS_FILTER_OPTIONS, SORT_OPTIONS } from '../utils/constants'
import './IssueFilters.css'

const IssueFilters = ({ statusFilter, sort, onStatusFilterChange, onSortChange }) => {
  return (
    <div className="issue-filters">
      <div className="issue-filters__group">
        <label htmlFor="status-filter" className="issue-filters__label">
          Status:
        </label>
        <select
          id="status-filter"
          className="issue-filters__select"
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
        >
          {STATUS_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="issue-filters__group">
        <label htmlFor="sort" className="issue-filters__label">
          Sort:
        </label>
        <select
          id="sort"
          className="issue-filters__select"
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

IssueFilters.propTypes = {
  statusFilter: PropTypes.string.isRequired,
  sort: PropTypes.string.isRequired,
  onStatusFilterChange: PropTypes.func.isRequired,
  onSortChange: PropTypes.func.isRequired
}

export default IssueFilters
