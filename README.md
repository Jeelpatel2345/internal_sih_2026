# 🏆 Internal SIH 2026 Registration Portal & Neon Database Suite

Full-stack production platform for managing **Internal Smart India Hackathon (SIH) 2026** team registrations, mentor verification, admin operations, and data analytics powered by **Neon Serverless PostgreSQL**.

---

## ⚡ Neon Database & Cloud Connectivity

The project is integrated with **Neon Serverless PostgreSQL**:

- **Neon Project ID**: `sweet-wildflower-13746772`
- **Neon Region**: `aws-ap-southeast-1` (Singapore)
- **Database Name**: `neondb`
- **Neon Management API Key**: `napi_2ksm0ipqqux01l4722li739r98ng2agmrnnsdsa3oqa77e0i7qlmhahjlb8hstib`
- **Pooled Host**: `ep-noisy-art-az88msje-pooler.c-3.ap-southeast-1.aws.neon.tech`
- **Connection String**: `postgresql://neondb_owner:npg_KwdEyvOSn6s0@ep-noisy-art-az88msje-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require`

---

## 📁 Repository Workspace Structure

```
internal_sih_2026-main/
├── database/                   # ⚡ Dedicated Database Folder
│   ├── schema.sql              # PostgreSQL DDL script with constraints & triggers
│   ├── setup_neon_tables.cjs   # Automated script to build tables on Neon DB
│   ├── neon_api.cjs            # Neon Management REST API helper
│   └── README.md               # Complete database schema & query docs
├── backend/                    # ⚙️ Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── config/neon.ts      # Neon DB Pool & Query engine
│   │   ├── models/             # Data models & schemas
│   │   ├── routes/             # REST endpoints (Auth, Teams, Admin, Export)
│   │   └── index.ts            # App entry point & health checks
│   ├── .env                    # Configured environment file with Neon keys
│   └── README.md               # Backend API documentation & endpoints
├── frontend/                   # 🎨 Student Registration Portal (React + Vite)
│   ├── src/                    # Registration form, tracker, mentor portal
│   └── README.md               # Frontend setup & component guide
└── admin/                      # 🛡️ Admin Management Dashboard (React + Vite)
    ├── src/                    # Analytics, team approval, Excel/PDF exports
    └── README.md               # Admin dashboard guide
```

---

## 🚀 Getting Started & Initialization

### 1. Initialize Tables in Neon Database
Run the setup script from project root to create all required tables (`admins`, `teams`, `participants`, `mentors`, `otps`, `settings`, `activity_logs`) on your Neon PostgreSQL instance:

```bash
node database/setup_neon_tables.cjs
```

### 2. Start Backend Server
```bash
cd backend
npm install
npm run dev
```

### 3. Start Frontend Student Portal
```bash
cd frontend
npm install
npm run dev
```

### 4. Start Admin Dashboard
```bash
cd admin
npm install
npm run dev
```

---

## 📖 Module Documentation Links

- [📁 Database Architecture & Schema Documentation](file:///d:/DEVANG%20SIH/internal_sih_2026-main/database/README.md)
- [⚙️ Backend REST API Documentation](file:///d:/DEVANG%20SIH/internal_sih_2026-main/backend/README.md)
- [🎨 Frontend Student Portal Documentation](file:///d:/DEVANG%20SIH/internal_sih_2026-main/frontend/README.md)
- [🛡️ Admin Dashboard Documentation](file:///d:/DEVANG%20SIH/internal_sih_2026-main/admin/README.md)
