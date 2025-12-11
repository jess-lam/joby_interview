import React from 'react'
import { useNavigate } from 'react-router-dom'
import { formatDate } from '../utils/dateTimeUtils'
import './IssueCard.css'

const IssueCard = ({ issue }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/issues/${issue.id}`)
  }

  const truncateDescription = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text
    return `${text.substring(0, maxLength)}...`
  }

  return (
    <div className="issue-card" onClick={handleClick}>
      <div className="issue-card__header">
        <h3 className="issue-card__title">{issue.title}</h3>
        <span className={`issue-card__status issue-card__status--${issue.status}`}>
          {issue.status}
        </span>
      </div>
      
      <p className="issue-card__description">
        {truncateDescription(issue.description)}
      </p>
      
      <div className="issue-card__footer">
        <span className="issue-card__id">#{issue.id}</span>
        <span>
          Created: {formatDate(issue.created_at)}
        </span>
      </div>
    </div>
  )
}

export default IssueCard
