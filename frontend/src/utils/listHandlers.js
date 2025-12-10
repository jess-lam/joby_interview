/**
 * Reusable paginated list hanlder functions
 */

/**
 * Handle page change
 * @param {Function} fetchList - The fetchList function (from hook or component)
 * @param {number} newPage - page number
 */
export const handlePageChange = (fetchList, newPage) => {
  fetchList({ page: newPage })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

/**
 * Handle status filter change
 * @param {Function} fetchList - The fetchList function (from hook or component)
 * @param {string|null} statusFilter - status filter value
 */
export const handleStatusFilterChange = (fetchList, statusFilter) => {
  fetchList({ 
    statusFilter,
    page: 1 // Reset to page 1 when filters change
  })
}

/**
 * Handle sort change
 * @param {Function} fetchList - The fetchList function (from hook or component)
 * @param {string} sort - asc or desc
 */
export const handleSortChange = (fetchList, sort) => {
  fetchList({ 
    sort,
    page: 1 // Reset to page 1 when filters change
  })
}
