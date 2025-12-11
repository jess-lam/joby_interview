import React from 'react'
import './TextField.css'

const TextField = ({
  id,
  label,
  value = '',
  onChange,
  error = null,
  required = false,
  disabled = false,
  placeholder = '',
  maxLength
}) => {
  const handleChange = (e) => {
    onChange(e.target.value)
  }

  return (
    <div className="text-field">
      <label htmlFor={id} className="text-field__label">
        {label}
        {required && (
          <span className="text-field__required">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        type="text"
        className={`text-field__input ${error ? 'text-field__input--error' : ''}`}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      {error && (
        <div
          id={`${id}-error`}
          className="text-field__error"
          role="alert"
        >
          {error}
        </div>
      )}
    </div>
  )
}

export default TextField
