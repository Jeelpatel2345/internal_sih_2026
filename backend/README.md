# ⚙️ Internal SIH 2026 Backend REST API

High-performance, secure Node.js & Express REST API with TypeScript, supporting **Neon Serverless PostgreSQL** and MongoDB.

---

## 🌟 Key Features

- **Neon PostgreSQL Integration**: Connection pooling using `@neondatabase/serverless` and `pg`.
- **JWT Authentication**: Access tokens (15m) and Refresh tokens (7d) with hashed secret handling.
- **Role-Based Access Control (RBAC)**: Supports `super_admin` and `admin` permissions.
- **Team Registration Flow**: Student registration, member limit validation, and mentor assignment.
- **Security Protocols**: Helmet HTTP headers, CORS preflight guards, rate limiting, and parameter sanitization.
- **Comprehensive API Documentation**: Clean REST endpoints for authentication, team management, exports (Excel/PDF), and system health.

---

## 🚀 Quick Start

### 1. Installation

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file in `backend/` (or copy from `.env.example`):

```env
PORT=5000
NODE_ENV=development

# Neon PostgreSQL Database Configuration
NEON_API_KEY=napi_2ksm0ipqqux01l4722li739r98ng2agmrnnsdsa3oqa77e0i7qlmhahjlb8hstib
NEON_PROJECT_ID=sweet-wildflower-13746772
DATABASE_URL=postgresql://neondb_owner:npg_KwdEyvOSn6s0@ep-noisy-art-az88msje-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
NEON_DATABASE_URL=postgresql://neondb_owner:npg_KwdEyvOSn6s0@ep-noisy-art-az88msje-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require

# Secrets
JWT_ACCESS_SECRET=super_secret_access_key_internal_sih_2026
JWT_REFRESH_SECRET=super_secret_refresh_key_internal_sih_2026

# Application URLs
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3001

# Seed Data
SEED_ADMIN_NAME=Super Admin
SEED_ADMIN_EMAIL=admin@sih2026.ac.in
SEED_ADMIN_PASSWORD=Admin@SIH2026!
```

### 3. Initialize Neon DB Tables

Run the table initialization script to build all PostgreSQL tables in Neon DB:

```bash
node ../database/setup_neon_tables.cjs
```

### 4. Development Server

Start server with auto-reload:

```bash
npm run dev
```

### 5. Production Build

Compile TypeScript and start node server:

```bash
npm run build
npm start
```

---

## 📡 Backend REST API Reference

### 🏥 System & Database Status

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | Server uptime & Neon DB / MongoDB status check | No |
| `GET` | `/api/v1/db-status` | Detailed Neon DB tables count & server stats | No |

---

### 🔑 Authentication Routes (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | Admin login & returns JWT access/refresh tokens | No |
| `POST` | `/api/v1/auth/refresh` | Refresh expired access token using refresh token | No |
| `POST` | `/api/v1/auth/logout` | Revoke active refresh token | Yes |
| `POST` | `/api/v1/auth/forgot-password` | Request password reset OTP | No |
| `POST` | `/api/v1/auth/verify-otp` | Verify 6-digit password reset OTP | No |
| `POST` | `/api/v1/auth/reset-password` | Set new password using verified token | No |

---

### 👥 Team Registration Routes (`/api/v1/teams`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/teams/register` | Register a new team with leader and members | No |
| `GET` | `/api/v1/teams/:registrationId` | Get team details by registration ID | No |
| `GET` | `/api/v1/teams/check-name` | Check if team name is already taken | No |

---

### 👨‍🏫 Mentor Routes (`/api/v1/mentor`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/mentor/submit` | Submit mentor consent for team | No |
| `GET` | `/api/v1/mentor/details/:registrationId` | Get mentor submission details | No |

---

### 🛡️ Admin Management Routes (`/api/v1/admin`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/teams` | Get paginated list of all teams with filters | Admin |
| `GET` | `/api/v1/admin/teams/:id` | Get full team detail by ID | Admin |
| `PUT` | `/api/v1/admin/teams/:id` | Update team details | Admin |
| `DELETE` | `/api/v1/admin/teams/:id` | Delete team record | Super Admin |
| `GET` | `/api/v1/admin/activity-logs` | Fetch admin audit log history | Admin |
| `GET` | `/api/v1/admin/settings` | Get site settings | Admin |
| `PUT` | `/api/v1/admin/settings` | Update site settings (deadline, registration open) | Super Admin |

---

### 📊 Dashboard & Analytics (`/api/v1/admin/dashboard`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/dashboard/stats` | Total teams, completed registrations, branch metrics | Admin |
| `GET` | `/api/v1/admin/dashboard/department-breakdown` | Department-wise registration stats | Admin |

---

### 📥 Export Routes (`/api/v1/admin/export`)

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/admin/export/excel` | Download all team & participant data as Excel | Admin |
| `GET` | `/api/v1/admin/export/pdf` | Download registration summary as PDF report | Admin |

---

## ⚡ Neon Database Helper Usage

You can execute raw SQL queries against Neon PostgreSQL anywhere in backend controllers:

```typescript
import { queryNeon } from './config/neon';

// Example: Fetch completed teams from Neon DB
const result = await queryNeon(
  'SELECT * FROM teams WHERE status = $1 ORDER BY created_at DESC;',
  ['completed']
);
console.log(result.rows);
```
