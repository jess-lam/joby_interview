import React from 'react'
import './PaginationInfo.css'

const PaginationInfo = ({ page, perPage, total }) => {
  const start = ((page - 1) * perPage) + 1
  const end = Math.min(page * perPage, total)

  return (
    <div className="pagination-info">
      Showing {start} to {end} of {total} issues
    </div>
  )
}

export default PaginationInfo
