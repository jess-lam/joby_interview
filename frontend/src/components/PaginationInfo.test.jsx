import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PaginationInfo from './PaginationInfo'

describe('PaginationInfo', () => {
  describe('rendering', () => {
    it('displays correct pagination info for first page', () => {
      render(<PaginationInfo page={1} perPage={20} total={100} />)
      
      expect(screen.getByText('Showing 1 to 20 of 100 issues')).toBeInTheDocument()
    })

    it('displays correct pagination info for middle page', () => {
      render(<PaginationInfo page={2} perPage={20} total={100} />)
      
      expect(screen.getByText('Showing 21 to 40 of 100 issues')).toBeInTheDocument()
    })

    it('displays correct pagination info for last page', () => {
      render(<PaginationInfo page={5} perPage={20} total={100} />)
      
      expect(screen.getByText('Showing 81 to 100 of 100 issues')).toBeInTheDocument()
    })
  })

  describe('edge cases', () => {
    it('handles single page correctly', () => {
      render(<PaginationInfo page={1} perPage={20} total={15} />)
      
      expect(screen.getByText('Showing 1 to 15 of 15 issues')).toBeInTheDocument()
    })

    it('handles empty results', () => {
      render(<PaginationInfo page={1} perPage={20} total={0} />)
      
      expect(screen.getByText('Showing 1 to 0 of 0 issues')).toBeInTheDocument()
    })

    it('handles last page with partial results', () => {
      render(<PaginationInfo page={3} perPage={20} total={55} />)
      
      expect(screen.getByText('Showing 41 to 55 of 55 issues')).toBeInTheDocument()
    })
  })
})
