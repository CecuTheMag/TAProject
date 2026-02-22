# Teacher Role Updates - Task List

## Frontend Changes

### 1. Dashboard.jsx - Remove Add Equipment Button for Teachers
- [x] Modify condition from `['teacher', 'manager', 'admin']` to `['manager', 'admin']`
- [x] Location: Around line 320 in the header section

### 2. RequestsTab.jsx - Give Teachers and Managers Admin-like Request Management
- [x] Update API call condition to include teachers and managers for `getAllRequests()`
- [x] Update approve button visibility for teachers, managers, and admins
- [x] Update reject button visibility for teachers, managers, and admins
- [x] Update early return button visibility for teachers, managers, and admins
- [x] Update header text to reflect new permissions

### 3. CreateLessonPlanModal.jsx - Fix Subject Filtering for Teachers
- [x] Ensure only the teacher's assigned subject shows in the dropdown
- [x] Verify the filtering logic works correctly

## Backend Changes

### 4. backend/middleware/roleAuth.js - Add new middleware
- [x] Create `requireManagerTeacherOrAdmin` middleware including teacher, manager, and admin

### 5. backend/routes/requests.js - Update route permissions
- [x] Update approve route to use new middleware including managers
- [x] Update reject route to use new middleware including managers
- [x] Add role protection to return route for managers, teachers, and admins
- [x] Add role protection to early-return route for managers, teachers, and admins
