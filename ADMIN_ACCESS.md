# Administrative Access & Security Policy

## Primary Administrator
The system is configured with a primary administrative account linked to the following Google Workspace identity:
- **Email:** `felixakabati007@gmail.com`
- **Role:** Super Admin
- **Authentication:** Google OAuth 2.0 (Passwordless)

### Privileges
This account automatically receives full system privileges upon sign-in, including:
- User Management (Create/Edit/Delete)
- Project & Phase Management
- Billing & Invoice Administration
- System Settings & Audit Logs
- Support Ticket Resolution

## Security Measures

### 1. Authentication
- **Google OAuth 2.0:** All access is mediated through Google's secure identity provider.
- **2FA:** Two-factor authentication is enforced via the underlying Google Account settings.
- **Session:** Admin sessions are valid for 24 hours before requiring re-authentication.

### 2. Monitoring
- **Login Notifications:** An email alert is sent to the admin email address immediately upon any successful login, containing the IP address and device information.
- **Audit Logging:** All critical actions (logins, data modification, settings changes) are recorded in the system audit log (`server/db/audit_logs`).

## Backup Access Procedure
In the event that the primary Google account is unavailable, access recovery must be performed through database intervention. The legacy local admin fallback has been removed for security reasons.

## Configuration
To update email notification settings, configure the following environment variables in `.env`:
```env
EMAIL_USER=notifications@akatech.com
EMAIL_PASS=your-app-specific-password
```
If these are not set, email notifications will be logged to the server console for debugging.
