import React from 'react'
import './ErrorMessage.css'

const ErrorMessage = ({ message, onDismiss }) => {
  if (!message) return null

  return (
    <div className="error-message" role="alert">
      <span className="error-text">{message}</span>
      {onDismiss && (
        <button 
          onClick={onDismiss} 
          className="error-close"
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default ErrorMessage
