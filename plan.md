# 📜 University Management System (UMS) - Master Blueprint

## 1. Project Overview
A cloud-based university administration platform built on a **Strict Tag-Based Hierarchy**. The system ensures data abstraction, where sensitive information (like salaries or inter-departmental marks) is restricted based on user roles, while maintaining a seamless experience across all devices.

---

## 2. Technical Stack & UI Identity
### Core Stack
* **Frontend:** React.js (Vite) + Tailwind CSS + Shadcn/UI
* **Backend:** Node.js + Express.js
* **Database:** Supabase (PostgreSQL)
* **ORM:** Prisma
* **State Management:** TanStack Query (React Query)
* **File Storage:** Supabase Storage (Photos/Documents)

### Role-Based Color Themes
| User Role | Theme Color | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Admin (Principal/CoE)** | Royal Purple | `#4F46E5` | Executive Authority |
| **HR Admin** | Teal | `#0D9488` | Operational Management |
| **Staff (HOD/Mentor)** | Professional Blue | `#2563EB` | Academic Productivity |
| **Student** | Emerald Green | `#10B981` | Growth & Progress |

---

## 3. Database Architecture (Supabase/Postgres)
The system utilizes a relational structure to enforce data integrity.

### Core Tables
* **Users (Super Table):** Credentials, `user_type`, and `tag_access`.
* **Staff_Profiles:** Personal details, department, and **Salary** (restricted).
* **Student_Profiles:** Reg No, Batch ID, and `profile_locked` status.
* **Permanent_Marks:** The "Clean" record of all passed subjects.
* **Arrears_Transit:** A "Waiting Room" for failed subjects; marks move to Permanent only upon clearing.
* **Audit_Logs:** Records every sensitive change (Who changed a mark? Who deleted a user?).

---

## 4. Development Phases

### Phase 1: Identity & Access Control
* **Auth Engine:** JWT-based login identifying the "Tag" immediately.
* **Departmental Isolation:** Middleware ensures HODs/Staff only access data within their assigned `dept_id`.
* **Student Self-Service:** HR creates a "Shell Profile"; the student completes personal data on first login, which then **locks** for security.

### Phase 2: Administrative & Staff Workflows
* **HR Onboarding:** * Individual entry for Staff/Admins.
    * **Bulk Upload:** Excel/CSV parsing for new student batches.
* **HOD Command:** Assigns Class Advisors (Batch level) and Mentors (Groups of 15-20).
* **Staff Tools:** * **Attendance:** Smart checkbox system (default "Present").
    * **Counseling Logs:** Private notes recorded by Mentors, visible only to HOD/Principal.

### Phase 3: Examination & Results Engine
* **CoE Dashboard:** Sets schedules and "Locks" marks after entry deadlines.
* **The Split Logic:** * **Pass:** Move to `Permanent_Marks`.
    * **Fail:** Move to `Arrears_Transit`.
* **Super-Senior Management:** If a batch graduates but a student has arrears, status flips to "Super-Senior." They retain access only to the Arrear Portal.

### Phase 4: Scaling & Analytics
* **Principal’s Analytics:** University-wide pass %, admission trends, and "Red Flag" monitors.
* **Automated Cleanup:** * Daily deletion of expired temporary permissions.
    * Annual archiving of ephemeral batch data (daily attendance logs) once consolidated.
* **Triple-Lock Deletion:** Sensitive data deletion requires approval from **HR + CoE + Principal**.

---

## 5. Critical Logic & Security
* **Data Lifecycle:** Active daily logs are ephemeral. Upon batch deactivation, data is consolidated into the permanent record, and raw logs are purged to keep the DB lean.
* **Financial Shield:** Salary/Fee data is restricted via Backend Middleware based on Tag Access.
* **Soft Deletion:** Records are flagged `deleted_at` first, allowing a 30-day recovery window before hard-deletion.
* **File Security:** Images are stored in Cloud Storage; only secure URLs are stored in the database.

---

## 6. Directory Structure
```text
/root
  ├── /backend
  │    ├── /middleware (Tag-based access logic)
  │    ├── /routes (HR, HOD, Student, Staff routes)
  │    ├── /controllers (Business logic for Marks/Attendance)
  │    └── server.js
  ├── /frontend
  │    ├── /src
  │    │    ├── /components (UI: Sidebar, Tables, Charts)
  │    │    ├── /hooks (TanStack Query hooks)
  │    │    ├── /pages (Admin, HR, HOD, Student Dashboards)
  │    │    └── App.jsx (Theme/Role-based routing)
  └── plan.md