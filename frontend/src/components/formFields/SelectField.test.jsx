import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SelectField from './SelectField'

describe('SelectField', () => {
  const defaultOptions = [
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
  ]

  const defaultProps = {
    id: 'test-field',
    label: 'Test Label',
    value: 'open',
    onChange: vi.fn(),
    options: defaultOptions,
  }

  describe('rendering', () => {
    it('renders label and select with correct id', () => {
      render(<SelectField {...defaultProps} />)
      
      const select = screen.getByLabelText('Test Label')
      expect(select).toHaveAttribute('id', 'test-field')
    })

    it('displays selected value', () => {
      render(<SelectField {...defaultProps} value="open" />)
      
      const select = screen.getByLabelText('Test Label')
      expect(select).toHaveValue('open')
    })

    it('renders all options', () => {
      render(<SelectField {...defaultProps} />)
      
      expect(screen.getByRole('option', { name: 'Open' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Closed' })).toBeInTheDocument()
    })
  })

  describe('user interaction', () => {
    it('calls onChange when option is selected', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      
      render(<SelectField {...defaultProps} onChange={handleChange} />)
      
      const select = screen.getByLabelText('Test Label')
      await user.selectOptions(select, 'closed')
      
      expect(handleChange).toHaveBeenCalledTimes(1)
      expect(handleChange).toHaveBeenCalledWith('closed')
    })
  })

  describe('error handling', () => {
    it('displays error message when error is provided', () => {
      render(<SelectField {...defaultProps} error="This is an error" />)
      
      expect(screen.getByText('This is an error')).toBeInTheDocument()
      expect(screen.getByRole('alert')).toHaveTextContent('This is an error')
    })

    it('has correct error id for accessibility', () => {
      render(<SelectField {...defaultProps} id="my-field" error="Error message" />)
      
      const errorElement = screen.getByRole('alert')
      expect(errorElement).toHaveAttribute('id', 'my-field-error')
    })
  })

  describe('accessibility', () => {
    it('displays required indicator when required', () => {
      render(<SelectField {...defaultProps} required />)
      
      expect(screen.getByText('*')).toBeInTheDocument()
    })
  })

  describe('disabled state', () => {
    it('disables select when disabled prop is true', () => {
      render(<SelectField {...defaultProps} disabled />)
      
      const select = screen.getByLabelText('Test Label')
      expect(select).toBeDisabled()
    })
  })

  describe('edge cases', () => {
    it('handles empty options array', () => {
      render(<SelectField {...defaultProps} options={[]} />)
      
      const select = screen.getByLabelText('Test Label')
      expect(select).toBeInTheDocument()
    })

    it('handles multiple options', () => {
      const manyOptions = [
        { value: 'opt1', label: 'Option 1' },
        { value: 'opt2', label: 'Option 2' },
        { value: 'opt3', label: 'Option 3' },
        { value: 'opt4', label: 'Option 4' },
      ]
      
      render(<SelectField {...defaultProps} options={manyOptions} value="opt2" />)
      
      expect(screen.getByRole('option', { name: 'Option 1' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Option 2' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Option 3' })).toBeInTheDocument()
      expect(screen.getByRole('option', { name: 'Option 4' })).toBeInTheDocument()
      
      const select = screen.getByLabelText('Test Label')
      expect(select).toHaveValue('opt2')
    })
  })
})
