# SchoolSync Security Fixes - TODO List

## Priority 1: CRITICAL Security Vulnerabilities

### 1.1 Missing Authentication on User Routes
- **File:** `backend/routes/users.js`
- **Issue:** Routes don't require authentication
- **Fix:** Add `authenticateToken` middleware to all routes
- **Status:** TODO

### 1.2 Missing Role Authorization on Request Management
- **File:** `backend/routes/requests.js`
- **Issue:** Any user can approve/reject requests
- **Fix:** Add `requireTeacherOrAdmin` middleware to approve/reject endpoints
- **Status:** TODO

### 1.3 Hardcoded Fallback School Code
- **File:** `frontend/src/api.js`
- **Issue:** Hardcoded 'TEST001' fallback bypasses auth
- **Fix:** Remove fallback, only use school code from authenticated user
- **Status:** TODO

### 1.4 IDOR - Users Can Access All School Data
- **File:** `backend/routes/users.js`
- **Issue:** Users can query all users across all schools
- **Fix:** Add school context filter to all queries
- **Status:** TODO

### 1.5 No Authorization Check on User Modification
- **File:** `backend/controllers/users.js`
- **Issue:** Any user can update roles without verification
- **Fix:** Add admin role check before allowing role modifications
- **Status:** TODO

## Priority 2: High Security Issues

### 2.1 Overly Permissive CORS
- **File:** `backend/server.js`
- **Issue:** Allows requests from any origin (*)
- **Fix:** Restrict to specific frontend domain(s)
- **Status:** TODO

### 2.2 Missing Rate Limiting
- **File:** `backend/middleware/rateLimiter.js`
- **Issue:** No rate limiting on user creation/deletion
- **Fix:** Add rate limits to sensitive endpoints
- **Status:** TODO

### 2.3 No Authorization on User Delete
- **File:** `backend/routes/users.js`
- **Issue:** DELETE /users/:id has no role check
- **Fix:** Add requireAdmin middleware
- **Status:** TODO

### 2.4 No Authorization on User Update
- **File:** `backend/routes/users.js`
- **Issue:** PUT endpoints have no role verification
- **Fix:** Add requireAdmin for role changes, requireTeacherOrAdmin for subject updates
- **Status:** TODO

## Priority 3: Medium Security Issues

### 3.1 Weak Default Passwords
- **File:** `backend/routes/users.js`
- **Issue:** Default password 'temp123' is weak
- **Fix:** Generate cryptographically secure random passwords
- **Status:** TODO

### 3.2 No Input Sanitization
- **Files:** Multiple controllers
- **Issue:** User inputs not sanitized for XSS
- **Fix:** Add input sanitization or use a library like DOMPurify
- **Status:** TODO

### 3.3 Missing CSRF Protection
- **File:** `backend/server.js`
- **Issue:** No CSRF tokens implemented
- **Fix:** Implement CSRF token validation
- **Status:** TODO

### 3.4 Equipment Delete Without Permission Check
- **File:** `backend/routes/equipment.js`
- **Issue:** DELETE endpoint may allow unauthorized deletion
- **Fix:** Add requireAdmin or requireManager middleware
- **Status:** TODO

## Priority 4: Code Quality & Best Practices

### 4.1 Add Comprehensive Audit Logging
- **Issue:** No audit trail for sensitive operations
- **Fix:** Log all admin actions (create user, delete user, role changes, etc.)
- **Status:** TODO

### 4.2 Add Unit/Integration Tests
- **Issue:** No security tests exist
- **Fix:** Add tests for authentication, authorization, and input validation
- **Status:** TODO

### 4.3 Implement SQL Injection Prevention
- **Issue:** Direct string interpolation in some queries
- **Fix:** Use parameterized queries consistently everywhere
- **Status:** TODO

### 4.4 Add Security Headers
- **File:** `backend/server.js`
- **Issue:** Missing some security headers (Content-Security-Policy, etc.)
- **Fix:** Configure helmet with stricter CSP
- **Status:** TODO

---

## Summary

| Priority | Count | Estimated Fix Time |
|----------|-------|-------------------|
| Critical (P1) | 5 | 2-3 hours |
| High (P2) | 4 | 1-2 hours |
| Medium (P3) | 4 | 1-2 hours |
| Low (P4) | 4 | 2-3 hours |

**Total: 17 tasks**
**Estimated Total Time: 6-10 hours**

---

## Testing Checklist After Fixes

- [ ] Unauthenticated user cannot access /users endpoints
- [ ] Student cannot approve/reject requests
- [ ] Student cannot modify other users' roles
- [ ] User can only see data from their own school
- [ ] CORS only allows specific origins
- [ ] Rate limiting prevents brute force attacks
- [ ] All sensitive endpoints require valid JWT + appropriate role

