from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from typing import Optional
from math import ceil
import logging
from app.database import get_db
from app.models.issue import Issue, IssueStatus
from app.schemas.issue import IssueCreate, IssueUpdate, IssueResponse, PaginatedIssueResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/issues", tags=["issues"])


@router.get("", response_model=PaginatedIssueResponse, status_code=status.HTTP_200_OK)
def list_issues(
    status_filter: Optional[str] = Query(None, description="Filter by status: 'open' or 'closed'"),
    sort: Optional[str] = Query("desc", description="Sort order: 'asc' or 'desc'"),
    page: int = Query(1, ge=1, description="Page number (starts at 1)"),
    db: Session = Depends(get_db)
):
    PER_PAGE = 20

    try:
        query = db.query(Issue)

        if status_filter:
            if status_filter not in ["open", "closed"]:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="status_filter must be 'open' or 'closed'"
                )
            query = query.filter(Issue.status == status_filter)

        if sort == "asc":
            query = query.order_by(Issue.created_at.asc())
        else:
            query = query.order_by(Issue.created_at.desc())

        total = query.count()

        offset = (page - 1) * PER_PAGE
        issues = query.offset(offset).limit(PER_PAGE).all()

        if total == 0:
            total_pages = 1
        else:
            total_pages = ceil(total / PER_PAGE)
        
        return PaginatedIssueResponse(
            items=issues,
            total=total,
            page=page,
            per_page=PER_PAGE,
            total_pages=total_pages
        )
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail="An unexpected error occurred while fetching the list of issues"
        )
    except SQLAlchemyError as e:
        logger.error(f"Database error listing issues: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected database error occurred while fetching issues"
        )


@router.get("/{issue_id}", response_model=IssueResponse, status_code=status.HTTP_200_OK)
def get_issue(
    issue_id: int,
    db: Session = Depends(get_db)
):
    try:
        issue = db.query(Issue).filter(Issue.id == issue_id).first()
        
        if not issue:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Issue with id {issue_id} not found"
            )
        
        return issue
    except HTTPException as e:
        raise HTTPException(
            status_code=e.status_code,
            detail="An unexpected error occurred while fetching the issue"
        )
    except SQLAlchemyError as e:
        logger.error(f"Database error fetching issue {issue_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected database error occurred while fetching the issue"
        )


@router.post("", response_model=IssueResponse, status_code=status.HTTP_201_CREATED)
def create_issue(
    issue_data: IssueCreate,
    db: Session = Depends(get_db)
):
    issue = Issue(
        title=issue_data.title,
        description=issue_data.description,
        status=issue_data.status
    )
    
    try:
        db.add(issue)
        db.commit()
        db.refresh(issue)
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error creating issue: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create issue due to data integrity constraint violation"
        )
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error creating issue: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected database error occurred"
        )
    
    return issue


@router.patch("/{issue_id}", response_model=IssueResponse, status_code=status.HTTP_200_OK)
def update_issue(
    issue_id: int,
    issue_data: IssueUpdate,
    db: Session = Depends(get_db)
):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with id {issue_id} not found"
        )
    
    update_data = issue_data.model_dump(exclude_unset=True, exclude_none=True)
    
    for field, value in update_data.items():
        setattr(issue, field, value)
    
    try:
        db.commit()
        db.refresh(issue)
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error updating issue {issue_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to update issue due to data integrity constraint violation"
        )
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error updating issue {issue_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected database error occurred"
        )
    
    return issue



@router.delete("/{issue_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_issue(
    issue_id: int,
    db: Session = Depends(get_db)
):
    issue = db.query(Issue).filter(Issue.id == issue_id).first()
    
    if not issue:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Issue with id {issue_id} not found"
        )
    
    try:
        db.delete(issue)
        db.commit()
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Database integrity error deleting issue {issue_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to delete issue due to data integrity constraint violation"
        )
    except SQLAlchemyError as e:
        db.rollback()
        logger.error(f"Database error deleting issue {issue_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected database error occurred"
        )
    
    return None
