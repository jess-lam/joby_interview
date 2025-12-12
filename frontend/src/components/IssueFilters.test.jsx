import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import IssueFilters from './IssueFilters'

describe('IssueFilters', () => {
  const defaultProps = {
    statusFilter: '',
    sort: 'desc',
    onStatusFilterChange: vi.fn(),
    onSortChange: vi.fn(),
  }

  describe('rendering', () => {
    it('renders status filter and sort select fields', () => {
      render(<IssueFilters {...defaultProps} />)
      
      expect(screen.getByLabelText(/Status:/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Sort:/)).toBeInTheDocument()
    })

    it('displays current status filter value', () => {
      render(<IssueFilters {...defaultProps} statusFilter="open" />)
      
      expect(screen.getByLabelText(/Status:/)).toHaveValue('open')
    })

    it('displays current sort value', () => {
      render(<IssueFilters {...defaultProps} sort="asc" />)
      
      expect(screen.getByLabelText(/Sort:/)).toHaveValue('asc')
    })

    it('renders all status filter options', () => {
      render(<IssueFilters {...defaultProps} />)
      
      expect(screen.getByRole('option', { name: 'All Statuses' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Open' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Closed' })).toBeInTheDocument()
    })

    it('renders all sort options', () => {
      render(<IssueFilters {...defaultProps} />)
      
      expect(screen.getByRole('option', { name: 'Newest First' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Oldest First' })).toBeInTheDocument()
    })
  })

  describe('user interaction', () => {
    it('calls onStatusFilterChange when status filter changes', async () => {
      const user = userEvent.setup()
      const handleStatusFilterChange = vi.fn()
      
      render(
        <IssueFilters
          {...defaultProps}
          onStatusFilterChange={handleStatusFilterChange}
        />
      )
      
      const statusFilter = screen.getByLabelText(/Status:/)
      await user.selectOptions(statusFilter, 'open')
      
      expect(handleStatusFilterChange).toHaveBeenCalledWith('open')
    })

    it('calls onSortChange when sort changes', async () => {
      const user = userEvent.setup()
      const handleSortChange = vi.fn()
      
      render(
        <IssueFilters
          {...defaultProps}
          onSortChange={handleSortChange}
        />
      )
      
      const sort = screen.getByLabelText(/Sort:/)
      await user.selectOptions(sort, 'asc')
      
      expect(handleSortChange).toHaveBeenCalledWith('asc')
    })
  })
})
