# 🎓 University Management System (UMS)
A cloud-based, role-aware university administration platform built with a **Tag-Based Hierarchy**. The system enforces strict data abstraction — sensitive information like salaries or inter-departmental marks is restricted based on user roles — while delivering a seamless, responsive experience across all devices.
---
## ✨ Key Features
- **🔐 Role-Based Access Control** — Four distinct user roles (Admin, HR, Staff, Student), each with isolated permissions, color-coded UI themes, and scoped data access.
- **🎨 Dynamic Theme Engine** — The entire UI palette shifts based on the logged-in user's role for instant visual identification.
- **📊 University Analytics** — Principal-level dashboards for pass rates, department comparisons, and batch trends.
- **📝 Exam & Results Engine** — Automatic pass/fail splitting into `Permanent_Marks` and `Arrears_Transit` tables.
- **👨‍🏫 Staff Workflows** — Attendance grids, mentor group management, and private counseling logs.
- **📥 Bulk Student Onboarding** — HR can upload entire batches via CSV/Excel with auto-generated credentials.
- **📱 Fully Responsive** — Optimized for both desktop and mobile, navigable from any device on the network.
---
## 🎨 Role-Based Color Themes
| Role | Theme | Hex Code | Purpose |
| :--- | :--- | :--- | :--- |
| **Admin** (Principal/CoE) | Royal Purple | `#4F46E5` | Executive Authority |
| **HR Admin** | Teal | `#0D9488` | Operational Management |
| **Staff** (HOD/Mentor) | Professional Blue | `#2563EB` | Academic Productivity |
| **Student** | Emerald Green | `#10B981` | Growth & Progress |
---
## 🛠️ Tech Stack
| Layer | Technology |
| :--- | :--- |
| **Frontend** | React.js (Vite) + Tailwind CSS + Shadcn/UI |
| **Backend** | Node.js + Express.js |
| **Database** | Supabase (PostgreSQL) |
| **ORM** | Prisma |
| **State Mgmt** | TanStack Query (React Query) |
| **File Storage** | Supabase Storage |
---
## 📁 Project Structure

## 📁 Project Structure

| Path | Description |
| :--- | :--- |
| `backend/` | Server-side application |
| ├── `middleware/` | Tag-based access control logic |
| ├── `routes/` | HR, HOD, Student, Staff API routes |
| ├── `controllers/` | Business logic for Marks & Attendance |
| └── `server.js` | Express server entry point |
| `frontend/` | Client-side React application |
| ├── `src/components/` | UI: Sidebar, Navbar, Tables, Charts |
| ├── `src/context/` | ThemeContext for role-based theming |
| ├── `src/pages/` | Admin, HR, Staff, Student Dashboards |
| ├── [src/App.jsx](cci:7://file:///p:/LMS/frontend/src/App.jsx:0:0-0:0) | Theme & Role-based routing |
| ├── [tailwind.config.js](cci:7://file:///p:/LMS/frontend/tailwind.config.js:0:0-0:0) | Tailwind CSS configuration |
| └── [vite.config.js](cci:7://file:///p:/LMS/frontend/vite.config.js:0:0-0:0) | Vite dev server configuration |
| [schema.prisma](cci:7://file:///p:/LMS/schema.prisma:0:0-0:0) | Database schema (Prisma ORM) |
| [plan.md](cci:7://file:///p:/LMS/plan.md:0:0-0:0) | Master project blueprint |
| [implementation.md](cci:7://file:///p:/LMS/implementation.md:0:0-0:0) | Phase-by-phase execution guide |


# 🚀 Development Phases
## Phase 1: Identity & UI Shells ✅
Frontend layouts, responsive navigation, role-based theme engine, and mock screens for all 4 user dashboards.

## Phase 2: Database & Auth Infrastructure 🔜
Supabase/Prisma connection, JWT-based login, tag-based middleware, and departmental data isolation.

## Phase 3: Business Logic & Workflows
HR bulk onboarding, attendance module, counseling logs, marks entry, and the Pass/Fail split engine.

## Phase 4: Lifecycle & Security
Batch deactivation, super-senior management, triple-lock deletion, automated cleanup, and PDF grade exports.

# ⚡ Getting Started

## Prerequisites

*Node.js (v18+)*

*npm or yarn*

## Installation

**Clone the repository**

  git clone https://github.com/Sorcerer-dev/Learning-Management-System.git
  
  cd Learning-Management-System

**Switch to the development branch**

  git checkout phase-1

**Install frontend dependencies**

  cd frontend

  npm install
  
  npm run dev

**Start the development server**

  npm run dev
  
  The app will be available at http://localhost:5173. To access from other devices on the same network, use your machine's local IP address (e.g.,                 http://10.189.51.43:5173).

##🔒 Security Principles

**JWT Authentication** — Every API request verifies tag_access from the token.

**Departmental Isolation** — HODs/Staff can only query records within their assigned department.

**Financial Shield** — Salary/Fee data is stripped from responses unless the user is HR or Principal.

**Soft Deletion** — Records are flagged with deleted_at first, with a 30-day recovery window.

**Triple-Lock Deletion** — Sensitive data requires approval from HR + CoE + Principal.

---

##📄 License

This project is for educational purposes.

**Built with ❤️** *by Sorcerer-dev*

