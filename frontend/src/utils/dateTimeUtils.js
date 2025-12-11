const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'numeric',
  day: 'numeric',
  year: 'numeric'
})

/**
 * Format Unix timestamp as date only (no time)
 * Format: "12/10/2025"
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string}
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp * 1000)
  return dateFormatter.format(date)
}

/**
 * Format Unix timestamp as date and time
 * Format: "12/10/2025 at 3:45 pm"
 * @param {number} timestamp - Unix timestamp in seconds
 * @returns {string}
 */
export const formatDateTime = (timestamp) => {
  if (!timestamp) return 'N/A'
  const date = new Date(timestamp * 1000)
  
  const dateString = dateFormatter.format(date)

  const timeString = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date)
  
  return `${dateString} at ${timeString}`
}

