export const ISSUE_STATUSES = {
  OPEN: 'open',
  CLOSED: 'closed'
}

export const STATUS_OPTIONS = [
  { value: ISSUE_STATUSES.OPEN, label: 'Open' },
  { value: ISSUE_STATUSES.CLOSED, label: 'Closed' }
]

export const STATUS_FILTER_OPTIONS = [
  { value: '', label: 'All Statuses' },
  ...STATUS_OPTIONS
]

export const SORT_OPTIONS = [
  { value: 'desc', label: 'Newest First' },
  { value: 'asc', label: 'Oldest First' }
]
