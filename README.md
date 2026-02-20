# SchoolSync - Enterprise Inventory Management System

<div align="center">

![SchoolSync Logo](frontend/src/assets/logotp.png)

**SchoolSync** — Интелигентна система за управление на оборудване в образователни институции

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18+-blue?style=for-the-badge&logo=react)](https://reactjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue?style=for-the-badge&logo=postgresql)](https://postgresql.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)](https://docker.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Версия:** 2.0.0 | **Статус:** Производствена среда ✅

</div>

---

## 📋 Съдържание

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Directory Structure](#directory-structure)
4. [Features](#features)
5. [Technology Stack](#technology-stack)
6. [API Documentation](#api-documentation)
7. [Security](#security)
8. [Setup & Installation](#setup--installation)
9. [Deployment](#deployment)
10. [Demo Credentials](#demo-credentials)

---

## 📌 Overview

**SchoolSync** е цялостна система за управление на оборудване, проектирана специално за образователни институции. Системата позволява проследяване на оборудване чрез QR кодове, управление на заявки, мулти-тенантна архитектура за поддръжка на множество училища.

### Key Features

- 📱 **QR Code Tracking** — Проследяване на оборудване чрез QR кодове
- 🔐 **Multi-Role Access** — Различна достъп за ученици, учители, мениджъри, админи
- 🏫 **Multi-School Support** — Мулти-тенантна архитектура с отделни схеми в PostgreSQL
- 📊 **Real-time Analytics** — Аналитични табла в реално време
- 📧 **Email Notifications** — Автоматични email известия
- 🔒 **Enterprise Security** — SQL injection защита, JWT автентикация

---

## 🏗️ Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              INTERNET                                        │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NGINX LOAD BALANCER                                 │
│                    (SSL Termination + Rate Limiting)                        │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
          ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Admin Frontend │    │   Mobile App    │
│   (User Portal) │    │   (Management)  │    │   (PWA)         │
│   :3000         │    │   :5173         │    │   :3000         │
└────────┬────────┘    └────────┬────────┘    └─────────────────┘
         │                      │
         └──────────┬───────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         BACKEND API (Node.js + Express)                     │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │                        API GATEWAY                                    │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐    │   │
│  │  │  /auth     │ │ /equipment │ │ /requests  │ │ /education │    │   │
│  │  │  Routes    │ │  Routes    │ │  Routes    │ │  Routes    │    │   │
│  │  └────────────┘ └────────────┘ └────────────┘ └────────────┘    │   │
│  │                                                                   │   │
│  │  ┌──────────────────────────────────────────────────────────┐    │   │
│  │  │              MIDDLEWARE LAYER                            │    │   │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │    │   │
│  │  │  │Security │ │  Auth   │ │ Rate    │ │ School  │      │    │   │
│  │  │  │Headers  │ │  JWT    │ │ Limiter │ │ Context │      │    │   │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │    │   │
│  │  └──────────────────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────┬───────────────────────────────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
          ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │    │      Redis       │    │     File        │
│   Database      │    │      Cache       │    │     Storage     │
│   (Port 5432)  │    │   (Port 6379)    │    │   (Uploads)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Database Schema Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      PUBLIC SCHEMA                               │
│  (Shared tables across all schools)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   schools   │  │    users    │  │ school_data │          │
│  │  (id, name, │  │ (id, email,│  │  (imported  │          │
│  │   code,     │  │  password, │  │   student    │          │
│  │   district) │  │  role,     │  │   records)  │          │
│  └─────────────┘  │  school_id)│  └─────────────┘          │
│                    └─────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ (One schema per school)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              school_{CODE} SCHEMA (Per School)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │   users     │  │  equipment  │  │  requests   │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  subjects   │  │lesson_plans │  │condition_logs│          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow Diagram

```
┌──────────┐     ┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  Client  │────►│  Express    │────►│  Middleware  │────►│ Controller │
│  (React) │     │  Router     │     │  (Auth,JWT)  │     │  (Logic)   │
└──────────┘     └─────────────┘     └──────────────┘     └─────┬──────┘
                                                                  │
                                                                  ▼
┌──────────┐     ┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  Client  │◄────│  Response   │◄────│   Database   │◄────│   Query    │
│  (React) │     │   (JSON)    │     │  (PostgreSQL)│     │  (Params)  │
└──────────┘     └─────────────┘     └──────────────┘     └────────────┘
```

---

## 📁 Directory Structure

```
SchoolSync/
├── 📂 backend/                          # Main API Server
│   ├── 📂 controllers/                  # Business logic
│   │   ├── auth.js                      # Authentication
│   │   ├── equipment.js                  # Equipment CRUD
│   │   ├── requests.js                  # Request workflow
│   │   ├── users.js                     # User management
│   │   ├── dashboard.js                 # Dashboard stats
│   │   ├── reports.js                   # Reporting
│   │   └── systemAdmin.js               # System admin
│   │
│   ├── 📂 middleware/                   # Express middleware
│   │   ├── auth.js                      # JWT verification
│   │   ├── security.js                  # Security headers
│   │   ├── schoolContext.js             # Multi-tenant context
│   │   ├── rateLimiter.js               # Rate limiting
│   │   └── roleAuth.js                  # Role-based access
│   │
│   ├── 📂 routes/                       # API endpoints
│   │   ├── auth.js
│   │   ├── equipment.js
│   │   ├── requests.js
│   │   ├── users.js
│   │   ├── dashboard.js
│   │   ├── reports.js
│   │   └── systemAdmin.js
│   │
│   ├── 📂 services/                     # External services
│   │   ├── emailService.js              # Email notifications
│   │   ├── notificationService.js       # Push notifications
│   │   └── alertService.js              # Alert system
│   │
│   ├── 📂 utils/                        # Utilities
│   │   ├── schemaManager.js             # Multi-tenant schema
│   │   ├── cache.js                     # Redis caching
│   │   └── createSampleData.js          # Demo data
│   │
│   ├── 📂 migrations/                   # Database migrations
│   ├── database.js                     # PostgreSQL connection
│   ├── server.js                       # Express app
│   └── package.json
│
├── 📂 admin-backend/                     # Admin API Server
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── database.js
│   └── server.js
│
├── 📂 frontend/                          # User Portal
│   ├── src/
│   │   ├── components/                  # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── EquipmentTab.jsx
│   │   │   ├── RequestsTab.jsx
│   │   │   ├── QRScanner.jsx
│   │   │   └── ...
│   │   ├── api.js                       # API client
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── 📂 admin-frontend/                    # Admin Portal
│   ├── src/
│   │   ├── components/
│   │   ├── api.js
│   │   └── ...
│   ├── package.json
│   └── Dockerfile
│
├── 📂 docker/                            # Docker configs
├── docker-compose.yml                    # Production stack
├── docker-compose-localhost.yml          # Development
├── nginx.conf                           # Nginx config
├── Caddyfile                            # SSL/HTTPS
└── README.md                            # This file
```

---

## ✨ Features

### 🔐 Authentication & Authorization

| Feature | Description |
|---------|-------------|
| JWT Tokens | Secure token-based authentication |
| Role-Based Access | Student, Teacher, Manager, Admin, System Admin |
| Password Encryption | bcryptjs with salt rounds |
| Session Management | Redis-backed sessions |
| Rate Limiting | IP-based request limiting |
| CSRF Protection | Origin validation |

### 📦 Equipment Management

| Feature | Description |
|---------|-------------|
| CRUD Operations | Full create, read, update, delete |
| QR Code Generation | Automatic QR codes for each item |
| QR Code Scanning | Mobile-friendly scanner |
| Search & Filter | By name, type, status, condition |
| Fleet Management | Group equipment by serial number |
| Document Attachments | PDF/image attachments |
| Condition Tracking | Excellent/Good/Fair/Poor |
| Status Tracking | Available/Checked Out/Under Repair/Retired |

### 📝 Request Workflow

```
┌─────────┐    ┌───────────┐    ┌────────────┐    ┌───────────┐    ┌─────────┐
│  Student │───►│  Pending  │───►│  Approved  │───►│ In Use    │───►│Returned │
│  Request │    │           │    │  (Manager) │    │           │    │         │
└─────────┘    └───────────┘    └────────────┘    └───────────┘    └─────────┘
     │              │                 │                 │               │
     ▼              ▼                 ▼                 ▼               ▼
  Submit        Email to         Email to         Update         Email to
  form          Manager          Requester         Status         Requester
```

### 📊 Analytics & Reporting

- Real-time dashboard statistics
- Equipment usage analytics
- User activity tracking
- Export to CSV/PDF
- Low stock alerts
- Overdue return notifications

### 🏫 Multi-School Support

- PostgreSQL schema-per-school isolation
- School-specific data partitioning
- Cross-school equipment sharing
- District-wide reporting

---

## 🛠️ Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18+ | UI Framework |
| Vite | 5+ | Build tool |
| Axios | 1.6+ | HTTP Client |
| React Router | 6+ | Navigation |
| CSS Modules | - | Styling |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 4.18+ | Web Framework |
| PostgreSQL | 15+ | Database |
| Redis | 7+ | Caching |
| JWT | 9.0+ | Authentication |
| bcryptjs | 2.4+ | Password Hashing |
| Joi | 17+ | Validation |
| QRCode | 1.5+ | QR Generation |
| Nodemailer | 6+ | Email |

### DevOps

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Nginx | Reverse Proxy |
| Caddy | SSL/HTTPS |
| Prometheus | Metrics |
| Grafana | Monitoring |

---

## 📚 API Documentation

### Authentication Endpoints

```http
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # User login
POST   /api/auth/logout            # User logout
POST   /api/auth/verify-email      # Send verification code
POST   /api/auth/setup-password    # First-time password setup
```

### Equipment Endpoints

```http
GET    /api/equipment                              # List all equipment
GET    /api/equipment/:id                         # Get equipment by ID
POST   /api/equipment                             # Create equipment
PUT    /api/equipment/:id                         # Update equipment
DELETE /api/equipment/:id                         # Delete equipment
GET    /api/equipment/groups                      # Get equipment groups
POST   /api/equipment/qr/:id                      # Generate QR code
```

### Request Endpoints

```http
POST   /api/request                              # Create request
GET    /api/request                              # User's requests
GET    /api/request/all                          # All requests (admin)
PUT    /api/request/:id/approve                  # Approve request
PUT    /api/request/:id/reject                   # Reject request
PUT    /api/request/:id/return                   # Process return
```

### User Endpoints

```http
GET    /api/users                                # List users
GET    /api/users/:id                           # Get user
PUT    /api/users/:id/role                      # Update user role
DELETE /api/users/:id                           # Delete user
```

### Dashboard & Reports

```http
GET    /api/dashboard/stats                     # Dashboard statistics
GET    /api/reports/usage                       # Usage report
GET    /api/reports/export                      # Export data
GET    /api/reports/low-stock                   # Low stock alerts
```

### Education Features

```http
GET    /api/education/subjects                   # List subjects
POST   /api/education/lesson-plans              # Create lesson plan
GET    /api/education/lesson-plans              # List lesson plans
POST   /api/education/lesson-plans/:id/request  # Request equipment
```

### System Admin

```http
POST   /api/system/schools                      # Create school
GET    /api/system/schools                      # List schools
PUT    /api/system/schools/:id/status           # Update school status
POST   /api/system/admins                       # Create school admin
GET    /api/system/stats                        # System statistics
```

---

## 🔒 Security

### Implemented Security Measures

| Measure | Implementation |
|---------|----------------|
| SQL Injection | Parameterized queries + input validation |
| XSS Protection | Input sanitization + CSP headers |
| CSRF Protection | Origin validation + tokens |
| Password Storage | bcryptjs (12 rounds) |
| JWT Security | Secret + expiration |
| Rate Limiting | Per-IP + per-user limits |
| Security Headers | X-Frame-Options, HSTS, etc. |
| Input Validation | Joi schemas |
| Schema Isolation | PostgreSQL per-school schemas |

### Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     SECURITY LAYER                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Input     │  │  Output    │  │   Database         │  │
│  │  Validation │  │ Sanitization│  │   Layer           │  │
│  │  (Joi)      │  │ (XSS)      │  │   (Parameterized) │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Auth JWT   │  │  RBAC      │  │   SQL Injection    │  │
│  │  Middleware │  │  Middleware │  │   Prevention       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Setup & Installation

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+ (optional)
- Docker & Docker Compose

### Quick Start (Docker)

```bash
# Clone repository
git clone https://github.com/your-repo/SchoolSync.git
cd SchoolSync

# Start with Docker
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Admin: http://localhost:5173
# Backend API: http://localhost:3001
```

### Manual Setup

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your database credentials
npm install
npm start

# Frontend
cd frontend
npm install
npm run dev

# Admin Frontend
cd admin-frontend
npm install
npm run dev
```

### Environment Variables

```env
# Backend (.env)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=schoolsync
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1h

# Redis (optional)
REDIS_HOST=localhost
REDIS_PORT=6379
```

---

## 📦 Deployment

### Development

```bash
docker-compose -f docker-compose-localhost.yml up --build
```

### Production

```bash
# With SSL (Caddy)
docker-compose -f docker-compose.yml up --build -d

# Or with custom Nginx
docker-compose up --build -d
```

### Kubernetes

```bash
kubectl apply -f kubernetes/
```

---

## 👤 Demo Credentials

### User Portal

| Role | Email | Password |
|------|-------|----------|
| Student | student@test.com | password123 |
| Teacher | teacher@test.com | password123 |
| Manager | manager@test.com | password123 |
| Admin | admin@school-sync.org | schoolsync2026 |

### Admin Portal

| Role | Email | Password |
|------|-------|----------|
| System Admin | admin@school-sync.org | schoolsync2026 |

---

## 📊 Project Structure (Visual)

```
┌────────────────────────────────────────────────────────────────────────┐
│                           SCHOOLSYNC PROJECT                           │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌──────────────────────┐    ┌──────────────────────┐                  │
│  │    FRONTEND         │    │    ADMIN-FRONTEND   │                  │
│  │    (Port 3000)      │    │    (Port 5173)      │                  │
│  │                     │    │                      │                  │
│  │  ┌──────────────┐  │    │  ┌──────────────┐   │                  │
│  │  │  Dashboard  │  │    │  │  Dashboard   │   │                  │
│  │  └──────────────┘  │    │  └──────────────┘   │                  │
│  │  ┌──────────────┐  │    │  ┌──────────────┐   │                  │
│  │  │  Equipment  │  │    │  │  Equipment   │   │                  │
│  │  └──────────────┘  │    │  └──────────────┘   │                  │
│  │  ┌──────────────┐  │    │  ┌──────────────┐   │                  │
│  │  │  Requests   │  │    │  │  Alerts      │   │                  │
│  │  └──────────────┘  │    │  └──────────────┘   │                  │
│  └─────────┬───────────┘    └─────────┬───────────┘                  │
│            │                         │                               │
│            └────────────┬────────────┘                               │
│                         │                                            │
│                         ▼                                            │
│  ┌────────────────────────────────────────────────────────────┐      │
│  │                    BACKEND API (Port 3001)                 │      │
│  │                                                          │      │
│  │  ┌─────────────────────────────────────────────────────┐ │      │
│  │  │                    ROUTES                             │ │      │
│  │  │  /auth  /equipment  /requests  /users  /reports      │ │      │
│  │  └─────────────────────────────────────────────────────┘ │      │
│  │                         │                                  │      │
│  │  ┌─────────────────────────────────────────────────────┐ │      │
│  │  │                   MIDDLEWARE                         │ │      │
│  │  │  Auth  Security  RateLimit  SchoolContext            │ │      │
│  │  └─────────────────────────────────────────────────────┘ │      │
│  │                         │                                  │      │
│  │  ┌─────────────────────────────────────────────────────┐ │      │
│  │  │                  CONTROLLERS                        │ │      │
│  │  │  Auth  Equipment  Requests  Users  Reports          │ │      │
│  │  └─────────────────────────────────────────────────────┘ │      │
│  └──────────────────────────┬───────────────────────────────┘      │
│                             │                                       │
│             ┌───────────────┼───────────────┐                       │
│             ▼               ▼               ▼                       │
│  ┌─────────────────┐ ┌─────────────┐ ┌─────────────────┐            │
│  │   PostgreSQL    │ │    Redis    │ │      File       │            │
│  │   (Port 5432)  │ │  (Port 6379)│ │    Storage      │            │
│  │                 │ │             │ │                 │            │
│  │ ┌─────────────┐ │ │ ┌─────────┐ │ │ ┌─────────────┐ │            │
│  │ │   public   │ │ │ │Sessions │ │ │ │  /uploads  │ │            │
│  │ │   schema   │ │ │ └─────────┘ │ │ └─────────────┘ │            │
│  │ └─────────────┘ │ │             │ │                 │            │
│  │ ┌─────────────┐ │ │             │ │                 │            │
│  │ │school_HBH S│ │ │             │ │                 │            │
│  │ │school_ABC │ │ │             │ │                 │            │
│  │ └─────────────┘ │ │             │ │                 │            │
│  └─────────────────┘ └─────────────┘ └─────────────────┘            │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Authors

- **SchoolSync Team** - Initial development

---

<div align="center">

**SchoolSync** — *Интелигентно управление на образователно оборудване*

⭐ Star this project if you find it helpful!

</div>

