import React from 'react'
import './LoadingSpinner.css'

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-spinner">
      <div className="spinner" aria-label="Loading"></div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  )
}

export default LoadingSpinner
