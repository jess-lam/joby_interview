import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithRouter } from '../tests/testUtils'
import { createMockIssue, createMockIssues } from '../tests/testData'
import IssueList from './IssueList'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('IssueList', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  describe('empty state', () => {
    it('displays empty state message when issues array is empty', () => {
      renderWithRouter(<IssueList issues={[]} />)
      
      expect(screen.getByText('No issues found.')).toBeInTheDocument()
    })
  })

  describe('rendering issue cards', () => {
    it('renders single issue card when one issue is provided', () => {
      const issue = createMockIssue({ 
        id: 1, 
        title: 'Single Issue',
        description: 'This is a single issue'
      })
      
      renderWithRouter(<IssueList issues={[issue]} />)
      
      expect(screen.getByText('Single Issue')).toBeInTheDocument()
      expect(screen.getByText(/This is a single issue/)).toBeInTheDocument()
    })

    it('renders correct number of issue cards when multiple issues are provided', () => {
      const issues = createMockIssues(3)
      
      renderWithRouter(<IssueList issues={issues} />)
      
      expect(screen.getByText('Test Issue 1')).toBeInTheDocument()
      expect(screen.getByText('Test Issue 2')).toBeInTheDocument()
      expect(screen.getByText('Test Issue 3')).toBeInTheDocument()
    })

    it('passes correct issue data to each IssueCard', () => {
      const issues = [
        createMockIssue({ 
          id: 1, 
          title: 'First Issue',
          status: 'open'
        }),
        createMockIssue({ 
          id: 2, 
          title: 'Second Issue',
          status: 'closed'
        }),
      ]
      
      renderWithRouter(<IssueList issues={issues} />)
      
      expect(screen.getByText('First Issue')).toBeInTheDocument()
      expect(screen.getByText('Second Issue')).toBeInTheDocument()
      expect(screen.getByText('#1')).toBeInTheDocument()
      expect(screen.getByText('#2')).toBeInTheDocument()
      expect(screen.getByText('open')).toBeInTheDocument()
      expect(screen.getByText('closed')).toBeInTheDocument()
    })

    it('handles many issues correctly', () => {
      const issues = createMockIssues(10)
      
      renderWithRouter(<IssueList issues={issues} />)
      
      // Verify first and last issues are rendered
      expect(screen.getByText('Test Issue 1')).toBeInTheDocument()
      expect(screen.getByText('Test Issue 10')).toBeInTheDocument()
      
      // Verify all issue IDs are present
      expect(screen.getByText('#1')).toBeInTheDocument()
      expect(screen.getByText('#10')).toBeInTheDocument()
    })
  })
})
