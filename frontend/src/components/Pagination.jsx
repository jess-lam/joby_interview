import PropTypes from 'prop-types'
import './Pagination.css'

// ============================================================================
// PAGE RANGE CALCULATION HELPERS
// ============================================================================

const calculateInitialRange = (currentPage, totalPages, maxVisible) => {
  const halfVisible = Math.floor(maxVisible / 2)
  return {
    start: Math.max(1, currentPage - halfVisible),
    end: Math.min(totalPages, currentPage + halfVisible)
  }
}

const adjustRangeForBoundaries = (start, end, totalPages, maxVisible) => {
  const rangeSize = end - start
  const desiredSize = maxVisible - 1
  
  if (rangeSize < desiredSize) {
    if (start === 1) {
      // Near start: extend end to show maxVisible pages
      return { start, end: Math.min(totalPages, start + desiredSize) }
    } else {
      // Near end: extend start backward to show maxVisible pages
      return { start: Math.max(1, end - desiredSize), end }
    }
  }
  
  return { start, end }
}

const getVisiblePageNumbers = (currentPage, totalPages, maxVisible) => {
  // If we can show all pages, return them all
  if (totalPages <= maxVisible) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  
  const initialRange = calculateInitialRange(currentPage, totalPages, maxVisible)
  
  // Adjust range if we're near boundaries
  const adjustedRange = adjustRangeForBoundaries(
    initialRange.start, 
    initialRange.end, 
    totalPages, 
    maxVisible
  )
  
  // Generate array of page numbers
  return Array.from(
    { length: adjustedRange.end - adjustedRange.start + 1 },
    (_, i) => adjustedRange.start + i
  )
}

// ============================================================================
// REUSABLE COMPONENTS
// ============================================================================

const NavigationButton = ({ onClick, disabled, ariaLabel, children, className = '' }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`pagination__btn ${className}`}
    aria-label={ariaLabel}
  >
    {children}
  </button>
)

NavigationButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  disabled: PropTypes.bool.isRequired,
  ariaLabel: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string
}

const PageNumberButton = ({ page, isActive, onPageChange }) => (
  <button
    onClick={() => onPageChange(page)}
    className={`pagination__btn ${isActive ? 'pagination__btn--active' : ''}`}
    aria-label={`Page ${page}`}
    aria-current={isActive ? 'page' : undefined}
  >
    {page}
  </button>
)

PageNumberButton.propTypes = {
  page: PropTypes.number.isRequired,
  isActive: PropTypes.bool.isRequired,
  onPageChange: PropTypes.func.isRequired
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange,
  showFirstLast = true,
  maxVisible = 5
}) => {

  if (totalPages <= 1) return null

  const visiblePages = getVisiblePageNumbers(currentPage, totalPages, maxVisible)
  const isFirstPage = currentPage === 1
  const isLastPage = currentPage === totalPages
  
  return (
    <nav className="pagination" aria-label="Issue pagination">
      {showFirstLast && (
        <NavigationButton
          onClick={() => onPageChange(1)}
          disabled={isFirstPage}
          ariaLabel="First page"
        >
          ««
        </NavigationButton>
      )}

      <NavigationButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirstPage}
        ariaLabel="Previous page"
      >
        «
      </NavigationButton>

      {visiblePages.map((page) => (
        <PageNumberButton
          key={page}
          page={page}
          isActive={currentPage === page}
          onPageChange={onPageChange}
        />
      ))}

      <NavigationButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLastPage}
        ariaLabel="Next page"
      >
        »
      </NavigationButton>

      {showFirstLast && (
        <NavigationButton
          onClick={() => onPageChange(totalPages)}
          disabled={isLastPage}
          ariaLabel="Last page"
        >
          »»
        </NavigationButton>
      )}
    </nav>
  )
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  showFirstLast: PropTypes.bool,
  maxVisible: PropTypes.number
}

export default Pagination
