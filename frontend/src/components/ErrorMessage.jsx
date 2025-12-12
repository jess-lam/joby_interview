import PropTypes from 'prop-types'
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

ErrorMessage.propTypes = {
  message: PropTypes.string,
  onDismiss: PropTypes.func
}

export default ErrorMessage
