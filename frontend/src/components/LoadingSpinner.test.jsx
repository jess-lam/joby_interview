import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from './LoadingSpinner'

describe('LoadingSpinner', () => {
  describe('rendering', () => {
    it('renders spinner with default message', () => {
      render(<LoadingSpinner />)
      
      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.getByLabelText('Loading')).toBeInTheDocument()
    })

    it('renders spinner with custom message', () => {
      render(<LoadingSpinner message="Loading issues..." />)
      
      expect(screen.getByText('Loading issues...')).toBeInTheDocument()
    })

    it('renders spinner without message when message is empty string', () => {
      render(<LoadingSpinner message="" />)
      
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument()
      expect(screen.getByLabelText('Loading')).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has loading aria-label', () => {
      render(<LoadingSpinner />)
      
      expect(screen.getByLabelText('Loading')).toBeInTheDocument()
    })
  })
})

