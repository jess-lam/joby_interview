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
- **State Management**: React Context API

---

## Phase 1: Database Setup & Schema Design

### 1.1 Database Schema Design

**Table: `issues`**
- `id` (Integer, Primary Key, Auto-increment)
- `title` (String, Required, Max length ~200 chars)
- `description` (Text, Required)
- `status` (String, Enum: "open" | "closed", Default: "open")
- `created_at` (Integer, Unix timestamp, Required)
- `updated_at` (Integer, Unix timestamp, Optional, for tracking updates)

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

Create SQLAlchemy model:
- Define `Issue` class inheriting from `Base`
- Add all required fields with proper types
- Set default values (status="open", created_at=current_timestamp)
- Add `__repr__` method for debugging

### 2.2 Pydantic Schemas

**File**: `backend/app/schemas/issue.py`

Create schemas:
- `IssueBase`: Base schema with common fields
- `IssueCreate`: For POST requests (title, description, status optional)
- `IssueUpdate`: For PATCH/PUT requests (all fields optional)
- `IssueResponse`: For GET responses (includes id, created_at, all fields)

**Validation Rules:**
- `title`: Required, min 1 char, max 200 chars
- `description`: Required, max 5000 chars
- `status`: Enum validation ("open" | "closed")
- `created_at`: Auto-generated Unix timestamp if not provided
- `updated_at`: Auto-generated Unix timestamp if not provided

### 2.3 API Endpoints

**File**: `backend/app/api/v1/endpoints/issues.py`

Implement CRUD endpoints:

1. **POST `/api/v1/issues`** - Create new issue
   - Accept `IssueCreate` schema
   - Generate `created_at` timestamp
   - Save to database
   - Return `IssueResponse`

2. **GET `/api/v1/issues`** - List all issues
   - Optional query params: `status` (filter by status), `sort` (created_at asc/desc)
   - Return list of `IssueResponse`
   - Handle pagination (optional enhancement)

3. **GET `/api/v1/issues/{issue_id}`** - Get single issue
   - Validate issue_id exists
   - Return `IssueResponse` or 404

4. **PUT `/api/v1/issues/{issue_id}`** - Update issue (full update)
   - Accept `IssueUpdate` schema
   - Validate issue exists
   - Update all provided fields
   - Return updated `IssueResponse`

5. **DELETE `/api/v1/issues/{issue_id}`** - Delete issue
   - Validate issue exists
   - Delete from database
   - Return success message or 204 status

### 2.4 Error Handling

Implement consistent error handling:
- 400: Bad Request (validation errors)
- 404: Not Found (issue doesn't exist)
- 500: Internal Server Error (database errors)
- Use FastAPI's HTTPException
- Return structured error responses

### 2.5 Router Registration

**File**: `backend/app/api/v1/__init__.py` or `backend/app/main.py`

- Create router for issues endpoints
- Include router in main FastAPI app with prefix `/api/v1`
- Add appropriate tags for API documentation

### 2.6 Database Session Management

Ensure proper database session handling:
- Use dependency injection for `get_db()`
- Proper session cleanup in all endpoints
- Handle database errors gracefully

---

## Phase 3: Frontend Development

### 3.1 API Service Layer

**File**: `frontend/src/services/issues.js`

Create service functions:
- `getIssues(status, sort)` - Fetch all issues with optional filters
- `getIssue(id)` - Fetch single issue
- `createIssue(issueData)` - Create new issue
- `updateIssue(id, issueData)` - Update issue
- `deleteIssue(id)` - Delete issue

Each function should:
- Use axios instance from `api.js`
- Handle errors appropriately
- Return promises for component use

### 3.2 Context API Setup

**File**: `frontend/src/context/IssuesContext.jsx`

Create IssuesContext to manage global state:

**State:**
- `issues`: array of issues
- `loading`: boolean for loading state
- `error`: error message string (null if no error)
- `editingIssue`: currently editing issue (null or issue object)

**Functions:**
- `fetchIssues(status, sort)` - Load all issues with optional filters
- `createIssue(issueData)` - Create new issue and refresh list
- `updateIssue(id, issueData)` - Update existing issue and refresh list
- `deleteIssue(id)` - Delete issue and refresh list
- `setEditingIssue(issue)` - Set issue for editing (null to cancel)
- `clearError()` - Clear error state

**Implementation:**
- Use `useState` for state management
- Use `useEffect` to fetch issues on mount (in provider or App)
- Use `useCallback` to memoize functions and prevent unnecessary re-renders
- Export `IssuesProvider` component and `useIssues` custom hook
- Wrap App component with `IssuesProvider`

### 3.3 React Components

#### 3.3.1 Issue List Component

**File**: `frontend/src/pages/IssueList.jsx`

Features:
- Use `useIssues()` hook to access context
- Use `useNavigate()` from react-router-dom for navigation
- Display list of issues in a table or card layout
- Show: title, description (truncated), status, created_at (formatted)
- Access `issues`, `loading`, `error` from context
- Each issue is clickable → navigates to `/issues/:id/edit` route
- "Create Issue" button → navigates to `/issues/new` route
- Empty state when no issues
- Loading state while fetching
- Error state if fetch fails
- Fetch issues on component mount (useEffect)

#### 3.3.2 Issue Form Page

**File**: `frontend/src/pages/IssueFormPage.jsx`

Features:
- Use `useIssues()` hook to access context
- Use `useParams()` and `useNavigate()` from react-router-dom
- Get issue ID from route params (`/issues/:id/edit` or `/issues/new`)
- If route is `/issues/new`: Create mode (empty form)
- If route is `/issues/:id/edit`: Edit mode (load issue data)
- Use `useEffect` to fetch issue data if in edit mode
- Form fields: title (required), description (required), status (dropdown)
- Form validation:
  - Title: required, min 1 char, max 200 chars
  - Description: required, max 5000 chars
  - Status: "open" or "closed"
- **Save button**: 
  - Calls `createIssue(issueData)` or `updateIssue(id, issueData)`
  - On success: Navigate back to `/issues` (list page)
  - Show success message
- **Delete button** (only shown in edit mode):
  - Shows confirmation dialog before deleting
  - Calls `deleteIssue(id)`
  - On success: Navigate back to `/issues` (list page)
  - Show success message
- **Back/Cancel button**: 
  - Navigate back to `/issues` (list page)
- Display validation errors
- Loading state during submission (use context `loading` state)
- Show page title: "Create New Issue" or "Edit Issue #:id"

#### 3.3.3 Issue Item Component

**File**: `frontend/src/components/IssueItem.jsx`

Features:
- Reusable component for displaying a single issue in the list
- Display: title, description (truncated), status badge, created_at
- Clickable card/row → navigates to `/issues/:id/edit` route
- Status badge with visual indicator (color-coded: open/closed)


### 3.4 Routing Setup

**File**: `frontend/src/App.jsx`

Features:
- Wrap entire app with `<IssuesProvider>` component
- Set up React Router with `BrowserRouter`
- Define routes:
  - `/issues` → `IssueListPage` (default/main page)
  - `/issues/new` → `IssueFormPage` (create mode)
  - `/issues/:id/edit` → `IssueFormPage` (edit mode)
- Use `Routes` and `Route` components from react-router-dom
- Optional: Add 404 route for unknown paths


**File Structure:**
- App.jsx handles routing configuration
- Pages are in `frontend/src/pages/`
- Components are in `frontend/src/components/`

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

**File**: `frontend/src/utils/dateUtils.js` (optional)

Functions:
- `formatTimestamp(timestamp)` - Convert Unix timestamp to readable date
- `formatDate(date)` - Format date string

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

### Backend Files to Create/Modify:

```
backend/
├── app/
│   ├── models/
│   │   └── issue.py                    # NEW: Issue SQLAlchemy model
│   ├── schemas/
│   │   └── issue.py                    # NEW: Issue Pydantic schemas
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/
│   │           └── issues.py          # NEW: Issue API endpoints
│   └── main.py                         # MODIFY: Include issues router
└── alembic/
    └── versions/
        └── XXXX_create_issues_table.py # NEW: Migration file
```

### Frontend Files to Create:

```
frontend/
├── src/
│   ├── components/
│   │   ├── IssueItem.jsx               # Reusable issue card component
│   │   └── Layout.jsx                  # Common layout wrapper
│   ├── pages/
│   │   ├── IssueListPage.jsx           # Main list page (route: /issues)
│   │   └── IssueFormPage.jsx           # Form page (routes: /issues/new, /issues/:id/edit)
│   ├── context/
│   │   └── IssuesContext.jsx           # Context API for state management
│   ├── services/
│   │   └── issues.js                   # Issue API service
│   ├── utils/
│   │   └── dateUtils.js                # Date utilities
│   └── App.jsx                         # Routing setup + IssuesProvider
```

---

## Implementation Order

1. **Database & Model** (Backend foundation)
   - Create Issue model
   - Create Alembic migration
   - Run migration

2. **Backend API** (API layer)
   - Create Pydantic schemas
   - Implement API endpoints
   - Test endpoints with FastAPI docs

3. **Frontend Service** (API integration)
   - Create issues service functions
   - Test service functions

4. **Frontend Context** (State management)
   - Create IssuesContext with provider
   - Implement state and functions
   - Create useIssues custom hook

5. **Frontend Routing** (Navigation)
   - Set up React Router in App.jsx
   - Define routes: /issues, /issues/new, /issues/:id/edit
   - Wrap app with IssuesProvider

6. **Frontend Pages** (UI layer)
   - Create IssueListPage (main page with list)
   - Create IssueFormPage (create/edit form)
   - Create IssueItem component (reusable)
   - Add navigation between pages

7. **Integration & Testing** (End-to-end)
   - Test full workflow with routing
   - Test navigation between pages
   - Test create, edit, delete flows
   - Fix any issues
   - Polish UI/UX

---

## Success Criteria

✅ Users can create issues with title, description, and status  
✅ Users can view a list of all issues  
✅ Users can update existing issues  
✅ Users can delete issues  
✅ Form validation works (title required, status enum)  
✅ Loading states are shown during API calls  
✅ Error states are handled and displayed  
✅ Database has proper indexes on status and created_at  
✅ All CRUD operations persist correctly  

---

## UI Workflow & Optimizations

### Workflow:
1. **Main Page (`/issues`)**: Displays list of all issues
2. **Click Issue**: Navigates to `/issues/:id/edit` route
3. **Form Page**: Shows form with issue data, Save button, Delete button
4. **Create New**: Click "Create Issue" button → Navigates to `/issues/new`
5. **After Save/Delete**: Redirects back to `/issues` list page

### Optimizations Added:
✅ **URL-based routing** - Clean URLs, bookmarkable pages, browser back/forward support  
✅ **Create button on list page** - Easy access to create new issues  
✅ **Back/Cancel button** - Easy navigation back to list  
✅ **Auto-redirect after operations** - Better UX, user sees updated list immediately  
✅ **Delete confirmation** - Prevents accidental deletions  
✅ **Success/error feedback** - Clear user communication  
✅ **Loading states** - Visual feedback during operations  
✅ **Route-based mode detection** - Form knows if it's create or edit mode from URL  
✅ **Optional: Unsaved changes warning** - Prevent data loss (enhancement)

### Additional Optimization Ideas (Optional):
- **Optimistic updates**: Update UI immediately, rollback on error
- **Caching**: Store fetched issues in context to avoid refetching
- **Pagination**: For large lists (if needed in future)
- **Search/Filter**: On list page (if needed in future)
- **Breadcrumbs**: Show navigation path

## Notes

- Unix timestamps: Use `int(time.time())` in Python, `Math.floor(Date.now() / 1000)` in JavaScript
- Status enum: Strictly "open" or "closed" (case-sensitive)
- Form validation: Client-side for UX, server-side for security
- Error handling: Always provide user-friendly error messages
- State Management: Using React Context API to avoid prop drilling and centralize state
- Context Optimization: Use `useCallback` for context functions and `useMemo` for computed values to prevent unnecessary re-renders
- Routing: Using React Router DOM (already installed) for navigation between pages
- URL Structure: `/issues` (list), `/issues/new` (create), `/issues/:id/edit` (edit)