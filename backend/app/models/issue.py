from sqlalchemy import Column, String, Enum
from app.models.base import BaseModel
import enum

class IssueStatus(enum.Enum):
    OPEN = "open"
    CLOSED = "closed"

class Issue(BaseModel):
    __tablename__ = 'issues'
    
    title = Column(String(200), nullable=False)
    description = Column(String(5000), nullable=False)
    status = Column(
        Enum(IssueStatus, values_callable=lambda x: [e.value for e in x], name='issue_status', native_enum=True),
        nullable=False, 
        server_default='open'
    )
