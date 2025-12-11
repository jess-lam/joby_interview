import React from 'react'
import IssueCard from './IssueCard'
import './IssueList.css'

const IssueList = ({ issues }) => {
  if (issues.length === 0) {
    return (
      <div className="issue-list__empty">
        <p>No issues found.</p>
      </div>
    )
  }

  return (
    <div className="issue-list">
      {issues.map(issue => (
        <IssueCard key={issue.id} issue={issue} />
      ))}
    </div>
  )
}

export default IssueList
