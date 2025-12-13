# Joby Interview Project

A full-stack application with React frontend, FastAPI backend, and PostgreSQL database.

## Overview

This is an issue tracker application that allows users to create, view, update, and delete issues (similar to GitHub issues). Users can manage issues with titles, descriptions, and status (open/closed), with features including filtering, sorting, and pagination.

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

# Start the development server
npm run dev
```

Frontend will be available at `http://localhost:5173` (or the port Vite assigns)

## Development

### Backend Development

- API endpoints are in `backend/app/api/v1/endpoints/`
- Database models are in `backend/app/models/`
- Pydantic schemas are in `backend/app/schemas/`

### Frontend Development

- Components are in `frontend/src/components/`
- Pages are in `frontend/src/pages/`
- API services are in `frontend/src/services/`
- Custom hooks are in `frontend/src/hooks/`
- Utility functions are in `frontend/src/utils/`

## Database Migrations

```bash
cd backend

# Start virtual env
source venv/bin/activate

# Apply migrations
alembic upgrade head

```

## Seeding the Database

To populate the database with dummy data (100 issues):

```bash
cd backend

# Activate virtual environment (if not already active)
source venv/bin/activate

# Run the seed script
python alembic/seeds/seed_issues.py
```

**Expected output:**
```
Starting seed process...
Executing seed SQL...
✅ Successfully seeded issues!

Summary:
  closed: 33 issues
  open: 67 issues
```

**What the seed script does:**
- Generates 100 issues with varied titles, descriptions, and statuses
- Creates timestamps spread over the past 60 days
- Approximately 70% open issues, 30% closed issues
- Shows a summary of created issues by status

**Note:** 
- The seed script uses a SQL file (`backend/alembic/seeds/seed_issues.sql`) wrapped in a transaction, so all inserts are atomic
- If any error occurs, the transaction will be rolled back automatically
- Make sure your database migrations are up to date (`alembic upgrade head`) before running the seed script

## Testing

### Backend

**Prerequisites:**
- PostgreSQL must be running (same as development setup)
- Virtual environment activated
- Dependencies installed (`pytest` and `httpx` are included in `requirements.txt`)

**Run all tests:**
```bash
cd backend

# Activate virtual environment (if not already active)
source venv/bin/activate

# Run all tests
pytest
```

**Test Database:**
- Tests automatically create and use a separate test database (`joby_test_db`)
- The test database is created automatically if it doesn't exist
- Each test runs in isolation with transaction rollback (no manual cleanup needed)
- Uses the same PostgreSQL instance as development

**Test Coverage:**
The test suite covers all CRUD endpoints:
- **List Issues**: Empty list, pagination, filtering by status, sorting
- **Create Issue**: Success cases, validation, default values, whitespace handling
- **Get Issue**: Success and not found cases
- **Update Issue**: Full and partial updates, not found cases
- **Delete Issue**: Success and not found cases

**Run specific tests:**
```bash
# Run with verbose output
pytest -v

# Run a specific test file
pytest tests/test_issues.py

# Run a specific test
pytest tests/test_issues.py::test_create_issue_success


```

### Frontend

**Prerequisites:**
- Node.js 18+ installed
- Dependencies installed (`npm install` in `frontend/` directory)
- No backend server required (tests use MSW to mock API calls)

**Run all tests:**
```bash
cd frontend

# Run all tests once
npm test

```

**Test Environment:**
- Tests use Vitest as the test runner
- React Testing Library for component testing
- MSW (Mock Service Worker) for API mocking - no backend required
- jsdom environment for DOM testing
- Tests are automatically isolated (data resets between tests)

**Test Structure:**
- Component tests: Co-located with components (e.g., `src/components/IssueCard.test.jsx` next to `IssueCard.jsx`)
- Hook tests: Co-located with hooks (e.g., `src/hooks/useIssueForm.test.js` next to `useIssueForm.js`)
- Utility tests: Co-located with utilities (e.g., `src/utils/dateTimeUtils.test.js` next to `dateTimeUtils.js`)
- Test utilities: `src/tests/` (setup, testUtils, testData)
- API mocks: `tests/mocks/` (MSW handlers)

**Test Coverage:**
The test suite covers:
- **Components**: Form fields, cards, filters, pagination, lists
- **Hooks**: Form management, data fetching, error handling
- **Pages**: Full page integration tests with routing
- **Utilities**: Date formatting, URL parameter handling

**Run specific tests:**
```bash
# Run with verbose output
npm test -- --reporter=verbose

# Run a specific test file
npm test -- src/components/IssueCard.test.jsx

# Run tests matching a pattern
npm test -- --grep "IssueCard"

# Run tests in watch mode with UI
npm run test:watch -- --ui
```

**Writing Tests:**
- Use `renderWithRouter()` from `src/tests/testUtils.jsx` for components that use routing
- Use test data from `src/tests/testData.js` for test data
- MSW automatically mocks all API calls - no manual mocking needed

## Environment Variables

See `.env.example` files in `backend/` directory for required environment variables.

## Documentation

- Backend API: `http://localhost:8000/docs` (Swagger UI)

## Troubleshooting

If you encounter installation issues, especially with `psycopg2-binary`, see `backend/INSTALL_TROUBLESHOOTING.md` for solutions.
