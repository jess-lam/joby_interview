import pytest
from app.models.issue import Issue, IssueStatus

@pytest.fixture
def create_issue(db_session):
    def _create_issue(
        title="Test Issue",
        description="Test Description",
        status=IssueStatus.OPEN,
        **kwargs
    ):
        issue = Issue(
            title=title,
            description=description,
            status=status,
            **kwargs
        )
        db_session.add(issue)
        db_session.commit()
        db_session.refresh(issue)
        return issue
    return _create_issue


@pytest.fixture
def create_multiple_issues(db_session):
    def _create_multiple(count, **defaults):
        issues = [
            Issue(
                title=defaults.get('title', f"Issue {i}"),
                description=defaults.get('description', f"Description {i}"),
                status=defaults.get('status', IssueStatus.OPEN),
                **{k: v for k, v in defaults.items() 
                   if k not in ['title', 'description', 'status']}
            )
            for i in range(count)
        ]
        db_session.add_all(issues)
        db_session.commit()
        return issues
    return _create_multiple
