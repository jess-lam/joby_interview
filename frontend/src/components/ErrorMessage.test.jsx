import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorMessage from './ErrorMessage'

describe('ErrorMessage', () => {
  describe('rendering', () => {
    it('renders error message', () => {
      render(<ErrorMessage message="This is an error" />)
      
      expect(screen.getByText('This is an error')).toBeInTheDocument()
    })

    it('returns null when message is not provided', () => {
      const { container } = render(<ErrorMessage message={null} />)
      
      expect(container.firstChild).toBeNull()
    })

    it('returns null when message is empty string', () => {
      const { container } = render(<ErrorMessage message="" />)
      
      expect(container.firstChild).toBeNull()
    })
  })

  describe('user interaction', () => {
    it('calls onDismiss when dismiss button is clicked', async () => {
      const user = userEvent.setup()
      const handleDismiss = vi.fn()
      
      render(<ErrorMessage message="Error message" onDismiss={handleDismiss} />)
      
      const dismissButton = screen.getByLabelText('Dismiss error')
      await user.click(dismissButton)
      
      expect(handleDismiss).toHaveBeenCalledTimes(1)
    })

    it('does not render dismiss button when onDismiss is not provided', () => {
      render(<ErrorMessage message="Error message" />)
      
      expect(screen.queryByLabelText('Dismiss error')).not.toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has alert role', () => {
      render(<ErrorMessage message="Error message" />)
      
      expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('has dismiss button aria-label', () => {
      render(<ErrorMessage message="Error message" onDismiss={vi.fn()} />)
      
      expect(screen.getByLabelText('Dismiss error')).toBeInTheDocument()
    })
  })
})
