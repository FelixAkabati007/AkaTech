# AkaTech Portal System Specification

**Version:** 1.0.0  
**Date:** 2025-12-18  
**Status:** Draft / MVP Specification

---

## 1. System Overview

### Purpose
The AkaTech Portal System is a unified platform designed to streamline the interaction between AkaTech IT Solutions and its clients. It serves two primary functions:
1.  **Client Portal:** Provides clients with a self-service interface to view project progress, manage invoices, request support, and update profile settings.
2.  **Admin Portal:** Empowers AkaTech staff to manage projects, billing, support tickets, and client accounts efficiently from a centralized dashboard.

### Relationship
The two portals share a common database and API backend but offer distinct frontend experiences secured by Role-Based Access Control (RBAC). Actions taken in the Admin Portal (e.g., updating a project phase) instantly reflect in the Client Portal. Conversely, client actions (e.g., paying an invoice) update records visible to admins.

### High-Level Architecture
-   **Frontend:** React Single Page Application (SPA) with shared component libraries (`AkaTech_Components`).
-   **State Management:** React Context / Hooks for local state; intended integration with a global store (e.g., Redux or Query) for data syncing.
-   **Backend (Conceptual):** RESTful API serving JSON data.
-   **Database:** Relational database (SQL) to handle structured data like users, projects, and invoices.

---

## 2. Module-by-Module Specifications

### 2.1 Client Portal (MVP)

| Module | Purpose | Key Features | Permissions | Data Visibility |
| :--- | :--- | :--- | :--- | :--- |
| **Dashboard** | At-a-glance overview of account status. | • Widgets: Active Projects, Invoices Due, Support Tickets, System Status.<br>• Quick Actions: Create Invoice, Update Profile, Contact Support. | Read-only (except Quick Actions) | Client-specific data only. |
| **Project Module** | Track project progress and deliverables. | • List of active/past projects.<br>• Timeline view (Initiation, Design, Dev).<br>• Downloadable deliverables.<br>• Status indicators. | Read-only | Public project details & client-visible notes. |
| **Support Module** | Manage help requests. | • Create new tickets.<br>• View ticket history & status.<br>• Reply to tickets. | Read/Write | Own tickets only. |
| **Billing Module** | Financial management. | • View invoice list & details.<br>• Payment history log.<br>• Download PDF invoices. | Read-only (Payment action external) | Own financial records. |
| **Profile Module** | User account management. | • Update personal info.<br>• Change password.<br>• Notification settings. | Read/Write | Own profile data. |

### 2.2 Admin Portal (MVP)

| Module | Purpose | Key Features | Permissions | Data Visibility |
| :--- | :--- | :--- | :--- | :--- |
| **Dashboard** | High-level operational view. | • Overview widgets (Financial, Projects, Support).<br>• System Status toggle.<br>• Quick Actions (Create Project, Invoice, etc.). | Admin/Manager | Aggregate system data. |
| **Project Mgmt** | Full lifecycle project control. | • CRUD Projects.<br>• Update phases & timelines.<br>• Upload deliverables.<br>• Internal vs. Client notes. | Admin/Manager | All project data (including internal notes). |
| **Billing & Invoicing** | Revenue management. | • Create/Send invoices.<br>• Mark as paid.<br>• Manual payment entry.<br>• PDF generation. | Admin/Finance | All financial records. |
| **Support & Comm.** | Issue resolution center. | • Ticket queue management.<br>• Assign tickets.<br>• Internal notes on tickets.<br>• Post announcements. | Admin/Support | All tickets & system announcements. |
| **User Management** | Account administration. | • Create/Edit client accounts.<br>• Manage Admin roles.<br>• Deactivate users. | Super Admin | All user data. |
| **Settings** | System configuration. | • Company details.<br>• Branding.<br>• Notification rules.<br>• System maintenance mode. | Super Admin | System-wide config. |

---

## 3. Functional Requirements

### 3.1 General
-   **Validation:** All forms must validate inputs (email format, required fields, numeric constraints) before submission.
-   **Error States:** UI must display user-friendly error messages for network failures or validation errors.
-   **Fallbacks:** Dashboards must show empty states (e.g., "No active projects") when no data is available.

### 3.2 Specific Actions
-   **Projects:**
    -   Admins can move projects between phases: *Initiation → Design → Development → Deployment → Maintenance*.
    -   Clients can only view current phase and status (*In Progress, Completed, Pending*).
-   **Invoicing:**
    -   System calculates totals based on line items.
    -   "Mark as Paid" triggers an email receipt to the client.
-   **Support:**
    -   New tickets default to "Open" status.
    -   Admin replies trigger "Waiting on Client" status.

---

## 4. Data Requirements (Conceptual)

### Key Entities & Attributes

1.  **Users:** `id`, `name`, `email`, `role` (Client, Admin, Manager), `password_hash`, `status`, `created_at`.
2.  **Projects:** `id`, `client_id`, `title`, `description`, `start_date`, `status`, `current_phase`.
3.  **ProjectPhases:** `id`, `project_id`, `name` (e.g., Design), `status` (Pending/In Progress/Done), `start_date`, `end_date`.
4.  **Invoices:** `id`, `client_id`, `project_id`, `amount`, `due_date`, `status` (Draft/Sent/Paid/Overdue), `items` (JSON).
5.  **Tickets:** `id`, `client_id`, `subject`, `status` (Open/In Progress/Resolved), `priority`, `assigned_to`.
6.  **TicketMessages:** `id`, `ticket_id`, `sender_id`, `message`, `is_internal`, `timestamp`.
7.  **ActivityLogs:** `id`, `user_id`, `action`, `entity_type`, `entity_id`, `details`, `timestamp`.
8.  **Notifications:** `id`, `user_id`, `type`, `message`, `is_read`, `created_at`.

---

## 5. Interaction Flows

### 5.1 Project Lifecycle (Admin)
1.  Navigate to **Project Management** > **Create Project**.
2.  Select **Client**, enter **Title** and **Description**.
3.  Define **Phases** and initial dates.
4.  Click **Create**.
5.  *System:* Creates project, notifies client, logs activity.

### 5.2 Sending an Invoice (Admin)
1.  Navigate to **Billing** > **New Invoice**.
2.  Select **Client** and linked **Project**.
3.  Add line items (Service, Qty, Rate).
4.  Set **Due Date**.
5.  Click **Save Draft** or **Send**.
6.  *System:* Generates PDF, emails client, updates dashboard stats.

### 5.3 Resolving Support Ticket (Admin)
1.  View **Support Queue**.
2.  Select ticket with status "Open".
3.  Review client message.
4.  Add **Internal Note** if needed (visible only to staff).
5.  Type reply and click **Send & Close**.
6.  *System:* Updates status to "Resolved", notifies client.

---

## 6. UI/UX Structure

### 6.1 Layouts
-   **Admin Layout:** Collapsible Sidebar (Left), Header (Top with User/Notifs), Main Content Area (Center).
-   **Client Layout:** Similar structure but simplified navigation options.

### 6.2 Navigation Structure
-   **Admin:** Dashboard | Projects | Billing | Support | Users | Reports | Settings
-   **Client:** Dashboard | My Projects | Billing | Support | Profile

### 6.3 Key Components
-   **Data Tables:** Sortable, filterable, paginated (for Projects, Invoices, Users).
-   **Status Badges:** Color-coded (Green=Success, Yellow=Warning/Pending, Red=Error/Overdue).
-   **Modals:** For quick actions (Create Ticket, Edit User) to maintain context.
-   **Timeline Component:** Horizontal or vertical step progress bar for Project Phases.

---

## 7. Permissions & Access Control

| Role | Access Level |
| :--- | :--- |
| **Super Admin** | Full access to all modules, settings, and user management. |
| **Project Manager** | Read/Write Projects, Support. Read-only Billing. No User Mgmt. |
| **Finance Admin** | Read/Write Billing. Read-only Projects. |
| **Client** | Read own data. Write Support, Profile. No access to Admin modules. |

**Security:**
-   JWT-based authentication.
-   API endpoints validate user role before execution.
-   Data scoping (Clients can only query `where client_id = current_user.id`).

---

## 8. System Notifications

### Types
1.  **Transactional:** Invoice Created, Password Reset.
2.  **Activity:** Project Phase Updated, Ticket Replied.
3.  **System:** Maintenance Scheduled, Announcements.

### Triggers
-   **Project Update:** Notify Client (Email + In-App).
-   **New Ticket:** Notify Admin Group (Email + In-App).
-   **Invoice Overdue:** Notify Client (Email).

---

## 9. Activity Logging

**Events Logged:**
-   Login/Logout.
-   Create/Update/Delete operations on core entities.
-   File uploads/downloads.
-   Status changes (Phase change, Ticket status).

**Display:**
-   **Admin Dashboard:** "Recent Activity" stream showing global actions.
-   **Project Details:** "History" tab showing specific project changes.

---

## 10. Integration Notes

-   **Syncing:** Admin actions must immediately invalidate relevant client-side queries (or update real-time via WebSockets if planned) to ensure clients see latest status.
-   **Data Flow:** Admin Inputs -> Database -> API -> Client View.
-   **Legacy Compatibility:** Ensure new "Portal" pages co-exist with existing public marketing pages.

---

## 11. Database Schema

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) CHECK (role IN ('super_admin', 'project_manager', 'finance', 'client')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    client_id INT REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_phases (
    id SERIAL PRIMARY KEY,
    project_id INT REFERENCES projects(id),
    phase_name VARCHAR(100),
    status VARCHAR(50) CHECK (status IN ('pending', 'in_progress', 'completed')),
    start_date DATE,
    end_date DATE
);

CREATE TABLE invoices (
    id SERIAL PRIMARY KEY,
    client_id INT REFERENCES users(id),
    project_id INT REFERENCES projects(id),
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE,
    status VARCHAR(20) CHECK (status IN ('draft', 'sent', 'paid', 'overdue')),
    pdf_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    client_id INT REFERENCES users(id),
    subject VARCHAR(200),
    status VARCHAR(20) DEFAULT 'open',
    priority VARCHAR(20) DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    action VARCHAR(100),
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 12. API Endpoints

### Authentication
-   `POST /api/auth/login` - Authenticate and receive token.
-   `POST /api/auth/logout` - Invalidate session.
-   `GET /api/auth/me` - Get current user details.

### Projects
-   `GET /api/projects` - List projects (Filter by client if user is Client).
-   `GET /api/projects/:id` - Get details.
-   `POST /api/projects` - Create project (Admin only).
-   `PUT /api/projects/:id` - Update details/status (Admin only).
-   `POST /api/projects/:id/phases` - Add phase.

### Invoices
-   `GET /api/invoices` - List invoices.
-   `GET /api/invoices/:id` - Get details.
-   `POST /api/invoices` - Generate invoice (Admin only).
-   `POST /api/invoices/:id/pay` - Record payment (Admin/System).

### Support
-   `GET /api/tickets` - List tickets.
-   `POST /api/tickets` - Create ticket.
-   `POST /api/tickets/:id/reply` - Add message to ticket.
-   `PUT /api/tickets/:id/status` - Update status (Admin only).

### Users (Admin Only)
-   `GET /api/users` - List all users.
-   `POST /api/users` - Create new user/client.
-   `PUT /api/users/:id` - Update user role/status.
