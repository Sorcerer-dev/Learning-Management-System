🚀 UMS Implementation Guide: Agent Execution Plan
📌 General Instructions for Agent
Source of Truth: Refer to plan.md for business logic and schema.prisma for data structures.

Tech Stack: React (Vite), Tailwind CSS, Node.js, Express, Supabase (PostgreSQL), Prisma.

Security Rule: Every API request must verify the tag_access (Role) from the JWT.

UI Principle: Use role-based color themes for instant user identification.

🎨 Phase 1: Frontend & UI Identity (Visual Shells)
Goal: Build the responsive layouts and navigation for all 4 user types before connecting the database.

1.1 Global Layout & Theme Engine
Create a Layout component with a Sidebar and Navbar.

Implement a ThemeContext or Tailwind-based logic to swap colors based on the user's Tag:

Admin (Principal/CoE): Royal Purple (#4F46E5) & Navy.

HR Admin: Teal (#0D9488).

Staff (HOD/Mentor/Advisor): Professional Blue (#2563EB).

Student/CR: Emerald Green (#10B981).

1.2 The "First Login" Student Portal
Build a mandatory profile completion form for new students.

Fields: DOB, Blood Group, Address, Parent Contact, Gender.

Logic: This page must block all other student routes if profile_locked is false.

1.3 Dashboard Wireframes
HR Dashboard: Staff management table + "Bulk Student Upload" (CSV/Excel zone).

HOD Dashboard: Department stats + "Assign Mentor/Advisor" interface.

Staff Dashboard: Student list + Attendance marking grid (Default: All Present).

Student Dashboard: Marks summary cards + Attendance percentage gauge.

⚙️ Phase 2: Database & Auth Infrastructure
Goal: Connect the UI to the Supabase/Postgres "Source of Truth."

2.1 Database Initialization
Connect Prisma to the Supabase Postgres URL.

Push the schema.prisma to the cloud database.

Seed the database with one Root HR Admin and Departments (CSE, ECE, etc.).

2.2 Tag-Based Authentication
Build a /login endpoint that validates credentials.

Generate a JWT containing id, email, dept_id, and tag_access.

Store the token in a secure cookie or local storage.

2.3 Access Control Middleware
Create a verifyTag(['AllowedTag1', 'AllowedTag2']) middleware.

Strict Logic: - Students cannot access /api/staff.

HODs can only query records where dept_id matches their own.

Salary fields must be stripped from JSON responses unless the user is HR or Principal.

🛠️ Phase 3: Business Logic (Workflows)
Goal: Make the management buttons functional.

3.1 HR Bulk Onboarding (The Engine)
Use PapaParse on the frontend to parse CSV files.

Backend Script: For every row, create a User record and a StudentProfile.

Assign default passwords and set profile_locked: false.

3.2 Staff Daily Operations
Attendance Module: Save daily attendance to an ephemeral table.

Counseling Logs: Create a secure table for Mentor notes.

CR Delegation: Build the "Temporary Permission" system allowing CRs to view batch attendance.

3.3 Examination & "The Split"
Marks Entry: Staff enters marks for their subjects.

CoE Publication Logic:

Loop through entries:

If Mark >= 40: Write to Permanent_Marks.

If Mark < 40: Write to Arrears_Transit (The Waiting Room).

🛡️ Phase 4: Lifecycle & Security Refinement
Goal: Implement the "Stray Student" logic and secure deletion.

4.1 Batch Deactivation & Alumni Transition
Create an HR utility to move a Batch (e.g., 2022-26) to "Alumni" status.

Condition: If a student has records in Arrears_Transit, set status to Super-Senior instead of Alumni.

4.2 Triple-Lock Deletion Portal
Create a Deletion_Requests table.

Logic: A record is only hard-deleted after HR requests it AND both the CoE and Principal "Approve" via their respective dashboards.

4.3 Automated Cleanup & Exports
Implement a cleanup script to purge ephemeral messages and old attendance logs once the batch is deactivated.

Integrate jspdf for students to download official semester grade sheets.

🏁 Expected Outcomes
Seamless Portability: Works on mobile and desktop due to Tailwind responsiveness.

Data Integrity: The "Permanent Marks" table remains clean and audit-ready.

Instant Recognition: Users know their role's scope purely based on the Royal Purple, Teal, Blue, or Green UI theme.