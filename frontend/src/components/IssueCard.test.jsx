import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithRouter } from '../tests/testUtils'
import { createMockIssue } from '../tests/testData'
import IssueCard from './IssueCard'

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('IssueCard', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  describe('rendering', () => {
    it('renders issue title', () => {
      const issue = createMockIssue({ title: 'Test Issue Title' })
      renderWithRouter(<IssueCard issue={issue} />)
      
      expect(screen.getByText('Test Issue Title')).toBeInTheDocument()
    })

    it('renders issue status', () => {
      const issue = createMockIssue({ status: 'open' })
      renderWithRouter(<IssueCard issue={issue} />)
      
      expect(screen.getByText('open')).toBeInTheDocument()
    })

    it('renders issue description', () => {
      const issue = createMockIssue({ description: 'This is a test description' })
      renderWithRouter(<IssueCard issue={issue} />)
      
      expect(screen.getByText('This is a test description')).toBeInTheDocument()
    })

    it('renders issue id', () => {
      const issue = createMockIssue({ id: 123 })
      renderWithRouter(<IssueCard issue={issue} />)
      
      expect(screen.getByText('#123')).toBeInTheDocument()
    })

    it('renders formatted created date', () => {
      const issue = createMockIssue({ created_at: 1705334400 })
      renderWithRouter(<IssueCard issue={issue} />)
      
      // formatDate formats to M/D/YYYY, so we check it contains the year
      expect(screen.getByText(/Created:/)).toBeInTheDocument()
      expect(screen.getByText(/2024/)).toBeInTheDocument()
    })
  })

  describe('description truncation', () => {
    it('displays full description when under 150 characters', () => {
      const shortDescription = 'A'.repeat(100)
      const issue = createMockIssue({ description: shortDescription })
      renderWithRouter(<IssueCard issue={issue} />)
      
      expect(screen.getByText(shortDescription)).toBeInTheDocument()
    })

    it('truncates description when over 150 characters', () => {
      const longDescription = 'A'.repeat(200)
      const issue = createMockIssue({ description: longDescription })
      renderWithRouter(<IssueCard issue={issue} />)
      
      const truncated = 'A'.repeat(150) + '...'
      expect(screen.getByText(truncated)).toBeInTheDocument()
    })

    it('adds ellipsis to truncated description', () => {
      const longDescription = 'B'.repeat(200)
      const issue = createMockIssue({ description: longDescription })
      renderWithRouter(<IssueCard issue={issue} />)
      
      expect(screen.getByText(/\.\.\./)).toBeInTheDocument()
    })
  })

  describe('user interaction', () => {
    it('navigates to issue page when clicked', async () => {
      const user = userEvent.setup()
      const issue = createMockIssue({ id: 42 })
      renderWithRouter(<IssueCard issue={issue} />)
      
      const card = screen.getByText(issue.title).closest('.issue-card')
      await user.click(card)
      
      expect(mockNavigate).toHaveBeenCalledTimes(1)
      expect(mockNavigate).toHaveBeenCalledWith('/issues/42')
    })
  })
})
