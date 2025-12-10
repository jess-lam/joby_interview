from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.database import engine, Base
from app.api.v1.endpoints import issues

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Joby Interview API",
    description="FastAPI backend for Joby Interview project",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    issues.router,
    prefix="/api/v1",
)
