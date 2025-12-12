import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import TextAreaField from './TextAreaField'

describe('TextAreaField', () => {
  const defaultProps = {
    id: 'test-field',
    label: 'Test Label',
    value: '',
    onChange: vi.fn(),
  }

  describe('rendering', () => {
    it('renders label and textarea with correct id', () => {
      render(<TextAreaField {...defaultProps} />)
      
      const textarea = screen.getByLabelText('Test Label')
      expect(textarea).toHaveAttribute('id', 'test-field')
    })

    it('displays the value', () => {
      render(<TextAreaField {...defaultProps} value="Test value" />)
      
      const textarea = screen.getByLabelText('Test Label')
      expect(textarea).toHaveValue('Test value')
    })

    it('displays placeholder when provided', () => {
      render(<TextAreaField {...defaultProps} placeholder="Enter text here" />)
      
      const textarea = screen.getByLabelText('Test Label')
      expect(textarea).toHaveAttribute('placeholder', 'Enter text here')
    })
  })

  describe('user interaction', () => {
    it('calls onChange when user types', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      const ControlledTextAreaField = () => {
        const [value, setValue] = useState('')
        return (
          <TextAreaField
            {...defaultProps}
            value={value}
            onChange={(newValue) => {
              setValue(newValue)
              handleChange(newValue)
            }}
          />
        )
      }
      
      render(<ControlledTextAreaField />)
      
      const textarea = screen.getByLabelText('Test Label')
      await user.type(textarea, 'Hello')

      expect(handleChange).toHaveBeenLastCalledWith('Hello')
    })
  })

  describe('error handling', () => {
    it('displays error message when error is provided', () => {
      render(<TextAreaField {...defaultProps} error="This is an error" />)
      
      expect(screen.getByText('This is an error')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent('This is an error')
    })

    it('has correct error id for accessibility', () => {
      render(<TextAreaField {...defaultProps} id="my-field" error="Error message" />)
      
      const errorElement = screen.getByRole('alert')
      expect(errorElement).toHaveAttribute('id', 'my-field-error')
    })
  })

  describe('accessibility', () => {
    it('displays required indicator when required', () => {
      render(<TextAreaField {...defaultProps} required />)
      
      expect(screen.getByText('*')).toBeInTheDocument()
    })
  })

  describe('disabled state', () => {
    it('disables textarea when disabled prop is true', () => {
      render(<TextAreaField {...defaultProps} disabled />)
      
      const textarea = screen.getByLabelText('Test Label')
      expect(textarea).toBeDisabled()
    })
  })

  describe('edge cases', () => {
    it('handles multiline text', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      
      render(<TextAreaField {...defaultProps} onChange={handleChange} />)
      
      const textarea = screen.getByLabelText('Test Label')
      await user.type(textarea, 'Line 1{Enter}Line 2')
      
      expect(handleChange).toHaveBeenCalled()
    })

    it('handles long text values', () => {
      const longText = 'A'.repeat(1000)
      render(<TextAreaField {...defaultProps} value={longText} />)
      
      const textarea = screen.getByLabelText('Test Label')
      expect(textarea).toHaveValue(longText)
    })
  })
})
