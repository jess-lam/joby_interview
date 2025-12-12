import pytest
from fastapi import status
from app.models.issue import IssueStatus

# ==================== TEST CONSTANTS ====================

NONEXISTENT_ID = 99999
MAX_TITLE_LENGTH = 200
PAGINATION_PER_PAGE = 20
DEFAULT_PAGE = 1
TIME_OFFSET_SECONDS = 100
PAGINATION_TEST_ISSUE_COUNT = 25
ISSUES_ENDPOINT = "/api/v1/issues"

# ==================== LIST ISSUES (GET /api/v1/issues) ====================

def test_empty_list_issues(client):
    response = client.get(ISSUES_ENDPOINT)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["items"] == []
    assert data["total"] == 0
    assert data["page"] == DEFAULT_PAGE
    assert data["per_page"] == PAGINATION_PER_PAGE
    assert data["total_pages"] == 1

def test_list_issues_with_data(client, create_issue):
    create_issue(title="Test Issue 1", description="Description 1", status=IssueStatus.OPEN)
    create_issue(title="Test Issue 2", description="Description 2", status=IssueStatus.CLOSED)
    
    response = client.get(ISSUES_ENDPOINT)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data["items"]) == 2
    assert data["total"] == 2

def test_list_issues_pagination(client, create_multiple_issues):
    create_multiple_issues(PAGINATION_TEST_ISSUE_COUNT, status=IssueStatus.OPEN)
    
    # First page
    response = client.get(f"{ISSUES_ENDPOINT}?page={DEFAULT_PAGE}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data["items"]) == PAGINATION_PER_PAGE
    assert data["page"] == DEFAULT_PAGE
    assert data["total_pages"] == 2
    
    # Second page
    response = client.get(f"{ISSUES_ENDPOINT}?page=2")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data["items"]) == 5
    assert data["page"] == 2

@pytest.mark.parametrize("status_filter,expected_status", [
    ("open", IssueStatus.OPEN),
    ("closed", IssueStatus.CLOSED),
])
def test_list_issues_filter_by_status(client, create_issue, status_filter, expected_status):
    create_issue(title="Open Issue", description="Open", status=IssueStatus.OPEN)
    create_issue(title="Closed Issue", description="Closed", status=IssueStatus.CLOSED)
    
    response = client.get(f"{ISSUES_ENDPOINT}?status_filter={status_filter}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["status"] == status_filter

def test_list_issues_invalid_status_filter(client):
    response = client.get(f"{ISSUES_ENDPOINT}?status_filter=invalid")
    assert response.status_code == status.HTTP_400_BAD_REQUEST

def test_list_issues_sorting(client, create_issue):
    import time
    
    current_time = int(time.time())
    issue1 = create_issue(
        title="First",
        description="First",
        status=IssueStatus.OPEN,
        created_at=current_time - TIME_OFFSET_SECONDS,
        updated_at=current_time - TIME_OFFSET_SECONDS
    )

    issue2 = create_issue(
        title="Second",
        description="Second",
        status=IssueStatus.OPEN,
        created_at=current_time,
        updated_at=current_time
    )
    
    # Descending (default) - newest first
    response = client.get(f"{ISSUES_ENDPOINT}?sort=desc")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["items"][0]["title"] == "Second"
    assert data["items"][1]["title"] == "First"
    
    # Ascending - oldest first
    response = client.get(f"{ISSUES_ENDPOINT}?sort=asc")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["items"][0]["title"] == "First"
    assert data["items"][1]["title"] == "Second"

# ==================== CREATE ISSUE (POST /api/v1/issues) ====================

def test_create_issue_success(client):
    response = client.post(
        ISSUES_ENDPOINT,
        json={
            "title": "New Issue",
            "description": "This is a new issue",
            "status": "open"
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "New Issue"
    assert data["description"] == "This is a new issue"
    assert data["status"] == "open"

def test_create_issue_default_status(client):
    response = client.post(
        ISSUES_ENDPOINT,
        json={
            "title": "New Issue",
            "description": "Description"
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["status"] == "open"

def test_create_issue_missing_title(client):
    response = client.post(
        ISSUES_ENDPOINT,
        json={
            "description": "Description only"
        }
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT

def test_create_issue_missing_description(client):
    response = client.post(
        ISSUES_ENDPOINT,
        json={
            "title": "Title only"
        }
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT

def test_create_issue_whitespace_stripped(client):
    response = client.post(
        ISSUES_ENDPOINT,
        json={
            "title": "  Trimmed Title  ",
            "description": "  Trimmed Description  "
        }
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["title"] == "Trimmed Title"
    assert data["description"] == "Trimmed Description"

def test_create_issue_title_too_long(client):
    long_title = "a" * (MAX_TITLE_LENGTH + 1)
    response = client.post(
        ISSUES_ENDPOINT,
        json={
            "title": long_title,
            "description": "Description"
        }
    )
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_CONTENT

# ==================== GET ISSUE (GET /api/v1/issues/{id}) ====================

def test_get_issue_success(client, create_issue):
    issue = create_issue(title="Test Issue", description="Test Description", status=IssueStatus.OPEN)
    
    response = client.get(f"{ISSUES_ENDPOINT}/{issue.id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["id"] == issue.id
    assert data["title"] == "Test Issue"
    assert data["description"] == "Test Description"

def test_get_issue_not_found(client):
    response = client.get(f"{ISSUES_ENDPOINT}/{NONEXISTENT_ID}")
    assert response.status_code == status.HTTP_404_NOT_FOUND

# ==================== UPDATE ISSUE (PATCH /api/v1/issues/{id}) ====================

def test_update_issue_success(client, create_issue):
    issue = create_issue(title="Original", description="Original Desc", status=IssueStatus.OPEN)
    
    response = client.patch(
        f"{ISSUES_ENDPOINT}/{issue.id}",
        json={
            "title": "Updated Title",
            "status": "closed"
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "Updated Title"
    assert data["status"] == "closed"
    assert data["description"] == "Original Desc"

def test_update_issue_partial(client, create_issue):
    issue = create_issue(title="Original", description="Original Desc", status=IssueStatus.OPEN)
    
    response = client.patch(
        f"{ISSUES_ENDPOINT}/{issue.id}",
        json={
            "title": "New Title"
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["title"] == "New Title"
    assert data["description"] == "Original Desc"
    assert data["status"] == "open"

def test_update_issue_not_found(client):
    """Test updating non-existent issue returns 404"""
    response = client.patch(
        f"{ISSUES_ENDPOINT}/{NONEXISTENT_ID}",
        json={"title": "Updated"}
    )
    assert response.status_code == status.HTTP_404_NOT_FOUND

# ==================== DELETE ISSUE (DELETE /api/v1/issues/{id}) ====================

def test_delete_issue_success(client, create_issue):
    issue = create_issue(title="To Delete", description="Delete me", status=IssueStatus.OPEN)
    
    response = client.delete(f"{ISSUES_ENDPOINT}/{issue.id}")
    assert response.status_code == status.HTTP_204_NO_CONTENT
    
    # Verify issue is deleted
    get_response = client.get(f"{ISSUES_ENDPOINT}/{issue.id}")
    assert get_response.status_code == status.HTTP_404_NOT_FOUND

def test_delete_issue_not_found(client):
    response = client.delete(f"{ISSUES_ENDPOINT}/{NONEXISTENT_ID}")
    assert response.status_code == status.HTTP_404_NOT_FOUND
