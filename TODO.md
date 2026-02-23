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
- [x] **Auto-run migration on startup** - Added `ensureDocumentsColumn()` function

**Changes made to `backend/routes/documents.js`:**
- Added automatic creation of `uploads/documents` directory on startup
- Changed upload path to use absolute path (`process.cwd()/uploads/documents`)
- Added detailed logging for document fetch and upload operations
- Added file cleanup on errors or if equipment not found
- Improved error messages with details

**Changes made to `backend/server.js`:**
- ✅ **Added `ensureDocumentsColumn()` function that runs on every startup**
- ✅ **Checks if column exists before adding (idempotent - won't error if already there)**
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
1. ✅ **Auto-creates the documents column on every server startup if missing**
2. Creates the uploads directory automatically if it doesn't exist
3. Uses absolute paths to prevent path resolution issues
4. Has improved error handling with file cleanup on failures
5. Routes are registered early to avoid conflicts with other routes

## Files Modified
1. ✅ `backend/routes/users.js` - Enhanced user deletion with logging and validation
2. ✅ `backend/routes/documents.js` - Fixed upload directory and added error handling
3. ✅ `backend/server.js` - **Added automatic migration on startup**, fixed route registration order
4. ✅ `backend/migrations/010_add_documents_column.sql` - Database migration (backup)
5. ✅ `backend/run-documents-migration.js` - Standalone migration runner (backup)

## How It Works Now

**On every backend startup:**
1. Server initializes database connection
2. `ensureDocumentsColumn()` runs automatically
3. It checks all school schemas for the `documents` column
4. If column is missing, it adds it with `JSONB DEFAULT '[]'::jsonb`
5. If column already exists, it skips (no error)
6. Server continues startup normally

**No manual SQL required!** Just restart your backend server and the migration will run automatically.
