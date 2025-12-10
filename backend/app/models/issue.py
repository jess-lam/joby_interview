from sqlalchemy import Column, String, Enum
from app.models.base import BaseModel
import enum


class IssueStatus(enum.Enum):
    OPEN = "open"
    CLOSED = "closed"
    
    @property
    def display_name(self) -> str:
        return self.name.capitalize()
    
    @classmethod
    def from_string(cls, value: str) -> "IssueStatus":
        """Convert string to enum, case-insensitive."""
        value_lower = value.lower()
        for status in cls:
            if status.value == value_lower:
                return status
        raise ValueError(f"Invalid status: {value}")


class Issue(BaseModel):
    __tablename__ = 'issues'
    
    title = Column(String(200), nullable=False)
    description = Column(String(5000), nullable=False)
    status = Column(
        Enum(IssueStatus, values_callable=lambda x: [e.value for e in x], name='issue_status', native_enum=True),
        nullable=False, 
        server_default='open'
    )

    @classmethod
    def open(cls, db):
        return db.query(cls).filter(cls.status == IssueStatus.OPEN)
    
    @classmethod
    def closed(cls, db):
        return db.query(cls).filter(cls.status == IssueStatus.CLOSED)
    
    @classmethod
    def recent(cls, db):
        return db.query(cls).order_by(cls.created_at.desc())
