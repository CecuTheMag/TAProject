# Admin Backend - Setup & Fix Summary

## ✅ Issues Fixed

### 1. **404 Error on `/api/system-admin/admins`**
   - **Problem**: Frontend called `/admins` but backend only had `/school-admins`
   - **Fix**: Added both routes to support frontend API calls

### 2. **Missing Database Tables**
   - **Problem**: `admin_users`, `schools`, `users` tables didn't exist
   - **Fix**: Added auto-initialization in `server.js` on startup

### 3. **Missing CRUD Routes**
   - **Problem**: Frontend expected update/delete endpoints
   - **Fix**: Added stub routes (501 Not Implemented) for future development

---

## 📁 Files Modified/Created

### Modified:
- `admin-backend/server.js` - Added database initialization
- `admin-backend/routes/systemAdmin.js` - Added missing routes

### Created:
- `admin-backend/init-db.js` - Database initialization script
- `admin-backend/create-admin.js` - System admin user creation

---

## 🚀 Setup Instructions

### If you have access to the Docker host:

```bash
# Restart admin backend to initialize database
docker-compose -f docker-compose-secure.yml restart admin_backend

# Create first system admin user
docker-compose -f docker-compose-secure.yml exec admin_backend node create-admin.js
```

### Default Admin Credentials:
```
Email: admin@system.com
Password: admin123
```

---

## 🔧 Database Schema

### Tables Created:

**admin_users** - System administrators
- id, username, email, password, created_at

**schools** - Tenant schools
- id, name, code, address, phone, email, domain, created_at

**users** - School-level admins (cross-reference)
- id, username, email, password, role, school_id, created_at

---

## 📡 API Endpoints Now Available

### Authentication
- `POST /api/auth/login` - System admin login

### System Admin
- `GET /api/system-admin/stats` - System statistics
- `GET /api/system-admin/schools` - List all schools
- `POST /api/system-admin/schools` - Create new school
- `PUT /api/system-admin/schools/:id` - Update school (stub)
- `DELETE /api/system-admin/schools/:id` - Delete school (stub)
- `GET /api/system-admin/admins` - List school admins
- `POST /api/system-admin/admins` - Create school admin
- `DELETE /api/system-admin/admins/:id` - Delete admin (stub)

---

## ⚠️ Notes

1. **Auto-restart**: The `docker-compose-secure.yml` has `restart: unless-stopped`, so changes will apply on container restart
2. **Volume mounts**: Code changes sync automatically via Docker volumes
3. **Network isolation**: Admin backend is on `admin_network` and `internal_api` networks
4. **Port**: Admin backend runs on port 5005 (mapped from internal 5001)

---

## 🔍 Testing

Access admin frontend at: `http://localhost:3002`

The 404 error should now be resolved!
