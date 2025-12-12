/**
 * Helper functions for issue handlers
 * Pure functions for filtering, sorting, pagination, and query parsing
 */

export const parseQueryParams = (url) => {
  const urlObj = new URL(url)
  return {
    statusFilter: urlObj.searchParams.get('status_filter'),
    sort: urlObj.searchParams.get('sort') || 'desc',
    page: parseInt(urlObj.searchParams.get('page') || '1', 10),
  }
}

export const filterIssuesByStatus = (issues, statusFilter) => {
  if (!statusFilter) {
    return { issues, error: null }
  }
  
  if (statusFilter !== 'open' && statusFilter !== 'closed') {
    return {
      issues: [],
      error: {
        detail: "status_filter must be 'open' or 'closed'",
        status: 400,
      },
    }
  }
  
  const filtered = issues.filter(issue => issue.status === statusFilter)
  return { issues: filtered, error: null }
}

export const sortIssues = (issues, sort) => {
  const sorted = [...issues] // Don't mutate original
  
  sorted.sort((a, b) => {
    if (sort === 'asc') {
      return a.created_at - b.created_at
    }
    return b.created_at - a.created_at
  })
  
  return sorted
}

export const paginateIssues = (issues, page, perPage = 20) => {
  const total = issues.length
  const totalPages = total === 0 ? 1 : Math.ceil(total / perPage)
  const offset = (page - 1) * perPage
  const paginatedIssues = issues.slice(offset, offset + perPage)
  
  return {
    items: paginatedIssues,
    total,
    page,
    per_page: perPage,
    total_pages: totalPages,
  }
}
