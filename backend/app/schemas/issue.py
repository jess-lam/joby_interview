from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from app.schemas.base import BaseSchema, TimestampSchema
from app.models.issue import IssueStatus

TITLE_FIELD_CONSTRAINTS = {
    "min_length": 1,
    "max_length": 200,
    "description": "Issue title (1-200 characters)"
}

DESCRIPTION_FIELD_CONSTRAINTS = {
    "min_length": 1,
    "max_length": 5000,
    "description": "Issue description (1-5000 characters)"
}

def validate_and_strip_text(value: str) -> str:
    if not value or not value.strip():
        raise ValueError("Field cannot be blank")
    return value.strip()


def validate_and_strip_optional_text(value: Optional[str]) -> Optional[str]:
    if value is not None:
        return validate_and_strip_text(value)
    return value


class IssueBase(BaseSchema):
    title: str
    description: str
    status: IssueStatus = IssueStatus.OPEN


class IssueCreate(IssueBase):
    title: str = Field(**TITLE_FIELD_CONSTRAINTS)
    description: str = Field(**DESCRIPTION_FIELD_CONSTRAINTS)
    status: IssueStatus = Field(
        default=IssueStatus.OPEN,
        description="Issue status (required, default: 'open')"
    )
    
    @field_validator('title')
    @classmethod
    def validate_title(cls, v: str) -> str:
        return validate_and_strip_text(v)
    
    @field_validator('description')
    @classmethod
    def validate_description(cls, v: str) -> str:
        return validate_and_strip_text(v)


class IssueUpdate(BaseSchema):
    title: Optional[str] = Field(default=None, **TITLE_FIELD_CONSTRAINTS)
    description: Optional[str] = Field(default=None, **DESCRIPTION_FIELD_CONSTRAINTS)
    status: Optional[IssueStatus] = Field(
        default=None,
        description="Issue status"
    )
    
    @field_validator('title')
    @classmethod
    def validate_title_if_present(cls, v: Optional[str]) -> Optional[str]:
        return validate_and_strip_optional_text(v)
    
    @field_validator('description')
    @classmethod
    def validate_description_if_present(cls, v: Optional[str]) -> Optional[str]:
        return validate_and_strip_optional_text(v)


class IssueResponse(IssueBase, TimestampSchema):
    id: int
    title: str
    description: str
    status: IssueStatus
    created_at: int
    updated_at: int
    
    class Config:
        from_attributes = True


class PaginatedIssueResponse(BaseModel):
    items: List[IssueResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
