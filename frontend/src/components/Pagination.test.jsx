import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Pagination from './Pagination'

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    onPageChange: vi.fn(),
  }

  describe('rendering', () => {
    it('returns null when totalPages is 1', () => {
      const { container } = render(
        <Pagination {...defaultProps} totalPages={1} />
      )
      
      expect(container.firstChild).toBeNull()
    })

    it('returns null when totalPages is 0', () => {
      const { container } = render(
        <Pagination {...defaultProps} totalPages={0} />
      )
      
      expect(container.firstChild).toBeNull()
    })

    it('renders navigation with correct aria-label', () => {
      render(<Pagination {...defaultProps} />)
      
      expect(screen.getByRole('navigation', { name: 'Issue pagination' })).toBeInTheDocument()
    })

    it('shows first and last buttons when showFirstLast is true', () => {
      render(<Pagination {...defaultProps} showFirstLast={true} />)
      
      expect(screen.getByLabelText('First page')).toBeInTheDocument()
      expect(screen.getByLabelText('Last page')).toBeInTheDocument()
    })

    it('hides first and last buttons when showFirstLast is false', () => {
      render(<Pagination {...defaultProps} showFirstLast={false} />)
      
      expect(screen.queryByLabelText('First page')).not.toBeInTheDocument()
      expect(screen.queryByLabelText('Last page')).not.toBeInTheDocument()
    })
  })

  describe('page number display', () => {
    it('shows all pages when totalPages is less than or equal to maxVisible', () => {
      render(<Pagination {...defaultProps} totalPages={3} currentPage={1} />)
      
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 2')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 3')).toBeInTheDocument()
    })

    it('shows visible page numbers on first page', () => {
      render(<Pagination {...defaultProps} totalPages={10} currentPage={1} />)
      
      // Should show pages 1-5 (default maxVisible is 5)
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 2')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 5')).toBeInTheDocument()
      expect(screen.queryByLabelText('Page 6')).not.toBeInTheDocument()
    })

    it('shows visible page numbers on middle page', () => {
      render(<Pagination {...defaultProps} totalPages={10} currentPage={5} />)
      
      // Should show pages around current page (e.g., 3-7)
      expect(screen.getByLabelText('Page 3')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 5')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 7')).toBeInTheDocument()
    })

    it('shows visible page numbers on last page', () => {
      render(<Pagination {...defaultProps} totalPages={10} currentPage={10} />)
      
      // Should show pages near the end (e.g., 6-10)
      expect(screen.getByLabelText('Page 6')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 10')).toBeInTheDocument()
      expect(screen.queryByLabelText('Page 5')).not.toBeInTheDocument()
    })

    it('highlights current page', () => {
      render(<Pagination {...defaultProps} currentPage={3} />)
      
      const currentPageButton = screen.getByLabelText('Page 3')
      expect(currentPageButton).toHaveAttribute('aria-current', 'page')
    })

    it('does not highlight non-current pages', () => {
      render(<Pagination {...defaultProps} currentPage={3} />)
      
      const otherPageButton = screen.getByLabelText('Page 2')
      expect(otherPageButton).not.toHaveAttribute('aria-current', 'page')
    })
  })

  describe('navigation button states', () => {
    it('disables first and previous buttons on first page', () => {
      render(<Pagination {...defaultProps} currentPage={1} />)
      
      expect(screen.getByLabelText('First page')).toBeDisabled()
      expect(screen.getByLabelText('Previous page')).toBeDisabled()
    })

    it('enables first and previous buttons when not on first page', () => {
      render(<Pagination {...defaultProps} currentPage={3} />)
      
      expect(screen.getByLabelText('First page')).not.toBeDisabled()
      expect(screen.getByLabelText('Previous page')).not.toBeDisabled()
    })

    it('disables next and last buttons on last page', () => {
      render(<Pagination {...defaultProps} currentPage={5} totalPages={5} />)
      
      expect(screen.getByLabelText('Next page')).toBeDisabled()
      expect(screen.getByLabelText('Last page')).toBeDisabled()
    })

    it('enables next and last buttons when not on last page', () => {
      render(<Pagination {...defaultProps} currentPage={3} totalPages={5} />)
      
      expect(screen.getByLabelText('Next page')).not.toBeDisabled()
      expect(screen.getByLabelText('Last page')).not.toBeDisabled()
    })
  })

  describe('user interaction', () => {
    it('calls onPageChange with page number when clicking a page number button', async () => {
      const user = userEvent.setup()
      const handlePageChange = vi.fn()
      
      render(
        <Pagination
          {...defaultProps}
          currentPage={1}
          onPageChange={handlePageChange}
        />
      )
      
      const pageButton = screen.getByLabelText('Page 2')
      await user.click(pageButton)
      
      expect(handlePageChange).toHaveBeenCalledWith(2)
    })

    it('calls onPageChange with currentPage - 1 when clicking previous button', async () => {
      const user = userEvent.setup()
      const handlePageChange = vi.fn()
      
      render(
        <Pagination
          {...defaultProps}
          currentPage={3}
          onPageChange={handlePageChange}
        />
      )
      
      const prevButton = screen.getByLabelText('Previous page')
      await user.click(prevButton)
      
      expect(handlePageChange).toHaveBeenCalledWith(2)
    })

    it('calls onPageChange with currentPage + 1 when clicking next button', async () => {
      const user = userEvent.setup()
      const handlePageChange = vi.fn()
      
      render(
        <Pagination
          {...defaultProps}
          currentPage={3}
          onPageChange={handlePageChange}
        />
      )
      
      const nextButton = screen.getByLabelText('Next page')
      await user.click(nextButton)
      
      expect(handlePageChange).toHaveBeenCalledWith(4)
    })

    it('calls onPageChange with 1 when clicking first button', async () => {
      const user = userEvent.setup()
      const handlePageChange = vi.fn()
      
      render(
        <Pagination
          {...defaultProps}
          currentPage={5}
          onPageChange={handlePageChange}
        />
      )
      
      const firstButton = screen.getByLabelText('First page')
      await user.click(firstButton)
      
      expect(handlePageChange).toHaveBeenCalledWith(1)
    })

    it('calls onPageChange with totalPages when clicking last button', async () => {
      const user = userEvent.setup()
      const handlePageChange = vi.fn()
      
      render(
        <Pagination
          {...defaultProps}
          currentPage={1}
          totalPages={10}
          onPageChange={handlePageChange}
        />
      )
      
      const lastButton = screen.getByLabelText('Last page')
      await user.click(lastButton)
      
      expect(handlePageChange).toHaveBeenCalledWith(10)
    })

    it('does not call onPageChange when clicking disabled previous button', async () => {
      const user = userEvent.setup()
      const handlePageChange = vi.fn()
      
      render(
        <Pagination
          {...defaultProps}
          currentPage={1}
          onPageChange={handlePageChange}
        />
      )
      
      const prevButton = screen.getByLabelText('Previous page')
      await user.click(prevButton)
      
      expect(handlePageChange).not.toHaveBeenCalled()
    })

    it('does not call onPageChange when clicking disabled next button', async () => {
      const user = userEvent.setup()
      const handlePageChange = vi.fn()
      
      render(
        <Pagination
          {...defaultProps}
          currentPage={5}
          totalPages={5}
          onPageChange={handlePageChange}
        />
      )
      
      const nextButton = screen.getByLabelText('Next page')
      await user.click(nextButton)
      
      expect(handlePageChange).not.toHaveBeenCalled()
    })

    it('does not call onPageChange when clicking disabled first button', async () => {
      const user = userEvent.setup()
      const handlePageChange = vi.fn()
      
      render(
        <Pagination
          {...defaultProps}
          currentPage={1}
          onPageChange={handlePageChange}
        />
      )
      
      const firstButton = screen.getByLabelText('First page')
      await user.click(firstButton)
      
      expect(handlePageChange).not.toHaveBeenCalled()
    })

    it('does not call onPageChange when clicking disabled last button', async () => {
      const user = userEvent.setup()
      const handlePageChange = vi.fn()
      
      render(
        <Pagination
          {...defaultProps}
          currentPage={5}
          totalPages={5}
          onPageChange={handlePageChange}
        />
      )
      
      const lastButton = screen.getByLabelText('Last page')
      await user.click(lastButton)
      
      expect(handlePageChange).not.toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    it('handles two pages correctly', () => {
      render(<Pagination {...defaultProps} totalPages={2} currentPage={1} />)
      
      expect(screen.getByLabelText('Page 1')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 2')).toBeInTheDocument()
      expect(screen.getByLabelText('Previous page')).toBeDisabled()
      expect(screen.getByLabelText('Next page')).not.toBeDisabled()
    })

    it('handles many pages correctly', () => {
      render(<Pagination {...defaultProps} totalPages={20} currentPage={10} />)
      
      // Should show a subset of pages around current page
      expect(screen.getByLabelText('Page 10')).toBeInTheDocument()
      expect(screen.getByLabelText('Page 10')).toHaveAttribute('aria-current', 'page')
      // Verify navigation buttons are enabled
      expect(screen.getByLabelText('Previous page')).not.toBeDisabled()
      expect(screen.getByLabelText('Next page')).not.toBeDisabled()
    })
  })
})
