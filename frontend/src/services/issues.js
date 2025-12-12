import api from './api'

/**
 * Get paginated list of issues
 * @param {Object} params - Query parameters
 * @param {string} params.statusFilter - Filter by status ('open', 'closed', or '' for all)
 * @param {string} params.sort - Sort by 'asc' or 'desc' (default: 'desc')
 * @param {number} params.page - Page number (default: 1)
 * @returns {Promise<Object>} Paginated response with items, total, page, per_page, total_pages
 */
export const getIssues = async ({ statusFilter = '', sort = 'desc', page = 1 } = {}) => {
  const params = {
    sort,
    page,
  }
  
  if (statusFilter) {
    params.status_filter = statusFilter
  }
  
  const response = await api.get('/api/v1/issues', { params })
  return response.data
}

/**
 * Get a single issue by ID
 * @param {number} id - Issue ID
 * @returns {Promise<Object>} Issue object
 */
export const getIssue = async (id) => {
  const response = await api.get(`/api/v1/issues/${id}`)
  return response.data
}

/**
 * Create a new issue
 * @param {Object} issueData - Issue data
 * @param {string} issueData.title - Issue title
 * @param {string} issueData.description - Issue description
 * @param {string} issueData.status - Issue status ('open' or 'closed')
 * @returns {Promise<Object>} Created issue object
 */
export const createIssue = async (issueData) => {
  const response = await api.post('/api/v1/issues', issueData)
  return response.data
}

/**
 * Update an existing issue (partial update)
 * @param {number} id - Issue ID
 * @param {Object} issueData - Partial issue data (all fields optional)
 * @returns {Promise<Object>} Updated issue object
 */
export const updateIssue = async (id, issueData) => {
  const response = await api.patch(`/api/v1/issues/${id}`, issueData)
  return response.data
}

/**
 * Delete an issue
 * @param {number} id - Issue ID
 * @returns {Promise<null>} Returns null on success (204 No Content)
 */
export const deleteIssue = async (id) => {
  await api.delete(`/api/v1/issues/${id}`)
  return null
}
