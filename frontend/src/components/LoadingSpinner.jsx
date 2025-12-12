import PropTypes from 'prop-types'
import './LoadingSpinner.css'

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-spinner">
      <div className="spinner" aria-label="Loading"></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  )
}

LoadingSpinner.propTypes = {
  message: PropTypes.string
}

export default LoadingSpinner
