from pydantic import BaseModel as PydanticBaseModel
from datetime import datetime
from typing import Optional


class BaseSchema(PydanticBaseModel):
    """Base schema with common fields"""
    class Config:
        from_attributes = True  # Allows conversion from ORM models


class TimestampSchema(BaseSchema):
    """Schema with timestamp fields"""
    created_at: datetime
    updated_at: datetime


