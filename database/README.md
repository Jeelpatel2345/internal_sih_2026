# ⚡ Neon PostgreSQL Database Architecture & Connectivity

This directory contains the database design, DDL schema scripts, automated table setup scripts, and Neon Management API integrations for the **Internal SIH 2026 Registration Portal**.

---

## 🚀 Key Database Specifications

- **Database Provider**: [Neon.tech](https://neon.tech) (Serverless PostgreSQL)
- **Project Name**: `Jeel internal_sih_2026-main`
- **Project ID**: `sweet-wildflower-13746772`
- **Primary Region**: `aws-ap-southeast-1` (Singapore)
- **Database Engine**: PostgreSQL v18
- **Pooled Host**: `ep-noisy-art-az88msje-pooler.c-3.ap-southeast-1.aws.neon.tech`
- **Default Database**: `neondb`
- **Default Role**: `neondb_owner`
- **Management API Key**: `napi_2ksm0ipqqux01l4722li739r98ng2agmrnnsdsa3oqa77e0i7qlmhahjlb8hstib`

---

## 📁 Directory Structure

```
database/
├── schema.sql              # Standard ANSI PostgreSQL DDL schema with constraints & triggers
├── setup_neon_tables.cjs   # Automated Node.js script to execute schema & create tables on Neon DB
├── neon_api.cjs            # CLI helper to query Neon REST API (Projects, Branches, Connection URIs)
└── README.md               # Database documentation & REST API reference
```

---

## 🗄️ Relational Database Schema & Tables

The Neon Database consists of 7 relational tables designed with strict foreign key constraints, indexing, and auto-updating `updated_at` triggers.

```
+------------------+         +--------------------+         +--------------------+
|     admins       |         |       teams        |         |      mentors       |
+------------------+         +--------------------+         +--------------------+
| id (PK)          |         | id (PK)            |<--------| id (PK)            |
| email (UQ)       |         | registration_id    | (1:1)   | team_id (FK, UQ)   |
| password_hash    |         | team_name (UQ)     |         | full_name          |
| role             |         | status             |         | email, contact     |
+------------------+         +--------------------+         +--------------------+
         ^                            |
         | (1:N)                      | (1:N)
         |                            v
+------------------+         +--------------------+
|  activity_logs   |         |    participants    |
+------------------+         +--------------------+
| id (PK)          |         | id (PK)            |
| admin_id (FK)    |         | team_id (FK)       |
| action, target   |         | full_name, gender  |
+------------------+         | enrollment_number  |
                             | is_leader (BOOL)   |
                             +--------------------+
```

### Table Definitions

#### 1. `admins`
Stores platform administrative accounts with role-based permissions (`super_admin`, `admin`).
- `id`: UUID (Primary Key)
- `name`: VARCHAR(255)
- `email`: VARCHAR(255) UNIQUE
- `password_hash`: VARCHAR(255) (Bcrypt 12 rounds)
- `role`: VARCHAR(50) (`super_admin` | `admin`)
- `refresh_tokens`: TEXT[] (Active JWT refresh token list)
- `last_login`: TIMESTAMPTZ
- `is_active`: BOOLEAN

#### 2. `teams`
Stores registered hackathon teams.
- `id`: UUID (Primary Key)
- `registration_id`: VARCHAR(50) UNIQUE (e.g. `SIH2026-9A8F`)
- `team_name`: VARCHAR(255) UNIQUE
- `status`: VARCHAR(50) (`pending_mentor` | `completed`)

#### 3. `participants`
Stores team leaders and student team members (up to 6 per team).
- `id`: UUID (Primary Key)
- `team_id`: UUID (Foreign Key -> `teams.id` ON DELETE CASCADE)
- `full_name`: VARCHAR(255)
- `gender`: VARCHAR(20) (`Male` | `Female` | `Other`)
- `enrollment_number`: VARCHAR(100)
- `semester`: INTEGER (1-8)
- `department`: VARCHAR(255)
- `mobile`: VARCHAR(20)
- `email`: VARCHAR(255)
- `is_leader`: BOOLEAN (True for team leader)

#### 4. `mentors`
Stores assigned faculty/industry mentor details for each team (1:1 relationship).
- `id`: UUID (Primary Key)
- `team_id`: UUID (Foreign Key -> `teams.id` ON DELETE CASCADE, UNIQUE)
- `full_name`: VARCHAR(255)
- `contact_number`: VARCHAR(20)
- `email`: VARCHAR(255)
- `department`: VARCHAR(255)
- `institute`: VARCHAR(255)
- `office_address`: TEXT

#### 5. `otps`
Stores temporary OTPs for admin password reset requests.
- `id`: UUID (Primary Key)
- `email`: VARCHAR(255)
- `otp`: VARCHAR(10)
- `purpose`: VARCHAR(50) (`password_reset`)
- `expires_at`: TIMESTAMPTZ
- `used`: BOOLEAN

#### 6. `settings`
Global portal configuration settings.
- `id`: UUID (Primary Key)
- `registration_open`: BOOLEAN
- `registration_deadline`: TIMESTAMPTZ
- `site_title`: VARCHAR(255)
- `maintenance_mode`: BOOLEAN
- `updated_by`: UUID (Foreign Key -> `admins.id`)

#### 7. `activity_logs`
Audit logs recording administrative actions.
- `id`: UUID (Primary Key)
- `admin_id`: UUID (Foreign Key -> `admins.id`)
- `admin_name`: VARCHAR(255)
- `action`: VARCHAR(255)
- `target`: VARCHAR(255)
- `details`: TEXT
- `ip`: VARCHAR(50)
- `timestamp`: TIMESTAMPTZ

---

## 🛠️ Automated Setup & Table Management

### 1. Initialize Tables in Neon Database
To automatically connect to Neon DB using the API key and execute `schema.sql`:

```bash
node database/setup_neon_tables.cjs
```

This will output:
```text
🚀 Connecting to Neon PostgreSQL Database...
⚡ Retrieved dynamic connection URI from Neon Management API.
🔗 Target Connection Host: ep-noisy-art-az88msje-pooler.c-3.ap-southeast-1.aws.neon.tech
✅ Successfully connected to Neon Database!
📄 Executing DDL Schema script (schema.sql)...
🎉 All Neon DB tables, indexes, and triggers created successfully!

📊 Created Tables in Neon DB:
  - activity_logs
  - admins
  - mentors
  - otps
  - participants
  - settings
  - teams
```

### 2. Query Neon REST Management API
Using `neon_api.cjs`, you can interact with Neon's Management REST API:

```bash
# Get project information
node database/neon_api.cjs info

# List branches
node database/neon_api.cjs branches

# Get connection URI dynamically
node database/neon_api.cjs connection
```

---

## 🔑 Environment Variables Configuration

In `backend/.env`:

```env
NEON_API_KEY=napi_2ksm0ipqqux01l4722li739r98ng2agmrnnsdsa3oqa77e0i7qlmhahjlb8hstib
NEON_PROJECT_ID=sweet-wildflower-13746772
DATABASE_URL=postgresql://neondb_owner:npg_KwdEyvOSn6s0@ep-noisy-art-az88msje-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
NEON_DATABASE_URL=postgresql://neondb_owner:npg_KwdEyvOSn6s0@ep-noisy-art-az88msje-pooler.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require
```

---

## 📡 REST API & Queries Quick Reference

### Sample SQL Queries for Backend Integration

- **Insert New Team & Leader**:
  ```sql
  WITH new_team AS (
    INSERT INTO teams (registration_id, team_name, status)
    VALUES ('SIH2026-1001', 'Code Knights', 'pending_mentor')
    RETURNING id
  )
  INSERT INTO participants (team_id, full_name, gender, enrollment_number, semester, department, mobile, email, is_leader)
  SELECT id, 'John Doe', 'Male', '21012011001', 6, 'Computer Engineering', '9876543210', 'john@example.com', TRUE
  FROM new_team;
  ```

- **Fetch Team Details with Members and Mentor**:
  ```sql
  SELECT 
    t.id AS team_id,
    t.registration_id,
    t.team_name,
    t.status,
    m.full_name AS mentor_name,
    m.email AS mentor_email,
    m.contact_number AS mentor_contact,
    p.full_name AS participant_name,
    p.enrollment_number,
    p.is_leader
  FROM teams t
  LEFT JOIN mentors m ON t.id = m.team_id
  LEFT JOIN participants p ON t.id = p.team_id
  WHERE t.registration_id = 'SIH2026-1001';
  ```
