# Issue Tracker Project - Implementation Plan

## Project Overview

Build a full-stack issue tracker application where users can create, view, update, and delete issues (similar to GitHub issues)

## Technology Stack

- **Backend**: FastAPI (Python)
- **Frontend**: React with Vite
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **API Client**: Axios (already configured)
- **State Management**: Custom React Hooks (useIssueList, useIssueForm, useIssueShow)

---

## Phase 1: Database Setup & Schema Design

### 1.1 Database Schema Design

**Table: `issues`**
- `id` (Integer, Primary Key, Auto-increment)
- `title` (String, Required, Max length ~200 chars)
- `description` (String, Required, Max length ~5000 chars)
- `status` (Enum: "open" | "closed", Default: "open")
- `created_at` (Integer, Unix timestamp, Required)
- `updated_at` (Integer, Unix timestamp, Required, for tracking updates)

**Indexes:**
- Primary index on `id` (automatic)
- Index on `status` (for filtering open/closed issues)
- Index on `created_at` (for sorting by creation date)

### 1.2 Migration Strategy
- Use Alembic to create and manage migrations
- Create initial migration for `issues` table
- Ensure indexes are included in migration

### 1.3 Seed with dummy data
- Create a script to seed data

---

## Phase 2: Backend Development

### 2.1 Database Model (SQLAlchemy)

**File**: `backend/app/models/issue.py`

**Base Model Architecture:**
- `BaseModel` (in `app/models/base.py`) provides common fields:
  - `id`: Integer primary key
  - `created_at`: Unix timestamp (auto-generated)
  - `updated_at`: Unix timestamp (auto-generated)

**Issue Model:**
- Define `Issue` class inheriting from `BaseModel`
- `title`: String(200), required
- `description`: String(5000), required
- `status`: Enum (IssueStatus.OPEN | IssueStatus.CLOSED), default "open"
- Uses `IssueStatus` enum class for type safety

### 2.2 Pydantic Schemas

**File**: `backend/app/schemas/issue.py`

**Base Schema Architecture:**
- `BaseSchema`: Base Pydantic model with `from_attributes=True` for SQLAlchemy ORM
- `TimestampSchema`: Extends BaseSchema with `created_at` and `updated_at` fields

**Issue Schemas:**
- `IssueBase`: Base schema with common fields (title, description, status)
- `IssueCreate`: For POST requests
  - `title`: Required, min 1 char, max 200 chars (auto-stripped)
  - `description`: Required, min 1 char, max 5000 chars (auto-stripped)
  - `status`: IssueStatus enum, default OPEN
  - Field validators strip whitespace and reject blank values
- `IssueUpdate`: For PATCH requests (all fields optional)
  - Same validation rules as IssueCreate, but all fields optional
  - Only updates fields that are provided
- `IssueResponse`: For GET responses
  - Extends IssueBase and TimestampSchema
  - Includes `id`, `created_at`, `updated_at`
- `PaginatedIssueResponse`: For paginated list responses
  - `items`: List of IssueResponse
  - `total`, `page`, `per_page`, `total_pages`: Pagination metadata

### 2.3 API Endpoints

**File**: `backend/app/api/v1/endpoints/issues.py`

**Router Configuration**: 
- Router defined with `prefix="/issues"` and `tags=["issues"]`
- When included in main app with `app.include_router(router, prefix="/api/v1")`, final routes will be:
  - `/api/v1/issues` (GET, POST)
  - `/api/v1/issues/{issue_id}` (GET, PUT, PATCH, DELETE)

Implement CRUD endpoints:

1. **GET `/api/v1/issues`** - List all issues (paginated)
   - Query parameters:
     - `status_filter` (optional): Filter by status ("open" or "closed")
     - `sort` (optional, default: "desc"): Sort order ("asc" or "desc")
     - `page` (optional, default: 1): Page number (starts at 1)
   - Returns: `PaginatedIssueResponse` with items array and pagination metadata
   - Error handling: 400 if invalid status_filter value
   - Pagination: 20 items per page

2. **GET `/api/v1/issues/{issue_id}`** - Get single issue
   - Path parameter: `issue_id` (integer, auto-validated by FastAPI)
   - Request body: `IssueCreate` schema (automatically validated)
   - Returns: `IssueResponse`
   - Error handling: 404 if issue not found

3. **POST `/api/v1/issues`** - Create new issue
   - Request body: `IssueCreate` schema (automatically validated)
   - Returns: `IssueResponse` with status 201 Created
   - Redirects back to `/api/v1/issues/{issue_id}`
   - Validation: Automatic via Pydantic schema (422 if invalid)
   - Note: No manual validation checks needed - FastAPI handles it

4. **PATCH `/api/v1/issues/{issue_id}`** - Update issue (partial update)
   - Path parameter: `issue_id` (integer)
   - Request body: `IssueUpdate` schema (all fields optional)
   - Returns: `IssueResponse`
   - Error handling: 404 if issue not found
   - Updates only provided fields (exclude_unset=True, exclude_none=True)
   - Handles database integrity errors with rollback


5. **DELETE `/api/v1/issues/{issue_id}`** - Delete issue
   - Path parameter: `issue_id` (integer)
   - Redirects back to `/api/v1/issues/{issue_id}`
   - Error handling: 404 if issue not found

### 2.4 Error Handling

Implement consistent error handling:
- **422**: Unprocessable Entity (automatic - Pydantic validation failures)
- **400**: Bad Request (invalid query parameters, integrity constraint violations)
- **404**: Not Found (issue doesn't exist)
- **500**: Internal Server Error (database errors)
- Use FastAPI's `HTTPException` for manual error responses
- Pydantic schemas automatically return 422 with detailed validation errors
- Return structured error responses with `detail` field
- Logging: Database errors are logged for debugging
- Transaction management: Proper rollback on database errors

### 2.5 Router Registration

**File**: `backend/app/main.py`

- Create router for issues endpoints with `prefix="/issues"` and `tags=["issues"]` in the endpoints file
- Include router in main FastAPI app with prefix `/api/v1`
- Final routes will be: `/api/v1/issues`, `/api/v1/issues/{issue_id}`, etc.
- Tags will automatically appear in FastAPI's auto-generated documentation at `/docs`

### 2.6 Database Session Management

Ensure proper database session handling:
- Use dependency injection for `get_db()`
- Proper session cleanup in all endpoints
- Handle database errors gracefully

---

## Phase 3: Frontend Development

### 3.1 API Service Layer

**File**: `frontend/src/services/issues.js`

Create service functions matching the backend endpoints:

- `getIssues({ statusFilter, sort, page })` - GET `/api/v1/issues`
  - Query params: `status_filter` (optional), `sort` (optional, default: "desc"), `page` (optional, default: 1)
  - Returns: Promise resolving to paginated response object with `items`, `total`, `page`, `per_page`, `total_pages`

- `getIssue(id)` - GET `/api/v1/issues/{issue_id}`
  - Returns: Promise resolving to single issue object

- `createIssue(issueData)` - POST `/api/v1/issues`
  - Body: `{ title, description, status }`
  - Returns: Promise resolving to created issue

- `updateIssue(id, issueData)` - PATCH `/api/v1/issues/{issue_id}`
  - Body: `{ title?, description?, status? }` (all optional)
  - Returns: Promise resolving to updated issue

- `deleteIssue(id)` - DELETE `/api/v1/issues/{issue_id}`
  - Returns: Promise resolving to null (204 No Content)

Each function should:
- Use axios instance from `api.js`
- Handle errors appropriately (422 validation errors, 404 not found, etc.)
- Return promises for component use
- Include proper error messages for user feedback

### 3.2 Custom Hooks Architecture

**Architecture Decision:** Custom hooks - each hook manages its own localized state and calls services directly.

#### 3.2.1 useIssueList Hook

**File**: `frontend/src/hooks/useIssueList.js`

**Purpose:** Manage state and logic for the IssueListPage

**State:**
- `issues`: array of issues (local to this hook)
- `loading`: boolean for loading state
- `error`: error message string (null if no error)
- `pagination`: { page, per_page, total, total_pages }
- `filters`: { statusFilter, sort }

**Functions:**
- `fetchIssues(options)` - Fetch issues with filters and pagination
- `clearError()` - Clear error state

**Features:**
- URL param synchronization (reads from URL on mount, updates URL on filter/page change)
- Automatic fetching on mount with URL params
- Calls `issuesService.getIssues()` directly

#### 3.2.2 useIssueForm Hook

**File**: `frontend/src/hooks/useIssueForm.js`

**Purpose:** Manage form state and validation for CreateIssuePage and EditIssuePage

**State:**
- `formValues`: { title, description, status }
- `fieldErrors`: { title, description, status } - validation errors from backend
- `loading`: boolean for form submission
- `error`: general error message
- `hasChanges`: boolean indicating if form values differ from original

**Functions:**
- `handleFieldChange(field, value)` - Update form field value
- `handleCreate()` - Create new issue
- `handleUpdate(id)` - Update existing issue (only sends changed fields)
- `initializeFromValues(values)` - Initialize form from issue data
- `clearError()` - Clear error state

**Features:**
- Backend validation error mapping (422 errors mapped to field errors)
- Change detection (only sends changed fields on update)
- Text trimming and validation
- Calls `issuesService.createIssue()` and `updateIssue()` directly

#### 3.2.3 useIssueShow Hook

**File**: `frontend/src/hooks/useIssueShow.js`

**Purpose:** Manage state for ShowIssuePage

**State:**
- `issue`: single issue object (null if not loaded)
- `loading`: boolean for loading state
- `error`: error message string (null if no error)

**Functions:**
- `fetchIssue(id)` - Fetch single issue by ID
- `handleDelete(id)` - Delete issue
- `clearError()` - Clear error state

**Features:**
- Calls `issuesService.getIssue()` and `deleteIssue()` directly

### 3.3 React Components

#### 3.3.1 Issue List Page

**File**: `frontend/src/pages/IssueListPage.jsx`

Features:
- Uses `useIssueList()` hook for state management
- Uses `useNavigate()` from react-router-dom for navigation
- Displays list of issues using `IssueList` component
- Shows pagination controls and filters
- Each issue card is clickable → navigates to `/issues/:id` (show page)
- "Create Issue" button → navigates to `/issues/new` route
- Empty state when no issues
- Loading spinner while fetching
- Error message display
- URL params sync (filters and pagination preserved in URL)

**Components Used:**
- `IssueList`: Renders list of issue cards
- `IssueCard`: Individual issue card component
- `IssueFilters`: Filter and sort controls
- `Pagination`: Pagination controls
- `PaginationInfo`: Pagination metadata display
- `LoadingSpinner`: Loading indicator
- `ErrorMessage`: Error display

#### 3.3.2 Create Issue Page

**File**: `frontend/src/pages/CreateIssuePage.jsx`

Features:
- Uses `useIssueForm()` hook for form state
- Uses `useNavigate()` for navigation
- Form fields: title (required), description (required), status (dropdown)
- **Save button**: 
  - Calls `handleCreate()` from hook
  - On success: Navigates to `/issues/:id` (show page)
- **Cancel button**: 
  - Navigates back to `/issues` (list page)
- Display validation errors (from backend)
- Loading state during submission
- Page title: "Create Issue"

**Components Used:**
- `IssueForm`: Reusable form component
- `TextField`, `TextAreaField`, `SelectField`: Form field components
- `LoadingSpinner`: Loading indicator
- `ErrorMessage`: Error display

#### 3.3.3 Edit Issue Page

**File**: `frontend/src/pages/EditIssuePage.jsx`

Features:
- Uses `useIssueShow()` hook to fetch issue data
- Uses `useIssueForm()` hook for form state
- Uses `useParams()` to get issue ID from route
- Uses `useEffect` to fetch issue data on mount
- Uses `useEffect` to initialize form when issue data loads
- Form fields: title (required), description (required), status (dropdown)
- **Save button**: 
  - Calls `handleUpdate(id)` from hook (only sends changed fields)
  - On success: Navigates to `/issues/:id` (show page)
- **Delete button**: 
  - Shows confirmation dialog
  - Calls `handleDelete(id)` from `useIssueShow` hook
  - On success: Navigates to `/issues` (list page)
- **Cancel button**: 
  - Navigates back to `/issues/:id` (show page)
- Display validation errors (from backend)
- Loading states for both fetching and submitting
- Page title: "Edit Issue"

**Components Used:**
- `IssueForm`: Reusable form component
- `TextField`, `TextAreaField`, `SelectField`: Form field components
- `LoadingSpinner`: Loading indicator
- `ErrorMessage`: Error display

#### 3.3.4 Show Issue Page

**File**: `frontend/src/pages/ShowIssuePage.jsx`

Features:
- Uses `useIssueShow()` hook to fetch issue data
- Uses `useParams()` to get issue ID from route
- Displays issue in read-only format
- Shows: title, description, status, created_at, updated_at (formatted)
- **Edit button**: Navigates to `/issues/:id/edit`
- **Delete button**: 
  - Shows confirmation dialog
  - Calls `handleDelete(id)` from hook
  - On success: Navigates to `/issues` (list page)
- **Back button**: Navigates to `/issues` (list page)
- Loading spinner while fetching
- Error message display
- Page title: "Issue #{id}"

**Components Used:**
- `LoadingSpinner`: Loading indicator
- `ErrorMessage`: Error display

#### 3.3.5 Reusable Components

**Form Components** (`frontend/src/components/formFields/`):
- `TextField.jsx`: Text input with label and error display
- `TextAreaField.jsx`: Textarea with label and error display
- `SelectField.jsx`: Select dropdown with label and error display

**List Components**:
- `IssueList.jsx`: Container for list of issues
- `IssueCard.jsx`: Individual issue card (clickable, shows title, description, status, date)
- `IssueFilters.jsx`: Filter and sort controls

**Utility Components**:
- `IssueForm.jsx`: Reusable form component (used by Create and Edit pages)
- `LoadingSpinner.jsx`: Loading indicator
- `ErrorMessage.jsx`: Error message display with dismiss
- `Pagination.jsx`: Pagination controls
- `PaginationInfo.jsx`: Pagination metadata display


### 3.4 Routing Setup

**File**: `frontend/src/App.jsx`

Features:
- Set up React Router with `BrowserRouter`
- Define routes:
  - `/` → Redirects to `/issues`
  - `/issues` → `IssueListPage` (default/main page)
  - `/issues/new` → `CreateIssuePage` (create mode)
  - `/issues/:id` → `ShowIssuePage` (read-only view)
  - `/issues/:id/edit` → `EditIssuePage` (edit mode)
  - `*` → Redirects to `/issues` (404 fallback)
- Use `Routes` and `Route` components from react-router-dom
- No Context Provider wrapper needed (hooks manage their own state)

**File Structure:**
- App.jsx handles routing configuration
- Pages are in `frontend/src/pages/`
- Components are in `frontend/src/components/`
- Hooks are in `frontend/src/hooks/`
- Services are in `frontend/src/services/`
- Utils are in `frontend/src/utils/`

### 3.5 Main App Component Layout

**File**: `frontend/src/components/Layout.jsx` (Optional)

Features:
- Common layout wrapper for all pages
- Header with title "Issue Tracker"
- Navigation
- Footer (optional)
- Error boundary (optional)
- Global loading indicator (optional)

### 3.6 Utility Functions

**File**: `frontend/src/utils/dateTimeUtils.js`

Functions:
- `formatDate(timestamp)` - Convert Unix timestamp to readable date
- `formatDateTime(timestamp)` - Convert Unix timestamp to readable date and time

### 3.7 Error Handling & User Feedback

**Optimizations:**
- Success notifications after create/update/delete (toast or inline message)
- Error messages displayed clearly
- Loading states for all async operations
- Confirmation dialogs for destructive actions (delete)
- Form validation feedback (real-time or on submit)
- Redirect to list page after successful operations
- Back button functionality with navigation

- Display error messages to user
- Show success messages after operations
- Loading states for all async operations
- Form validation feedback
- Confirmation dialogs for delete operations

---

## Phase 4: Integration & Testing

### 4.1 Backend Testing

- Test each API endpoint manually using FastAPI docs (`/docs`)
- Test with valid data
- Test with invalid data (validation)
- Test error cases (404, etc.)

### 4.2 Frontend-Backend Integration

- Verify CORS is properly configured
- Test all CRUD operations from frontend
- Verify data persistence
- Test error scenarios

### 4.3 End-to-End Testing

- Create issue from frontend
- View issue list
- Update issue
- Delete issue
- Verify all operations work together

---

## Phase 5: Polish & Enhancement (Optional)

### 5.1 UI/UX Improvements

- Better styling and layout
- Responsive design
- Status badges with colors
- Date formatting improvements
- Loading skeletons instead of "Loading..." text

### 5.2 Additional Features (Optional)

- Search/filter functionality
- Pagination
- Sort by different fields
- Issue count display
- Confirmation modals for delete

---

## File Structure Summary

### Backend Files Structure:

```
backend/
├── app/
│   ├── models/
│   │   ├── base.py
│   │   └── issue.py
│   ├── schemas/
│   │   ├── base.py
│   │   └── issue.py
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/
│   │           └── issues.py
│   ├── database.py
│   ├── config.py
│   └── main.py
└── alembic/
    └── versions/
        └── XXXX_create_issues_table.py
```

### Frontend Files Structure:

```
frontend/
├── src/
│   ├── components/
│   │   ├── formFields/
│   │   │   ├── TextField.jsx
│   │   │   ├── TextAreaField.jsx
│   │   │   └── SelectField.jsx
│   │   ├── IssueCard.jsx
│   │   ├── IssueList.jsx
│   │   ├── IssueForm.jsx
│   │   ├── IssueFilters.jsx
│   │   ├── Pagination.jsx
│   │   ├── PaginationInfo.jsx
│   │   ├── LoadingSpinner.jsx
│   │   └── ErrorMessage.jsx
│   ├── pages/
│   │   ├── IssueListPage.jsx
│   │   ├── CreateIssuePage.jsx
│   │   ├── ShowIssuePage.jsx
│   │   └── EditIssuePage.jsx
│   ├── hooks/
│   │   ├── useIssueList.js
│   │   ├── useIssueForm.js
│   │   └── useIssueShow.js
│   ├── services/
│   │   └── issues.js
│   ├── utils/
│   │   └── dateTimeUtils.js
│   └── App.jsx
```

---

## Implementation Order

1. **Database & Model** (Backend foundation)
   - Create BaseModel with timestamps
   - Create Issue model with IssueStatus enum
   - Create Alembic migration
   - Run migration

2. **Backend API** (API layer)
   - Create base schemas (BaseSchema, TimestampSchema)
   - Create Issue Pydantic schemas with validation
   - Implement API endpoints (with pagination)
   - Register router in `main.py`
   - Test endpoints with FastAPI docs at `/docs`

3. **Frontend Service** (API integration)
   - Create issues service functions (with pagination support)
   - Test service functions

4. **Frontend Hooks** (State management)
   - Create useIssueList hook (with URL param sync)
   - Create useIssueForm hook (with validation error mapping)
   - Create useIssueShow hook

5. **Frontend Routing** (Navigation)
   - Set up React Router in App.jsx
   - Define routes: /issues, /issues/new, /issues/:id, /issues/:id/edit

6. **Frontend Components** (UI layer)
   - Create reusable form field components
   - Create IssueCard, IssueList, IssueFilters components
   - Create Pagination components
   - Create LoadingSpinner, ErrorMessage components
   - Create IssueForm reusable component

7. **Frontend Pages** (UI layer)
   - Create IssueListPage (with filters and pagination)
   - Create CreateIssuePage
   - Create ShowIssuePage
   - Create EditIssuePage
   - Add navigation between pages

8. **Integration & Testing** (End-to-end)
   - Test full workflow with routing
   - Test navigation between pages
   - Test create, edit, delete flows
   - Test pagination and filtering
   - Fix any issues
   - Polish UI/UX

---

## Success Criteria

✅ Users can create issues with title, description, and status  
✅ Users can view a list of all issues with pagination  
✅ Users can filter issues by status (open/closed)  
✅ Users can sort issues by creation date (asc/desc)  
✅ Users can view a single issue (read-only page)  
✅ Users can update existing issues (partial updates)  
✅ Users can delete issues  
✅ Form validation works (backend validation with field-level error display)  
✅ Loading states are shown during API calls  
✅ Error states are handled and displayed  
✅ URL params sync with filters and pagination  
✅ Database has proper indexes on status and created_at  
✅ All CRUD operations persist correctly  

---

## UI Workflow & Optimizations

### Workflow:
1. **Main Page (`/issues`)**: Displays paginated list of issues with filters
2. **Click Issue Card**: Navigates to `/issues/:id` (show page)
3. **Show Page**: Read-only view with Edit and Delete buttons
4. **Edit Button**: Navigates to `/issues/:id/edit` (edit page)
5. **Create New**: Click "Create Issue" button → Navigates to `/issues/new`
6. **After Create**: Redirects to `/issues/:id` (show page)
7. **After Update**: Redirects to `/issues/:id` (show page)
8. **After Delete**: Redirects to `/issues` (list page)

### Optimizations Implemented:
✅ **URL-based routing** - Clean URLs, bookmarkable pages, browser back/forward support  
✅ **Pagination** - 20 items per page with navigation controls  
✅ **Filtering** - Filter by status (open/closed) with URL param sync  
✅ **Sorting** - Sort by creation date (asc/desc) with URL param sync  
✅ **URL param synchronization** - Filters and pagination preserved in URL  
✅ **Separate show page** - Read-only view before editing  
✅ **Create button on list page** - Easy access to create new issues  
✅ **Back/Cancel buttons** - Easy navigation  
✅ **Auto-redirect after operations** - Better UX flow  
✅ **Delete confirmation** - Prevents accidental deletions  
✅ **Error feedback** - Field-level and general error messages  
✅ **Loading states** - Visual feedback during operations  
✅ **Change detection** - Only sends changed fields on update  
✅ **Backend validation** - Server-side validation with field-level error mapping

### Additional Optimization Ideas (Optional):
- **Optimistic updates**: Update UI immediately, rollback on error
- **Search functionality**: Search issues by title/description
- **Breadcrumbs**: Show navigation path
- **Unsaved changes warning**: Prevent data loss on navigation

## Architecture Notes

### State Management
- **Custom Hooks Architecture**: Each feature uses its own hook
- **Localized State**: Each hook manages its own state (no shared global state)
- **Direct Service Calls**: Hooks call service functions directly
- **Benefits**: Simpler architecture, clearer data flow, easier testing, better performance

### Backend Architecture
- **BaseModel Pattern**: Common fields (id, created_at, updated_at) in BaseModel
- **Enum-based Status**: IssueStatus enum for type safety
- **Base Schemas**: Reusable BaseSchema and TimestampSchema
- **Pagination**: Built-in pagination (20 items per page)
- **Field Validation**: Text stripping and validation in Pydantic validators

### Frontend Architecture
- **Component Composition**: Reusable form fields, IssueForm, IssueCard, etc.
- **Hook-based State**: useIssueList, useIssueForm, useIssueShow
- **URL State Sync**: Filters and pagination synced with URL params
- **Error Handling**: Field-level error mapping from backend 422 responses

## Technical Notes

- **Unix timestamps**: Generated server-side using PostgreSQL `EXTRACT(EPOCH FROM NOW())
- **Status enum**: IssueStatus.OPEN | IssueStatus.CLOSED (type-safe)
- **Form validation**: Backend-only (Pydantic), errors mapped to field-level display
- **Error handling**: User-friendly error messages with field-level validation feedback
- **Routing**: React Router DOM with BrowserRouter
- **URL Structure**: 
  - `/issues` (list)
  - `/issues/new` (create)
  - `/issues/:id` (show)
  - `/issues/:id/edit` (edit)
