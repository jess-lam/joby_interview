import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import TextField from './TextField'

describe('TextField', () => {
  const defaultProps = {
    id: 'test-field',
    label: 'Test Label',
    value: '',
    onChange: vi.fn(),
  }

  describe('rendering', () => {
    it('renders label and input with correct id', () => {
      render(<TextField {...defaultProps} />)
      
      const input = screen.getByLabelText('Test Label')
      expect(input).toHaveAttribute('id', 'test-field')
    })

    it('displays the value', () => {
      render(<TextField {...defaultProps} value="Test value" />)
      
      const input = screen.getByLabelText('Test Label')
      expect(input).toHaveValue('Test value')
    })

    it('displays placeholder when provided', () => {
      render(<TextField {...defaultProps} placeholder="Enter text here" />)
      
      const input = screen.getByLabelText('Test Label')
      expect(input).toHaveAttribute('placeholder', 'Enter text here')
    })
  })

  describe('user interaction', () => {
    it('calls onChange when user types', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      const ControlledTextField = () => {
        const [value, setValue] = useState('')
        return (
          <TextField
            {...defaultProps}
            value={value}
            onChange={(newValue) => {
              setValue(newValue)
              handleChange(newValue)
            }}
          />
        )
      }
      
      render(<ControlledTextField />)
      
      const input = screen.getByLabelText('Test Label')
      await user.type(input, 'Hello')
      
      expect(handleChange).toHaveBeenLastCalledWith('Hello')
    })
  })

  describe('error handling', () => {
    it('displays error message when error is provided', () => {
      render(<TextField {...defaultProps} error="This is an error" />)
      
      expect(screen.getByText('This is an error')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent('This is an error')
    })

    it('has correct error id for accessibility', () => {
      render(<TextField {...defaultProps} id="my-field" error="Error message" />)
      
      const errorElement = screen.getByRole('alert')
      expect(errorElement).toHaveAttribute('id', 'my-field-error')
    })
  })

  describe('accessibility', () => {
    it('displays required indicator when required', () => {
      render(<TextField {...defaultProps} required />)
      
      expect(screen.getByText('*')).toBeInTheDocument()
    })
  })

  describe('disabled state', () => {
    it('disables input when disabled prop is true', () => {
      render(<TextField {...defaultProps} disabled />)
      
      const input = screen.getByLabelText('Test Label')
      expect(input).toBeDisabled()
    })
  })

  describe('edge cases', () => {
    it('handles special characters in value', () => {
      render(<TextField {...defaultProps} value="Test & <special> chars" />)
      
      const input = screen.getByLabelText('Test Label')
      expect(input).toHaveValue('Test & <special> chars')
    })
  })
})
