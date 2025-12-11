import React from 'react'
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
// BOUNDARY CONDITION HELPERS
// ============================================================================

const shouldShowLeadingPageOne = (firstVisiblePage) => firstVisiblePage > 1

const shouldShowLeadingEllipsis = (firstVisiblePage) => firstVisiblePage > 2

const shouldShowTrailingLastPage = (lastVisiblePage, totalPages) => 
  lastVisiblePage < totalPages

const shouldShowTrailingEllipsis = (lastVisiblePage, totalPages) => 
  lastVisiblePage < totalPages - 1

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

const Ellipsis = () => (
  <span className="pagination__ellipsis">...</span>
)

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
  const firstVisiblePage = visiblePages[0]
  const lastVisiblePage = visiblePages[visiblePages.length - 1]
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

      {shouldShowLeadingPageOne(firstVisiblePage) && (
        <>
          <PageNumberButton 
            page={1} 
            isActive={false} 
            onPageChange={onPageChange} 
          />
          {shouldShowLeadingEllipsis(firstVisiblePage) && <Ellipsis />}
        </>
      )}

      {visiblePages.map((page) => (
        <PageNumberButton
          key={page}
          page={page}
          isActive={currentPage === page}
          onPageChange={onPageChange}
        />
      ))}

      {shouldShowTrailingLastPage(lastVisiblePage, totalPages) && (
        <>
          {shouldShowTrailingEllipsis(lastVisiblePage, totalPages) && <Ellipsis />}
          <PageNumberButton 
            page={totalPages} 
            isActive={false} 
            onPageChange={onPageChange} 
          />
        </>
      )}

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

export default Pagination
