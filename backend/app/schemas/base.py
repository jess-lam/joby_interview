from pydantic import BaseModel as PydanticBaseModel
from typing import Optional


class BaseSchema(PydanticBaseModel):
    class Config:
        from_attributes = True


class TimestampSchema(BaseSchema):
    created_at: int
    updated_at: int


