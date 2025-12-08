# Joby Interview Project

A full-stack application with React frontend, FastAPI backend, and PostgreSQL database.

## Project Structure

- `backend/` - FastAPI application
- `frontend/` - React application
- `docker-compose.yml` - PostgreSQL database service

## Prerequisites

- Python 3.9+
- Node.js 18+
- Docker and Docker Compose (for PostgreSQL)
- PostgreSQL client (optional, for direct database access)

## Quick Start

### 1. Database Setup

Start PostgreSQL using Docker Compose:

```bash
docker-compose up -d
```

### 2. Backend Setup

```bash
cd backend
python3 -m venv venv
# Start the virtual env
source venv/bin/activate
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
alembic upgrade head

# Start the server
uvicorn app.main:app --reload
```

**Note:** If you encounter an error installing `psycopg2-binary` about `pg_config` not found, you need to install PostgreSQL client libraries. See `backend/INSTALL_TROUBLESHOOTING.md` for solutions.

Backend will be available at `http://localhost:8000`
API documentation at `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
cd frontend
npm install

# Copy environment file in backend
cp .env.example .env
# Edit .env with your API URL

# Start the development server
npm run dev - start the server
```

Frontend will be available at `http://localhost:5173` (or the port Vite assigns)

## Development

### Backend Development

- API endpoints are in `backend/app/api/v1/endpoints/`
- Database models are in `backend/app/models/`
- Pydantic schemas are in `backend/app/schemas/`
- Business logic is in `backend/app/services/`

### Frontend Development

- Components are in `frontend/src/components/`
- Pages are in `frontend/src/pages/`
- API services are in `frontend/src/services/`

## Database Migrations

```bash
cd backend

# Create a new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## Testing

### Backend
```bash
cd backend
pytest
```

### Frontend
```bash
cd frontend
npm test
```

## Environment Variables

See `.env.example` files in both `backend/` and `frontend/` directories for required environment variables.

## Documentation

- Backend API: `http://localhost:8000/docs` (Swagger UI)
- Backend API (Alternative): `http://localhost:8000/redoc` (ReDoc)

## Troubleshooting

If you encounter installation issues, especially with `psycopg2-binary`, see `backend/INSTALL_TROUBLESHOOTING.md` for solutions.

## Project Plan

See `PROJECT_PLAN.md` for detailed project structure and development workflow.

