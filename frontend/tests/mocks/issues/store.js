/**
 * In-memory store for issues (simulates database)
 * Manages CRUD operations for test data
 */

let issuesStore = []
let nextId = 1

export const createIssueObject = (id, overrides = {}) => {
  const now = Math.floor(Date.now() / 1000) // Unix timestamp in seconds
  return {
    id,
    title: overrides.title || `Test Issue ${id}`,
    description: overrides.description || `This is a test issue description for issue ${id}`,
    status: overrides.status || 'open',
    created_at: overrides.created_at || now,
    updated_at: overrides.updated_at || now,
    ...overrides,
  }
}

export const resetIssuesStore = () => {
  issuesStore = []
  nextId = 1
}

export const seedIssuesStore = (issues) => {
  issuesStore = issues.map((issue, index) => ({
    ...createIssueObject(nextId + index, issue),
    id: nextId + index,
  }))
  nextId = issuesStore.length > 0 ? Math.max(...issuesStore.map(i => i.id)) + 1 : 1
}

export const getIssuesFromStore = () => {
  return [...issuesStore]
}

export const findIssue = (id) => {
  return issuesStore.find(i => i.id === id)
}

export const findIssueIndex = (id) => {
  return issuesStore.findIndex(i => i.id === id)
}

export const addIssue = (issue) => {
  const now = Math.floor(Date.now() / 1000)
  const newIssue = {
    ...issue,
    id: nextId++,
    created_at: issue.created_at || now,
    updated_at: issue.updated_at || now,
  }
  issuesStore.push(newIssue)
  return newIssue
}

export const updateIssue = (id, updates) => {
  const index = findIssueIndex(id)
  if (index === -1) return null
  
  const now = Math.floor(Date.now() / 1000)
  issuesStore[index] = {
    ...issuesStore[index],
    ...updates,
    updated_at: now,
  }
  return issuesStore[index]
}

export const deleteIssue = (id) => {
  const index = findIssueIndex(id)
  if (index === -1) return false
  
  issuesStore.splice(index, 1)
  return true
}
