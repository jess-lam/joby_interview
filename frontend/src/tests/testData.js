/**
 * Test data utilities
 * Reusable test data factories and sample data for components and tests
 */

const TIME_CONSTANTS = {
  SECOND: 1,
  MINUTE: 60,
  HOUR: 3600,
  DAY: 86400,
}

const getCurrentTimestamp = () => Math.floor(Date.now() / 1000)
const getTimestampAgo = (secondsAgo) => getCurrentTimestamp() - secondsAgo

const DEFAULT_ISSUE = {
  id: 1,
  title: 'Test Issue',
  description: 'This is a test issue description',
  status: 'open',
}

export const createMockIssue = (overrides = {}) => {
  const now = getCurrentTimestamp()
  return {
    ...DEFAULT_ISSUE,
    created_at: now,
    updated_at: now,
    ...overrides,
  }
}

export const createMockIssues = (count, baseOverrides = {}) => {
  return Array.from({ length: count }, (_, index) => {
    const id = index + 1
    const created_at = getTimestampAgo((count - index) * TIME_CONSTANTS.HOUR)
    return createMockIssue({
      id,
      title: `Test Issue ${id}`,
      description: `This is the description for test issue ${id}`,
      status: index % 3 === 0 ? 'closed' : 'open',
      created_at,
      updated_at: created_at,
      ...baseOverrides,
    })
  })
}

export const sampleIssues = [
  createMockIssue({
    id: 1,
    title: 'First Issue',
    description: 'This is the first test issue',
    status: 'open',
    created_at: getTimestampAgo(TIME_CONSTANTS.DAY),
  }),
  createMockIssue({
    id: 2,
    title: 'Second Issue',
    description: 'This is the second test issue',
    status: 'closed',
    created_at: getTimestampAgo(TIME_CONSTANTS.DAY / 2),
  }),
  createMockIssue({
    id: 3,
    title: 'Third Issue',
    description: 'This is the third test issue with a longer description that might be truncated in some views',
    status: 'open',
    created_at: getTimestampAgo(TIME_CONSTANTS.HOUR),
  }),
]

export const createPaginatedResponse = (items, pagination = {}) => {
  const {
    page = 1,
    perPage = 20,
    total = items.length,
  } = pagination

  return {
    items,
    total,
    page,
    per_page: perPage,
    total_pages: Math.ceil(total / perPage),
  }
}

export const createValidationError = (fieldErrors) => ({
  detail: fieldErrors.map(error => ({
    loc: error.loc ?? ['body', error.field],
    msg: error.msg ?? error.message ?? 'Invalid value',
    type: error.type ?? 'value_error',
  })),
})

export const validationErrors = {
  titleRequired: {
    loc: ['body', 'title'],
    msg: 'String should have at least 1 character',
    type: 'string_too_short',
  },
  titleTooLong: {
    loc: ['body', 'title'],
    msg: 'String should have at most 200 characters',
    type: 'string_too_long',
  },
  descriptionRequired: {
    loc: ['body', 'description'],
    msg: 'String should have at least 1 character',
    type: 'string_too_short',
  },
  descriptionTooLong: {
    loc: ['body', 'description'],
    msg: 'String should have at most 5000 characters',
    type: 'string_too_long',
  },
  invalidStatus: {
    loc: ['body', 'status'],
    msg: "Input should be 'open' or 'closed'",
    type: 'enum',
  },
}
