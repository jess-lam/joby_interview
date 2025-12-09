from sqlalchemy import Column, Integer
from sqlalchemy.sql import text
from app.database import Base


class BaseModel(Base):
    __abstract__ = True
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(Integer, nullable=False, server_default=text("EXTRACT(EPOCH FROM NOW())::INTEGER"))
    updated_at = Column(Integer, nullable=False, server_default=text("EXTRACT(EPOCH FROM NOW())::INTEGER"))


