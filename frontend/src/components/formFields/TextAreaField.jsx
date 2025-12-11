import React from 'react'
import './TextAreaField.css'

const TextAreaField = ({
  id,
  label,
  value = '',
  onChange,
  error = null,
  required = false,
  disabled = false,
  placeholder = '',
  rows = 6,
  maxLength
}) => {
  const handleChange = (e) => {
    onChange(e.target.value)
  }

  return (
    <div className="text-area-field">
      <label htmlFor={id} className="text-area-field__label">
        {label}
        {required && (
          <span className="text-area-field__required">
            *
          </span>
        )}
      </label>
      <textarea
        id={id}
        className={`text-area-field__textarea ${error ? 'text-area-field__textarea--error' : ''}`}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
      />
      {error && (
        <div
          id={`${id}-error`}
          className="text-area-field__error"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  )
}

export default TextAreaField
