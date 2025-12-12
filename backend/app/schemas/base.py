from pydantic import BaseModel as PydanticBaseModel, ConfigDict
from typing import Optional

class BaseSchema(PydanticBaseModel):
    model_config = ConfigDict(from_attributes=True)

class TimestampSchema(BaseSchema):
    created_at: int
    updated_at: int
