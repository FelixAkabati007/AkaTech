# AkaTech Application Architecture

## 1. Executive Summary

AkaTech is a single-repository, full-stack web application for an IT services business. The current implementation is a Vite-powered React single-page application backed by an Express.js API server. Persistent application data is designed for Neon Serverless PostgreSQL, with Drizzle ORM schema definitions and SQL migrations. The application is deployable on Vercel through rewrite rules that route `/api/*` requests to the API function and all other routes to the Vite application shell.

The repository also contains an admin dashboard, a client dashboard, authentication flows, billing and subscription features, project management, support tickets, notifications, email integrations, real-time Socket.IO heartbeats, and database health monitoring.

> Important: the current application is **not a Next.js App Router application**. It uses React + Vite on the frontend and Express/CommonJS on the backend, with a small TypeScript database utility module.

## 2. High-Level System Diagram

```text
Browser
  |
  | React SPA served from Vite build
  | Fetch requests with cookie credentials
  v
Vercel / Hosting Layer
  |
  | /api/* rewrite
  v
Express API Server / Serverless Entry
  |-- Authentication and sessions
  |-- Admin/client business APIs
  |-- Health checks
  |-- Rate limiting, CORS, Helmet
  |-- Socket.IO heartbeat server
  |-- Email and OAuth integrations
  v
Data Access Layer
  |-- server/dal.cjs
  |-- server/db/connectionManager.cjs
  |-- server/db/schema.cjs
  |-- Drizzle migrations
  v
Neon Serverless PostgreSQL

External services:
  |-- Google OAuth
  |-- SMTP/Nodemailer email delivery
  |-- Paystack/Stripe payment flows where configured
  |-- GitHub API integration
  |-- Vercel Analytics
```

## 3. Repository Structure

```text
/
├── src/                         Frontend React application
│   ├── App.jsx                  SPA shell, view state, auth orchestration
│   ├── main.jsx                 React/Vite entrypoint
│   ├── index.css                Global styles and Tailwind CSS
│   ├── components/
│   │   ├── admin/               Admin dashboard modules
│   │   ├── client/              Client dashboard modules
│   │   └── shared/              Shared UI and connection components
│   ├── hooks/                   Theme, online, debounce, sync hooks
│   ├── lib/                     Actions, identity, data, cookies, constants
│   └── pages/                   Lazy-loaded static and utility pages
├── AkaTech_Components/          Reusable landing-page/UI component library
├── server/                      Express backend and server-side services
│   ├── server.cjs               Main Express server and API routes
│   ├── dal.cjs                  Data access and domain queries
│   ├── db/                      Database connection, schema, health, retry
│   ├── errors/                  Application errors and error middleware
│   ├── logging/                 Structured logger
│   ├── emailService.cjs         Email delivery functions
│   └── services/                 Third-party service managers
├── api/index.js                 Hosting/API entrypoint
├── drizzle/                     SQL migration files and metadata
├── public/                      Static images, manifest, robots, sitemap
├── scripts/                     Maintenance and operational scripts
├── docs/                        Database and coverage documentation
├── vite.config.js               Vite build configuration
├── vercel.json                  API and SPA rewrite rules
├── package.json                 Scripts and dependencies
└── full_app_architecture.md     This document
```

## 4. Frontend Architecture

### 4.1 Runtime and entrypoint

The frontend is built with React 19 and Vite 7. `src/main.jsx` mounts the React tree, while `src/App.jsx` is the primary application shell.

The app uses client-side view state rather than a route-first router. The `view` state in `App.jsx` selects the active experience:

- `landing`
- `dashboard`
- `about`
- `components`
- `docs`
- `themes`
- `performance`
- `careers`
- `privacy`
- `cookie`
- `terms`
- `plan-completion`

Pages are lazy-loaded with `React.lazy` and rendered inside `Suspense` boundaries.

### 4.2 Landing experience

The landing view composes:

- Navbar
- Hero section
- Services section
- Recommendations section
- Pricing section
- Contact section
- Footer
- Floating assistant
- Cookie consent
- Authentication modal
- Theme controls
- Toast notifications
- Scroll progress indicator

### 4.3 Authenticated dashboard experience

Once `/api/auth/me` returns an authenticated user, the application stores the user in React state and can switch to the dashboard view.

`src/pages/Dashboard.jsx` is the dashboard entrypoint and delegates based on the user role to admin/client dashboard layouts and modules.

Admin-oriented modules include:

- `AdminLayout`
- `AdminDashboard`
- `AdminClients`
- `AdminProjects`
- `AdminBilling`
- `AdminSubscriptions`
- `AdminMessages`
- `AdminNotifications`
- `AdminProfile`
- `AdminSettings`
- `AdminSupport`
- `ClientSelectionModal`

Client-oriented modules include:

- `ClientLayout`
- `ClientDashboard`
- `ClientProjects`
- `ClientBilling`
- `ClientProfile`
- `ClientSupport`
- `SignupWizard`
- `ProjectEmptyState`

### 4.4 Frontend state model

The current frontend uses local React state and context providers rather than a centralized Redux-style store.

Primary state owners:

- `App.jsx`: current view, authenticated user, auth modal, reset token, selected plan, Google auth availability
- `ToastProvider`: application notifications
- `SyncStatusProvider`: synchronization/connection status
- `useTheme`: theme mode and theme cycling
- `useOnlineStatus`: browser online/offline state
- `useSyncStatus`: backend synchronization state
- Component-local state: forms, tabs, loading states, filters, modal visibility

The browser communicates with the backend using `fetch`, generally with `credentials: "include"` so HTTP-only session cookies can be sent.

### 4.5 Frontend data sources

Frontend data access is distributed across:

- `src/lib/Actions.ts`: typed/centralized action helpers
- `src/lib/data.jsx`: application data helpers
- `src/lib/localData.js`: local fallback/demo data behavior
- `src/lib/mockData.js`: static test/demo data
- Direct `fetch` calls in app and dashboard components

The production source of truth should be the Express API and Neon database. Local/mock data is primarily used for fallback, development, or offline UI behavior.

## 5. Backend Architecture

### 5.1 Express application

`server/server.cjs` creates the Express application and HTTP server. It is responsible for:

- Middleware setup
- API route registration
- Authentication
- Authorization checks
- Project, invoice, subscription, ticket, notification, and message operations
- OAuth callback handling
- Password reset flows
- Health endpoints
- Payment webhook handling
- Email triggers
- Socket.IO setup
- Process-level error handling

The server uses CommonJS modules, while the frontend uses ES modules.

### 5.2 Middleware stack

The backend currently includes:

1. Helmet security headers
2. CORS allowlist validation
3. JSON body parsing with raw-body capture for webhook verification
4. Cookie parsing
5. Structured HTTP request logging
6. API rate limiting
7. Route handlers
8. Central error handling

Important environment configuration includes:

- `DATABASE_URL`
- `JWT_SECRET`
- `AUTH_SECRET`
- `SESSION_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `CLIENT_URL`
- `ADMIN_EMAIL`
- Email provider variables
- Payment provider variables

### 5.3 API deployment entrypoint

`api/index.js` is the hosting-facing API entrypoint. `vercel.json` rewrites all `/api/*` traffic to this entrypoint and rewrites all other traffic to `index.html` for SPA fallback.

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index.js" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 5.4 API categories

The current backend includes endpoints in these categories:

#### Health and diagnostics

- `GET /api/health`
- `HEAD /api/health`
- Database status and health information

#### Authentication

- `GET /api/auth/config`
- `GET /api/auth/me`
- `POST /api/auth/register`
- `POST /api/login`
- `POST /api/logout`
- `GET /api/auth/google/start`
- Google OAuth callback
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

#### Users and profiles

- Profile retrieval and updates
- Avatar/profile image operations
- Admin user management

#### Projects

- Create, read, update, delete projects
- Client-scoped project views
- Admin project management

#### Billing and invoices

- Invoice creation and retrieval
- Invoice status changes
- Payment/webhook processing
- Invoice email notifications

#### Subscriptions

- Subscription creation
- Subscription status management
- Plan selection and completion flow

#### Support and messaging

- Contact messages
- Support tickets
- Ticket responses
- Admin message handling

#### Notifications

- User notifications
- System-wide notifications
- Read/unread state updates

#### Operations and administration

- Audit logging
- System settings
- Database checks
- Operational/debug scripts

API versioning should be applied to future breaking changes. Existing consumers should remain compatible while new versioned endpoints are introduced.

## 6. Authentication and Authorization

### 6.1 Authentication methods

The current implementation supports:

- Email/password authentication
- Google OAuth authentication
- Password reset tokens
- Cookie-based authenticated sessions backed by signed tokens

Passwords are hashed with `bcryptjs`. Google authentication uses `google-auth-library`.

### 6.2 Session lifecycle

1. Browser submits credentials to the API.
2. Server validates the input and credentials.
3. Server creates a signed session/JWT cookie.
4. Browser sends the cookie with future requests.
5. `GET /api/auth/me` restores the authenticated user on app load.
6. Logout clears the session and resets frontend user state.

### 6.3 Roles

The current role model includes:

- `admin`
- `client`

The broader approved architecture also identifies future/expected operational roles:

- Admin
- Pharmacist
- Cashier
- Stock Manager

The current AkaTech implementation primarily uses admin/client role routing. Any expansion to the additional roles should add explicit authorization checks and database-backed permissions rather than relying only on frontend visibility.

### 6.4 Authorization boundaries

Authorization must be enforced on the server. Frontend role-based rendering is a presentation optimization and must not be treated as a security boundary.

User-owned records should be scoped by the authenticated user ID. Admin operations should require an explicit admin authorization check.

## 7. Database Architecture

### 7.1 Database provider

The application uses Neon Serverless PostgreSQL through `DATABASE_URL`. The database client is provided by `@neondatabase/serverless` and uses SSL.

The main connection configuration includes:

- Maximum pool size: 20 in the current connection manager
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds
- SSL enabled for Neon

### 7.2 ORM and migrations

Drizzle ORM and Drizzle Kit are used for schema definition and migration management.

Relevant commands:

```bash
npm run db:generate
npm run db:migrate
npm run db:push
npm run db:studio
```

Migration files are stored in `drizzle/` and generated metadata is stored in `drizzle/meta/`.

### 7.3 Current database tables

#### `users`

Stores user identity and application account data.

Important fields:

- `id`
- `email`
- `password_hash`
- `name`
- `role`
- `avatar_url`
- `google_id`
- `account_type`
- `created_at`
- `updated_at`

Indexes include email and role.

#### `projects`

Stores client projects and plan information.

Important fields:

- `id`
- `user_id`
- `name`
- `email`
- `company`
- `plan`
- `notes`
- `status`
- timestamps

Indexes include user ID and status.

#### `messages`

Stores public contact messages and administrative message state.

Important fields:

- `name`
- `email`
- `subject`
- `content`
- `status`
- `ip`
- `user_agent`
- `created_at`

#### `notifications`

Stores user-specific or system-wide notifications.

Important fields:

- `user_id`
- `title`
- `message`
- `read`
- `read_by`
- `target`
- `created_at`

#### `audit_logs`

Stores security and activity events.

Important fields:

- `action`
- `performed_by`
- `details`
- `created_at`

#### `signup_progress`

Stores resumable onboarding/signup data.

Important fields:

- `email`
- `data`
- `step`
- timestamps

#### `tickets`

Stores support tickets and response history.

Important fields:

- `user_id`
- `user_email`
- `user_name`
- `subject`
- `message`
- `responses`
- `status`
- `priority`
- timestamps

#### `subscriptions`

Stores user subscription and plan state.

Important fields:

- `user_id`
- `user_name`
- `user_email`
- `plan`
- `status`
- `start_date`
- `end_date`
- `amount`
- `details`
- timestamps

#### `invoices`

Stores invoice and payment records.

Important fields:

- `reference_number`
- `user_id`
- `project_id`
- `amount`
- `status`
- `due_date`
- `description`
- `items`
- timestamps

#### `system_settings`

Stores key/value configuration records using JSONB values.

#### `password_reset_tokens`

Stores hashed, expiring, one-time password reset tokens.

Important fields:

- `user_id`
- `token_hash`
- `expires_at`
- `used_at`
- `created_at`

## 8. Data Access Layer

### 8.1 `server/dal.cjs`

The data access layer encapsulates database operations used by API handlers. It contains domain-specific functions for users, projects, invoices, tickets, notifications, subscriptions, messages, and settings.

### 8.2 `server/db/connectionManager.cjs`

The connection manager creates and exports the Neon PostgreSQL pool. It also provides:

- Query execution helpers
- Parameterized SQL support
- Transaction helpers
- Pool lifecycle handling
- Connection release in `finally` blocks

### 8.3 `server/db/healthCheck.cjs`

The health checker evaluates database reachability and connection/pool metrics. The API returns HTTP 200 for healthy status and HTTP 503 when the database is unavailable or degraded.

The main dashboard database indicator should consume this live health endpoint, not infer database availability solely from browser online status.

### 8.4 Safety requirements

- Use parameterized queries for values.
- Never interpolate untrusted values into table or column identifiers without an allowlist.
- Scope user data by authenticated user ID.
- Do not expose raw database errors to clients.
- Do not log passwords, tokens, payment payloads, webhook bodies, or unnecessary PII.
- Preserve the canonical Main Dashboard live clock as the timestamp source for transaction operations where that business rule applies.

## 9. Real-Time and Synchronization

The backend creates a Socket.IO server and emits a heartbeat every five seconds. The frontend includes synchronization utilities:

- `SyncStatusProvider`
- `useSyncStatus`
- `useOnlineStatus`
- `ConnectionStatus`

These should be treated as separate signals:

- Browser online status: network connectivity from the browser perspective
- Socket heartbeat: real-time server connection
- API health: backend availability
- Database health: live Neon/database query and pool status

A green browser/network indicator does not prove that Neon is healthy. Conversely, a temporary API or health-check failure should not be permanently cached as “offline.”

## 10. External Integrations

### Google OAuth

Used for Google sign-in through `google-auth-library` and configured with Google client credentials.

### Email

`server/emailService.cjs` uses Nodemailer and environment-provided credentials. It supports login notifications, password reset messages, and invoice messages.

### Payments

The server contains payment-related flows and webhook handling for configured payment providers. Webhooks should validate signatures using raw request bodies and log only safe identifiers.

### GitHub

`server/services/githubManager.js` uses Octokit for GitHub-related operations. It should be treated as an optional integration and kept behind explicit credentials and error handling.

### Vercel Analytics

The React application renders the Vercel Analytics component from `@vercel/analytics/react`.

## 11. Security Architecture

Current security controls include:

- Helmet security middleware
- CORS origin allowlist
- HTTP-only credential/cookie flow
- Rate limiting under `/api/`
- Bcrypt password hashing
- Parameterized database values
- Password reset token hashing and expiration
- Structured logging
- Reduced sensitive-data logging
- Centralized error handling
- Webhook raw-body capture for signature validation

Areas requiring continued attention:

- Use a dedicated strong `JWT_SECRET` in every deployment.
- Avoid using fallback secrets such as OAuth client secrets for session signing.
- Replace demo/base64 “encryption” with authenticated encryption for sensitive fields.
- Validate and allowlist dynamic table/column identifiers in generic CRUD helpers.
- Enforce authorization in every user-owned query.
- Add production security headers at the hosting layer where appropriate.
- Keep secrets only in environment configuration, never in source control.

## 12. Error Handling and Observability

### Error handling

- `server/errors/AppError.cjs` defines application error types.
- `server/errors/errorHandler.cjs` centralizes API error responses.
- Server routes log structured context and return safe client-facing messages.
- Process-level handlers protect against unhandled rejections and uncaught exceptions.

### Logging

`server/logging/logger.cjs` provides structured logging levels:

- `debug`
- `info`
- `warn`
- `error`

Production logs should contain operational context without secrets or raw request bodies.

### Health monitoring

The primary operational endpoint is:

```text
GET /api/health
```

It should be monitored externally and used by the dashboard status indicator as the source of truth for database availability.

## 13. Build and Deployment Architecture

### Development

```bash
npm run dev          # Vite frontend
npm run start:server # Express backend
```

The frontend normally runs on port 5173 and the backend defaults to port 3001.

### Production build

```bash
npm run build
npm run preview
```

The Vite build produces the static frontend output. The API is deployed through the hosting platform's `/api/index.js` entrypoint and rewrite configuration.

### Environment configuration

The application depends on environment variables for:

- Neon database connection
- Session signing
- Google OAuth
- Admin account configuration
- Email delivery
- Optional payment integrations
- Optional GitHub integration

`.env.example` and `.env.production.example` document expected configuration names. Production values must be configured in the deployment environment rather than committed.

## 14. Testing Architecture

Testing uses Vitest with Testing Library and browser-like environments.

Test areas currently include:

- Authentication modal
- Admin billing
- Admin clients
- Admin messages
- Admin projects
- Client billing
- Connection status
- Dashboard
- Offline assistant behavior
- Signup wizard offline behavior

Typical command:

```bash
npm test
```

The architecture supports adding:

- API route tests
- Database integration tests against a dedicated Neon branch/database
- Authorization tests for every role
- Health endpoint tests
- Payment webhook signature tests
- End-to-end browser tests for authentication and dashboard flows

## 15. Data and Request Flow Examples

### Login flow

```text
AuthModal
  -> POST /api/login
  -> Express validation
  -> DAL user lookup
  -> bcrypt password verification
  -> signed session cookie
  -> App.jsx calls /api/auth/me
  -> user role selects dashboard experience
```

### Project creation flow

```text
Client/Admin project form
  -> API request with credentials
  -> authenticated user/admin authorization
  -> validated project payload
  -> DAL transaction/query
  -> projects table in Neon
  -> safe response returned to dashboard
```

### Database status flow

```text
Dashboard connection/status component
  -> GET /api/health
  -> checkDatabaseHealth()
  -> Neon pooled connection/query
  -> health response with healthy/status/timestamp
  -> UI maps response to online/degraded/offline state
```

### Password reset flow

```text
User submits email
  -> POST /api/auth/forgot-password
  -> create random token
  -> store token hash and expiry
  -> send reset email
  -> user submits token and new password
  -> POST /api/auth/reset-password
  -> validate unused/unexpired hash
  -> bcrypt new password
  -> mark token used
```

## 16. Current Architectural Strengths

- Clear separation between frontend components and backend APIs.
- Neon/PostgreSQL persistence with migration history.
- Reusable dashboard component structure for admin and clients.
- Server-side authentication and password hashing.
- Centralized logging and error handling.
- Health checks and retry/connection management utilities.
- Vercel-compatible SPA and API deployment model.
- Automated tests for important UI flows.

## 17. Current Architectural Risks and Technical Debt

1. **SPA view state instead of URL routing**: browser refresh/deep-link behavior is less explicit than a router-based architecture.
2. **Mixed module systems**: frontend ES modules, backend CommonJS, and TypeScript database helpers increase tooling complexity.
3. **Generic dynamic CRUD helpers**: table names and column names require strict allowlisting.
4. **Potential duplicate data access patterns**: direct fetches, Actions, local data, and mock data can make source-of-truth behavior unclear.
5. **Demo encryption helper**: base64 encoding is not encryption and must not protect sensitive production data.
6. **Role model gap**: current implementation is primarily admin/client while the approved broader model includes additional operational roles.
7. **Timestamp contract**: transaction timestamps need consistent enforcement from the canonical Main Dashboard live clock.
8. **Serverless Socket.IO constraints**: persistent Socket.IO behavior may require a long-lived server or managed realtime service in production.
9. **Health indicator semantics**: UI must distinguish browser connectivity, API availability, socket status, and database status.
10. **API versioning**: future breaking API changes must be introduced as new versioned endpoints and old versions explicitly deprecated.

## 18. Recommended Evolution Path

### Near term

- Make `/api/health` the definitive source for the main dashboard database indicator.
- Add automated tests for health states: healthy, degraded, timeout, and missing configuration.
- Add explicit API route documentation and version labels.
- Audit every user-owned query for user ID scoping.
- Remove or isolate demo/local fallback behavior in production builds.

### Medium term

- Introduce a dedicated client-side router for URL-addressable dashboard views.
- Consolidate API calls behind a typed API client.
- Convert backend modules to a consistent TypeScript strategy or clearly document the CommonJS boundary.
- Add role/permission tables and server-enforced RBAC for Admin, Pharmacist, Cashier, and Stock Manager.
- Add integration and end-to-end tests against a disposable Neon database branch.

### Long term

- Separate the public marketing surface from the authenticated application shell.
- Move long-lived realtime features to a production-supported realtime architecture.
- Add observability dashboards, alert thresholds, and deployment health gates.
- Introduce API versioning with migration and sunset documentation.
- Formalize audit event retention and data privacy policies.

## 19. Source-of-Truth Files

The most important implementation files for understanding the current architecture are:

- `package.json`
- `src/main.jsx`
- `src/App.jsx`
- `src/pages/Dashboard.jsx`
- `src/components/admin/`
- `src/components/client/`
- `src/lib/Actions.ts`
- `server/server.cjs`
- `server/dal.cjs`
- `server/db/schema.cjs`
- `server/db/connectionManager.cjs`
- `server/db/healthCheck.cjs`
- `server/errors/`
- `server/logging/logger.cjs`
- `drizzle/`
- `api/index.js`
- `vercel.json`
- `docs/DATABASE.md`

## 20. Final Architecture Statement

The current AkaTech architecture is a Vite/React SPA with lazy-loaded public, admin, and client interfaces; an Express API backend with cookie-based authentication, REST-style domain endpoints, optional Socket.IO heartbeats, structured error/logging infrastructure; and Neon Serverless PostgreSQL accessed through a Drizzle-managed schema and migrations. Vercel rewrite rules connect the browser-facing SPA and API entrypoint. The main architectural priorities for continued development are reliable live database health reporting, strict server-side authorization, safe data access, API version compatibility, canonical transaction timestamps, and gradual separation of demo/offline fallbacks from production data paths.
