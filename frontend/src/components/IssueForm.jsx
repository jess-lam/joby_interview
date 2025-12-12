import PropTypes from 'prop-types'
import TextField from './formFields/TextField'
import TextAreaField from './formFields/TextAreaField'
import SelectField from './formFields/SelectField'
import { STATUS_OPTIONS } from '../utils/constants'
import './IssueForm.css'

const IssueForm = ({ values, onChange, errors, isSubmitting = false }) => {
  const handleFieldChange = (field, value) => {
    onChange(field, value)
  }

  return (
    <form className="issue-form" noValidate>
      <TextField
        id="issue-title"
        label="Title"
        value={values.title || ''}
        onChange={(value) => handleFieldChange('title', value)}
        error={errors.title}
        required
        disabled={isSubmitting}
        placeholder="Enter issue title"
        maxLength={200}
      />

      <TextAreaField
        id="issue-description"
        label="Description"
        value={values.description || ''}
        onChange={(value) => handleFieldChange('description', value)}
        error={errors.description}
        required
        disabled={isSubmitting}
        placeholder="Enter issue description"
        rows={6}
        maxLength={5000}
      />

      <SelectField
        id="issue-status"
        label="Status"
        value={values.status || 'open'}
        onChange={(value) => handleFieldChange('status', value)}
        options={STATUS_OPTIONS}
        error={errors.status}
        required
        disabled={isSubmitting}
      />
    </form>
  )
}

IssueForm.propTypes = {
  values: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    status: PropTypes.string
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    status: PropTypes.string
  }).isRequired,
  isSubmitting: PropTypes.bool
}

export default IssueForm
