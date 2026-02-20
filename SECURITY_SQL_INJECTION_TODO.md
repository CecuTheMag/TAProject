# Security Hardening - SQL Injection Fixes TODO List

## CRITICAL VULNERABILITIES (Fix Immediately)

### 1. Schema Name Injection in schemaManager.js
**File:** `backend/utils/schemaManager.js`
**Issue:** Direct string interpolation for schema names
```javascript
// CURRENT (VULNERABLE):
const schemaName = `school_${schoolCode.toLowerCase()}`;
await pool.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName}`);
```
**Fix:** Add strict validation for schoolCode before using in queries
```javascript
// Validate schoolCode is alphanumeric only, 2-50 chars
if (!/^[a-zA-Z0-9]{2,50}$/.test(schoolCode)) {
  throw new Error('Invalid school code format');
}
```

### 2. Schema Context Injection in schoolContext.js
**File:** `backend/middleware/schoolContext.js`
**Issue:** School code from headers/query parameters can be manipulated
```javascript
// CURRENT (VULNERABLE):
if (req.headers['x-school-code']) {
  schoolCode = req.headers['x-school-code'];
}
schoolCode = req.query.school.toUpperCase();
```
**Fix:** 
- Validate schoolCode against database of valid schools
- Remove/limit query parameter school code
- Verify X-School-Code header only from trusted sources

### 3. SET search_path Injection in systemAdmin.js
**File:** `backend/controllers/systemAdmin.js`
**Issue:** String interpolation in SET search_path
```javascript
// CURRENT (VULNERABLE):
await client.query(`SET search_path TO ${schemaName}, public`);
```
**Fix:** Use validated schema names only, quote identifiers properly

---

## HIGH PRIORITY FIXES

### 4. Admin Backend - Same Issues
**Files:** `admin-backend/controllers/systemAdmin.js`, `admin-backend/middleware/security.js`
**Fix:** Apply same validations as main backend

### 5. Enhanced Input Sanitization
**File:** `backend/middleware/security.js`
**Issue:** Current sanitization only removes `<script>` tags
**Fix:** 
- Use a proven library like `sanitize-html` or `dompurify`
- Add SQL-specific sanitization (escape single quotes, semicolons)

### 6. Add Joi Validation for School Code
**Files:** All controllers using req.schoolSchema
**Fix:** Add validation that school exists in database before allowing access

---

## MEDIUM PRIORITY IMPROVEMENTS

### 7. Add Parameterized Query Helper with Validation
**Create:** `backend/utils/secureQuery.js`
- Create wrapper that validates all identifiers (table names, column names)
- Ensure schema names are whitelisted

### 8. Database User Permissions
**Fix:** Create read-only database user for queries, separate admin user for DDL
```sql
-- For application queries (read/write):
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public;

-- For schema creation (admin only):
GRANT CREATE ON DATABASE schoolsync;
```

### 9. Add Audit Logging for All Database Queries
**Create:** `backend/middleware/audit.js`
- Log all queries with parameters
- Alert on suspicious patterns

---

## LOW PRIORITY / FUTURE

### 10. Consider Using ORM/Query Builder
- **Knex.js** - Provides parameterized queries by default
- **Prisma** - Type-safe, automatic parameterization
- **Sequelize** - Mature ORM with injection protection

### 11. Add Web Application Firewall (WAF)
- Use Cloudflare or similar
- Configure SQL injection rules

### 12. Implement Database Prepared Statements at Pool Level
```javascript
// In database.js
pool.on('connection', (client) => {
  client.on('query', (event) => {
    // Log all queries
  });
});
```

---

## QUICK FIX CHECKLIST (Do First)

- [x] 1. Add schoolCode validation regex in schemaManager.js
- [x] 2. Add schoolCode validation in schoolContext.js  
- [x] 3. Validate schoolCode in systemAdmin.js createSchoolAdmin
- [x] 4. Add same fixes to admin-backend
- [x] 5. Verify all user inputs go through Joi validation
- [x] 6. Remove debug logging that exposes sensitive data

---

## TESTING CHECKLIST

- [x] Test with SQL injection payloads:
  - [x] `'; DROP TABLE users; --`
  - [x] `school_1'; DROP SCHEMA public; --`
  - [x] `admin" --`
  - [x] `1 OR 1=1`
- [x] Verify parameterized queries work correctly
- [x] Test multi-tenant isolation (can't access other school data)
- [x] Test rate limiting doesn't block legitimate users
- [x] Add automated Jest tests (20 tests added and passing)

