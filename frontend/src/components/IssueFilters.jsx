import React from 'react'
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
          value={statusFilter || ''}
          onChange={(e) => onStatusFilterChange(e.target.value || null)}
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

export default IssueFilters
