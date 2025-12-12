import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import IssueForm from './IssueForm'

describe('IssueForm', () => {
  const defaultProps = {
    values: {},
    onChange: vi.fn(),
    errors: {},
  }

  describe('rendering', () => {
    it('renders all form fields', () => {
      render(<IssueForm {...defaultProps} />)
      
      expect(screen.getByLabelText(/Title/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Description/)).toBeInTheDocument()
      expect(screen.getByLabelText(/Status/)).toBeInTheDocument()
    })
  })

  describe('field values', () => {
    it('displays provided values in fields', () => {
      const values = {
        title: 'Test Title',
        description: 'Test Description',
        status: 'closed',
      }
      render(<IssueForm {...defaultProps} values={values} />)
      
      expect(screen.getByLabelText(/Title/)).toHaveValue('Test Title')
      expect(screen.getByLabelText(/Description/)).toHaveValue('Test Description')
      expect(screen.getByLabelText(/Status/)).toHaveValue('closed')
    })

    it('uses default empty values when values not provided', () => {
      render(<IssueForm {...defaultProps} values={{}} />)
      
      expect(screen.getByLabelText(/Title/)).toHaveValue('')
      expect(screen.getByLabelText(/Description/)).toHaveValue('')
    })

    it('uses default status value when status not provided', () => {
      render(<IssueForm {...defaultProps} values={{}} />)
      
      expect(screen.getByLabelText(/Status/)).toHaveValue('open')
    })
  })

  describe('field changes', () => {
    it('calls onChange with field name and value when title changes', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      const ControlledIssueForm = () => {
        const [values, setValues] = useState({})
        return (
          <IssueForm
            values={values}
            onChange={(field, value) => {
              setValues(prev => ({ ...prev, [field]: value }))
              handleChange(field, value)
            }}
            errors={{}}
          />
        )
      }
      
      render(<ControlledIssueForm />)
      
      const titleField = screen.getByLabelText(/Title/)
      await user.type(titleField, 'New Title')
      
      expect(handleChange).toHaveBeenLastCalledWith('title', 'New Title')
    })

    it('calls onChange with field name and value when description changes', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()

      const ControlledIssueForm = () => {
        const [values, setValues] = useState({})
        return (
          <IssueForm
            values={values}
            onChange={(field, value) => {
              setValues(prev => ({ ...prev, [field]: value }))
              handleChange(field, value)
            }}
            errors={{}}
          />
        )
      }
      
      render(<ControlledIssueForm />)
      
      const descriptionField = screen.getByLabelText(/Description/)
      await user.type(descriptionField, 'New Description')
      
      expect(handleChange).toHaveBeenLastCalledWith('description', 'New Description')
    })

    it('calls onChange with field name and value when status changes', async () => {
      const user = userEvent.setup()
      const handleChange = vi.fn()
      
      render(<IssueForm {...defaultProps} onChange={handleChange} />)
      
      const statusField = screen.getByLabelText(/Status/)
      await user.selectOptions(statusField, 'closed')
      
      expect(handleChange).toHaveBeenCalledWith('status', 'closed')
    })
  })

  describe('error display', () => {
    it('displays title error when provided', () => {
      const errors = { title: 'Title is required' }
      render(<IssueForm {...defaultProps} errors={errors} />)
      
      expect(screen.getByText('Title is required')).toBeInTheDocument()
    })

    it('displays description error when provided', () => {
      const errors = { description: 'Description is required' }
      render(<IssueForm {...defaultProps} errors={errors} />)
      
      expect(screen.getByText('Description is required')).toBeInTheDocument()
    })

    it('displays status error when provided', () => {
      const errors = { status: 'Invalid status' }
      render(<IssueForm {...defaultProps} errors={errors} />)
      
      expect(screen.getByText('Invalid status')).toBeInTheDocument()
    })
  })

  describe('disabled state', () => {
    it('disables all fields when isSubmitting is true', () => {
      render(<IssueForm {...defaultProps} isSubmitting={true} />)
      
      expect(screen.getByLabelText(/Title/)).toBeDisabled()
      expect(screen.getByLabelText(/Description/)).toBeDisabled()
      expect(screen.getByLabelText(/Status/)).toBeDisabled()
    })
  })
})
