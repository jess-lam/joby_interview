import PropTypes from 'prop-types'
import './SelectField.css'

const SelectField = ({
  id,
  label,
  value,
  onChange,
  options = [],
  error = null,
  required = false,
  disabled = false
}) => {
  const handleChange = (e) => {
    onChange(e.target.value)
  }

  return (
    <div className="select-field">
      <label htmlFor={id} className="select-field__label">
        {label}
        {required && (
          <span className="select-field__required">
            *
          </span>
        )}
      </label>
      <select
        id={id}
        className={`select-field__select ${error ? 'select-field__select--error' : ''}`}
        value={value}
        onChange={handleChange}
        disabled={disabled}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <div
          id={`${id}-error`}
          className="select-field__error"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  )
}

SelectField.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool
}

export default SelectField
