from pydantic_settings import BaseSettings
from pydantic import field_validator, ConfigDict
from typing import List, Union, Optional

class Settings(BaseSettings):
    model_config = ConfigDict(
        env_file=".env",
        case_sensitive=True
    )
    
    # Database
    DATABASE_URL: str
    
    # Test Database (optional, falls back to modifying DATABASE_URL)
    TEST_DATABASE_URL: Optional[str] = None
    
    # CORS - can be comma-separated string or list
    CORS_ORIGINS: Union[str, List[str]] = "http://localhost:5173,http://localhost:3000"
    
    @field_validator('CORS_ORIGINS', mode='before')
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(',') if origin.strip()]
        return v
    
    # Environment
    ENVIRONMENT: str = "development"

settings = Settings()
