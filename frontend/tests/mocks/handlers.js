import { http, HttpResponse } from 'msw'
import {
  getIssuesFromStore,
  findIssue,
  findIssueIndex,
  addIssue,
  updateIssue,
  deleteIssue,
} from './issues/store'
import {
  parseQueryParams,
  filterIssuesByStatus,
  sortIssues,
  paginateIssues,
} from './issues/helpers'

export {
  resetIssuesStore,
  seedIssuesStore,
  getIssuesFromStore,
} from './issues/store'

/**
 * MSW request handlers for API endpoints
 * These handlers intercept HTTP requests during tests
 * 
 * Note: Validation is handled by the backend. These handlers accept any data
 * and store it. Tests can override handlers to return validation errors when needed.
 */

// GET /api/v1/issues - List issues with pagination, filtering, and sorting
export const listIssuesHandler = http.get('*/api/v1/issues', ({ request }) => {
  const params = parseQueryParams(request.url)
  let issues = getIssuesFromStore()

  const filterResult = filterIssuesByStatus(issues, params.statusFilter)
  if (filterResult.error) {
    return HttpResponse.json(
      filterResult.error.detail,
      { status: filterResult.error.status }
    )
  }
  issues = filterResult.issues

  issues = sortIssues(issues, params.sort)

  const result = paginateIssues(issues, params.page, 20)

  return HttpResponse.json(result)
})

// GET /api/v1/issues/:id - Get single issue
export const getIssueHandler = http.get('*/api/v1/issues/:id', ({ params }) => {
  const id = parseInt(params.id, 10)
  const issue = findIssue(id)

  if (!issue) {
    return HttpResponse.json(
      { detail: `Issue with id ${id} not found` },
      { status: 404 }
    )
  }

  return HttpResponse.json(issue)
})

// POST /api/v1/issues - Create issue
export const createIssueHandler = http.post('*/api/v1/issues', async ({ request }) => {
  const body = await request.json()
  const { title, description, status = 'open' } = body

  const newIssue = addIssue({
    title,
    description,
    status,
  })

  return HttpResponse.json(newIssue, { status: 201 })
})

// PATCH /api/v1/issues/:id - Update issue
export const updateIssueHandler = http.patch('*/api/v1/issues/:id', async ({ params, request }) => {
  const id = parseInt(params.id, 10)
  const issueIndex = findIssueIndex(id)

  if (issueIndex === -1) {
    return HttpResponse.json(
      { detail: `Issue with id ${id} not found` },
      { status: 404 }
    )
  }

  const body = await request.json()

  // Only include fields that were provided (matches backend exclude_unset=True)
  const updates = {}
  if (body.title !== undefined) updates.title = body.title
  if (body.description !== undefined) updates.description = body.description
  if (body.status !== undefined) updates.status = body.status

  const updatedIssue = updateIssue(id, updates)

  return HttpResponse.json(updatedIssue)
})

// DELETE /api/v1/issues/:id - Delete issue
export const deleteIssueHandler = http.delete('*/api/v1/issues/:id', ({ params }) => {
  const id = parseInt(params.id, 10)
  const deleted = deleteIssue(id)

  if (!deleted) {
    return HttpResponse.json(
      { detail: `Issue with id ${id} not found` },
      { status: 404 }
    )
  }

  return new HttpResponse(null, { status: 204 })
})

export const handlers = [
  listIssuesHandler,
  getIssueHandler,
  createIssueHandler,
  updateIssueHandler,
  deleteIssueHandler,
]
