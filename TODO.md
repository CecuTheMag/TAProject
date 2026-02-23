# Fix Issues - TODO

## Issue 1: Admin cannot delete teachers and managers ✅ FIXED
- [x] Examine backend user deletion route
- [x] Add better error handling to user deletion
- [x] Test deletion for all user roles

**Changes made to `backend/routes/users.js`:**
- Added detailed logging for user deletion process
- Added pre-check to verify user exists and get their role before deletion
- Added check for active requests (pending/approved) before allowing deletion
- Improved error messages with details
- Returns deleted user info in success response

## Issue 2: Equipment card PDF upload 404 error ✅ FIXED
- [x] Fix document routes registration
- [x] Ensure uploads directory exists
- [x] Add better error handling and logging
- [x] Test document upload functionality

**Changes made to `backend/routes/documents.js`:**
- Added automatic creation of `uploads/documents` directory on startup
- Changed upload path to use absolute path (`process.cwd()/uploads/documents`)
- Added detailed logging for document fetch and upload operations
- Added file cleanup on errors or if equipment not found
- Improved error messages with details

**Changes made to `backend/server.js`:**
- Moved document routes registration BEFORE other API routes to prevent conflicts
- Added both `/api/documents` and `/documents` route mounts for compatibility

## Summary of Fixes

### User Deletion Fix
The user deletion now properly:
1. Checks if the user exists before attempting deletion
2. Verifies the user's role (teachers, managers, admins can all be deleted)
3. Checks for active requests before allowing deletion
4. Provides detailed logging for debugging

### Document Upload Fix
The document upload now properly:
1. Creates the uploads directory automatically if it doesn't exist
2. Uses absolute paths to prevent path resolution issues
3. Has improved error handling with file cleanup on failures
4. Routes are registered early to avoid conflicts with other routes

## Files Modified
1. ✅ `backend/routes/users.js` - Enhanced user deletion with logging and validation
2. ✅ `backend/routes/documents.js` - Fixed upload directory and added error handling
3. ✅ `backend/server.js` - Fixed route registration order
