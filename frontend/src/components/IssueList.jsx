import PropTypes from 'prop-types'
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

IssueList.propTypes = {
  issues: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      title: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      created_at: PropTypes.number.isRequired
    })
  ).isRequired
}

export default IssueList
