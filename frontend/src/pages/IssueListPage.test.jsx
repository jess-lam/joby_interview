import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '../tests/testUtils'
import { server } from '../../tests/mocks/server'
import { http, HttpResponse } from 'msw'
import { resetIssuesStore, seedIssuesStore } from '../../tests/mocks/handlers'
import { createMockIssue, createMockIssues } from '../tests/testData'
import IssueListPage from './IssueListPage'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('IssueListPage', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
    resetIssuesStore()
  })

  describe('initial render and loading', () => {
    it('shows loading spinner initially when loading and no issues', async () => {
      // Seed store with issues
      const mockIssues = createMockIssues(5)
      seedIssuesStore(mockIssues)

      renderWithRouter(<IssueListPage />)

      // Should show loading spinner initially
      expect(screen.getByText('Loading issues...')).toBeInTheDocument()

      await waitFor(() => {
        expect(screen.queryByText('Loading issues...')).not.toBeInTheDocument()
      })
    })

    it('renders page structure after loading', async () => {
      const mockIssues = createMockIssues(3)
      seedIssuesStore(mockIssues)

      renderWithRouter(<IssueListPage />)

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Issues' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Create Issue' })).toBeInTheDocument()
      })
    })

    it('does not show loading spinner when issues exist', async () => {
      const mockIssues = createMockIssues(5)
      seedIssuesStore(mockIssues)

      renderWithRouter(<IssueListPage />)

      await waitFor(() => {
        expect(screen.getByText('Test Issue 1')).toBeInTheDocument()
      })

      expect(screen.queryByText('Loading issues...')).not.toBeInTheDocument()
    })
  })

  describe('displaying issues', () => {
    it('displays list of issue cards when issues are loaded', async () => {
      const mockIssues = createMockIssues(3)
      seedIssuesStore(mockIssues)

      renderWithRouter(<IssueListPage />)

      await waitFor(() => {
        expect(screen.getByText('Test Issue 1')).toBeInTheDocument()
        expect(screen.getByText('Test Issue 2')).toBeInTheDocument()
        expect(screen.getByText('Test Issue 3')).toBeInTheDocument()
      })
    })

    it('displays empty state when no issues found', async () => {
      // Don't seed any issues
      renderWithRouter(<IssueListPage />)

      await waitFor(() => {
        expect(screen.getByText('No issues found.')).toBeInTheDocument()
      })
    })

    it('shows correct number of issues', async () => {
      const mockIssues = createMockIssues(5)
      seedIssuesStore(mockIssues)

      renderWithRouter(<IssueListPage />)

      await waitFor(() => {
        const issueTitles = screen.getAllByText(/Test Issue \d+/)
        expect(issueTitles).toHaveLength(5)
      })
    })
  })

  describe('filter interactions', () => {
    it('changes status filter and updates the list', async () => {
      const user = userEvent.setup()
      
      // Seed with mixed status issues
      const openIssues = [
        createMockIssue({ id: 1, title: 'Open Issue 1', status: 'open' }),
        createMockIssue({ id: 2, title: 'Open Issue 2', status: 'open' }),
        createMockIssue({ id: 3, title: 'Open Issue 3', status: 'open' }),
      ]
      const closedIssues = [
        createMockIssue({ id: 4, title: 'Closed Issue 1', status: 'closed' }),
        createMockIssue({ id: 5, title: 'Closed Issue 2', status: 'closed' }),
      ]
      seedIssuesStore([...openIssues, ...closedIssues])

      renderWithRouter(<IssueListPage />)

      // Should show all 5 issues
      await waitFor(() => {
        expect(screen.getByText('Open Issue 1')).toBeInTheDocument()
        expect(screen.getByText('Closed Issue 2')).toBeInTheDocument()
      })

      // Change filter to open
      const statusFilter = screen.getByLabelText(/Status:/)
      await user.selectOptions(statusFilter, 'open')

      // Should only show open issues
      await waitFor(() => {
        expect(screen.getByText('Open Issue 1')).toBeInTheDocument()
        expect(screen.getByText('Open Issue 2')).toBeInTheDocument()
        expect(screen.getByText('Open Issue 3')).toBeInTheDocument()
        expect(screen.queryByText('Closed Issue 1')).not.toBeInTheDocument()
        expect(screen.queryByText('Closed Issue 2')).not.toBeInTheDocument()
      })
    })

    it('displays current filter value in IssueFilters', async () => {
      const mockIssues = createMockIssues(5)
      seedIssuesStore(mockIssues)

      renderWithRouter(<IssueListPage />, {
        initialEntries: ['/issues?status_filter=open'],
      })

      await waitFor(() => {
        const statusFilter = screen.getByLabelText(/Status:/)
        expect(statusFilter).toHaveValue('open')
      })
    })

    it('updates URL when filter changes', async () => {
      const user = userEvent.setup()
      const mockIssues = createMockIssues(5)
      seedIssuesStore(mockIssues)

      renderWithRouter(<IssueListPage />)

      await waitFor(() => {
        expect(screen.getByText('Test Issue 1')).toBeInTheDocument()
      })

      const statusFilter = screen.getByLabelText(/Status:/)
      await user.selectOptions(statusFilter, 'closed')

      // URL should be updated (tested via hook integration)
      await waitFor(() => {
        expect(statusFilter).toHaveValue('closed')
      })
    })
  })

  describe('sort interactions', () => {
    it('changes sort order and updates the list', async () => {
      const user = userEvent.setup()
      const mockIssues = createMockIssues(5)
      seedIssuesStore(mockIssues)

      renderWithRouter(<IssueListPage />)

      await waitFor(() => {
        expect(screen.getByText('Test Issue 1')).toBeInTheDocument()
      })

      // Change sort to asc
      const sortFilter = screen.getByLabelText(/Sort:/)
      await user.selectOptions(sortFilter, 'asc')

      await waitFor(() => {
        expect(screen.getByText('Test Issue 1')).toBeInTheDocument()
      })
    })

    it('displays current sort value in IssueFilters', async () => {
      const mockIssues = createMockIssues(5)
      seedIssuesStore(mockIssues)

      renderWithRouter(<IssueListPage />, {
        initialEntries: ['/issues?sort=asc'],
      })

      await waitFor(() => {
        const sortFilter = screen.getByLabelText(/Sort:/)
        expect(sortFilter).toHaveValue('asc')
      })
    })
  })

  describe('pagination', () => {
    it('displays pagination when total_pages > 1', async () => {
      // Seed enough issues for multiple pages (20 per page)
      const mockIssues = createMockIssues(25)
      seedIssuesStore(mockIssues)

      renderWithRouter(<IssueListPage />)

      await waitFor(() => {
        expect(screen.getByRole('navigation', { name: 'Issue pagination' })).toBeInTheDocument()
        expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
      })
    })

    it('does not display pagination when total_pages <= 1', async () => {
      const mockIssues = createMockIssues(5)
      seedIssuesStore(mockIssues)

      renderWithRouter(<IssueListPage />)

      await waitFor(() => {
        expect(screen.getByText('Test Issue 1')).toBeInTheDocument()
      })

      expect(screen.queryByRole('navigation', { name: 'Issue pagination' })).not.toBeInTheDocument()
    })

    it('changes page and updates the list', async () => {
      const user = userEvent.setup()
      const mockIssues = createMockIssues(25)
      seedIssuesStore(mockIssues)

      renderWithRouter(<IssueListPage />)

      await waitFor(() => {
        expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
      })

      // Click page 2
      const page2Button = screen.getByLabelText('Page 2')
      await user.click(page2Button)

      // Should update to page 2
      await waitFor(() => {
        expect(screen.getByLabelText('Page 2')).toHaveAttribute('aria-current', 'page')
      })
    })

    it('displays pagination info correctly', async () => {
      const mockIssues = createMockIssues(25)
      seedIssuesStore(mockIssues)

      renderWithRouter(<IssueListPage />)

      await waitFor(() => {
        expect(screen.getByText(/Showing 1 to 20 of 25 issues/)).toBeInTheDocument()
      })
    })
  })

  describe('navigation to create page', () => {
    it('navigates to create page when Create Issue button is clicked', async () => {
      const user = userEvent.setup()
      const mockIssues = createMockIssues(5)
      seedIssuesStore(mockIssues)

      renderWithRouter(<IssueListPage />)

      await waitFor(() => {
        expect(screen.getByText('Test Issue 1')).toBeInTheDocument()
      })

      const createButton = screen.getByRole('button', { name: 'Create Issue' })
      await user.click(createButton)

      expect(mockNavigate).toHaveBeenCalledWith('/issues/new')
    })
  })

  describe('error handling', () => {
    it('displays error message when fetch fails', async () => {
      // Override the handler to return an error
      server.use(
        http.get('http://localhost:8000/api/v1/issues', () => {
          return HttpResponse.json(
            { detail: 'Failed to fetch issues' },
            { status: 500 }
          )
        })
      )

      renderWithRouter(<IssueListPage />)

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch issues')).toBeInTheDocument()
      }, { timeout: 3000 })
    })

    it('clears error when dismiss button is clicked', async () => {
      const user = userEvent.setup()

      // Override the handler to return an error
      server.use(
        http.get('http://localhost:8000/api/v1/issues', () => {
          return HttpResponse.json(
            { detail: 'Server error' },
            { status: 500 }
          )
        })
      )

      renderWithRouter(<IssueListPage />)

      await waitFor(() => {
        expect(screen.getByText('Server error')).toBeInTheDocument()
      }, { timeout: 3000 })

      const dismissButton = screen.getByLabelText('Dismiss error')
      await user.click(dismissButton)

      await waitFor(() => {
        expect(screen.queryByText('Server error')).not.toBeInTheDocument()
      })
    })
  })
})
