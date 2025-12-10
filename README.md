**Healthy-Smiles**

This repository contains the Healthy-Smiles project: a backend API server and two front-end apps — a mobile app (patient-facing, Expo) and a web admin/doctor panel (Vite). This README summarises the repository structure, development setup, and available APIs.

**Quick Links**
- **Backend:** `Backend/`
- **Mobile app (Patient):** `Medics/` (Expo / React Native)
- **Doctor/Admin web app:** `Medics-Doctor/` (Vite + React + TypeScript)

**Contents**
- **Project overview:** The Backend serves REST APIs consumed by the mobile app and doctor panel. The mobile app is an Expo project; the doctor app is a Vite-based web admin.

**Repository Structure (top-level)**
- `Backend/` — Node.js backend (API server)
  - `.env`, `.env.example` — environment templates
  - `package.json` — backend dependencies & scripts
  - `src/` — server source code
    - `index.js` — server entry point (starts API + sockets)
    - `db.js` — DB connection helpers
    - `chatSocket.js` — websocket/socket handlers
    - `controllers/` — request handlers for each domain (appointments, auth, prescriptions, etc.)
    - `middleware/` — middleware such as `auth.js` and `requestLogger.js`
    - `routes/` — route definitions (see APIs section below)
  - `db/` — SQL scripts and CSVs (`schema.sql`, `medicines.csv`, migration SQL files)
  - `public/` — static pages (e.g., `logs.html`)
  - utility & scripts: `runMigration.js`, `loadSampleData.js`, `loadMedicinesOnly.js`

- `Medics/` — Mobile application (Expo)
  - `app/` — app source (screens, components, navigation)
  - `assets/`, `components/`, `contexts/` — UI and app state
  - `android/` — Android native/project files (when building locally)
  - `package.json`, `app.json`, `app.config.js` — project config & scripts
  - Notes: this is an Expo-managed workflow; device testing typically uses `expo start` or `npm start`.

- `Medics-Doctor/` — Doctor/admin web interface (Vite + React + TypeScript)
  - `src/` — app code (pages, components, services)
  - `config/` — API client config (e.g., `api.ts`)
  - `package.json`, `vite.config.ts`, `tsconfig.json`
  - Notes: typical dev command is `npm run dev` (check `package.json` for exact scripts).

**Backend: Development & Run (recommended)**
- Prerequisites: Node.js (LTS), npm or yarn, a PostgreSQL/MySQL/SQLite DB depending on your environment, and any external services (Firebase, push services) configured in `.env`.
- Basic steps (generic — check `Backend/package.json` for exact scripts):
  - Install: `cd Backend; npm install`
  - Copy env: `cp .env.example .env` (or on Windows PowerShell: `Copy-Item .env.example .env`), then edit `.env` with DB and credentials.
  - Run DB migrations or load schema: see `Backend/db/schema.sql`; helper scripts such as `runMigration.js` and `loadSampleData.js` are provided.
  - Start server (development): `npm run dev` or `node src/index.js` (refer to `Backend/package.json` for exact script names).

**Mobile app (`Medics/`): Development & Run**
- Prerequisites: Node.js, `npm` or `yarn`, `expo-cli` (optional but helpful), Android Studio/Xcode if testing on simulators.
- Typical steps:
  - `cd Medics; npm install`
  - Review `.env` or app config files and set API base URL to your running Backend.
  - Start dev server: `npx expo start` or `npm start`.
  - Run on device/emulator with the Expo client.

**Doctor/Admin web app (`Medics-Doctor/`): Development & Run**
- Prerequisites: Node.js, npm/yarn
- Typical steps:
  - `cd Medics-Doctor; npm install`
  - `npm run dev` (or `npm start`) to start Vite dev server. Check `package.json` for exact scripts.
  - Configure API base URL in `src/config/api.ts` or environment.

**Database**
- Schema and example data are in `Backend/db/`:
  - `schema.sql` — create tables and base schema
  - `medicines.csv` — sample medicines data for import
  - `add_push_token_migration.sql` — sample migration SQL
- Scripts such as `loadSampleData.js` and `loadMedicinesOnly.js` help import CSVs into the DB.

**Backend APIs (overview)**
The backend organizes routes under `Backend/src/routes/`. Each route file maps to a domain and is handled by a controller in `Backend/src/controllers/`.

**Authentication & Authorization**
- Authentication uses JWT tokens (bearer tokens in `Authorization` header)
- Middleware: `authenticateToken` (patient/doctor), `auth(true)` (doctor-only), `requireAdmin` (admin-only)
- Data encryption: AES-256-GCM for sensitive fields, El Gamal for medical files
- HMAC-based deterministic email lookup for encrypted emails

---

## API Endpoint Reference

### 🔐 Authentication (`/api/auth`)

#### `POST /api/auth/register`
Register a new patient account.
- **Auth:** None (public)
- **Request body:**
  ```json
  {
    "email": "string (required)",
    "password": "string (required)",
    "name": "string (required)"
  }
  ```
- **Response:**
  ```json
  {
    "token": "JWT token",
    "id": "user ID",
    "user": {
      "id": "number",
      "name": "string",
      "email": "string",
      "role": "patient",
      "avatar": "string|null",
      "phone": "string|null",
      "dob": "string|null",
      "height": "string|null",
      "weight": "string|null",
      "createdAt": "ISO date"
    }
  }
  ```
- **Notes:** Patient-only registration. Generates El Gamal keypair for medical file encryption. Email/name stored encrypted.

#### `POST /api/auth/login`
Login for patients.
- **Auth:** None (public)
- **Request body:**
  ```json
  {
    "email": "string (required)",
    "password": "string (required)"
  }
  ```
- **Response:** Same as register, includes `stats` object with appointments/files count.

#### `POST /api/auth/doctor/login`
Login for doctors.
- **Auth:** None (public)
- **Request body:**
  ```json
  {
    "email": "string (required)",
    "password": "string (required)"
  }
  ```
- **Response:** JWT token + doctor profile data.

#### `POST /api/auth/forgot-password`
Initiate password reset flow.
- **Auth:** None
- **Request body:** `{ "email": "string" }`
- **Response:** Success message (verification code sent).

#### `POST /api/auth/verify-code`
Verify reset code.
- **Auth:** None
- **Request body:** `{ "email": "string", "code": "string" }`
- **Response:** Success confirmation.

#### `POST /api/auth/reset-password`
Complete password reset.
- **Auth:** None
- **Request body:** `{ "email": "string", "code": "string", "newPassword": "string" }`
- **Response:** Success message.

#### `POST /api/auth/push-token`
Save push notification token.
- **Auth:** Required (patient/doctor)
- **Request body:** `{ "token": "string" }`
- **Response:** Success confirmation.

---

### 📅 Appointments (`/api/appointments`)

#### `GET /api/appointments`
Get user's appointments (patient view).
- **Auth:** Required (patient)
- **Query params:** `status` (optional: `upcoming`, `completed`, `canceled`, `all`)
- **Response:**
  ```json
  {
    "appointments": [
      {
        "id": "string",
        "doctorId": "number",
        "doctorName": "string",
        "doctorImage": "string",
        "specialty": "string",
        "date": "YYYY-MM-DD",
        "time": "HH:MM",
        "reason": "string (decrypted)",
        "status": "string",
        "hospitalName": "string",
        "hospitalAddress": "string",
        "payment": "number",
        "createdAt": "ISO date"
      }
    ]
  }
  ```

#### `POST /api/appointments`
Create a new appointment.
- **Auth:** Required (patient)
- **Request body:**
  ```json
  {
    "doctorId": "number (required)",
    "date": "YYYY-MM-DD (required)",
    "time": "HH:MM (required)",
    "reason": "string (optional)",
    "payment": "number (required)"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "appointmentId": "string",
    "appointment": { /* appointment object */ }
  }
  ```
- **Notes:** Validates doctor exists, creates notification for doctor.

#### `PATCH /api/appointments/:appointmentId`
Update appointment status (patient cancellation).
- **Auth:** Required (patient)
- **Request body:** `{ "status": "Canceled" }`
- **Response:** Success confirmation.

---

### 👨‍⚕️ Doctor Endpoints (`/api/doctor`)

#### `GET /api/doctor/stats`
Get doctor dashboard statistics.
- **Auth:** Required (doctor only)
- **Response:**
  ```json
  {
    "todayAppointments": "number",
    "totalPatients": "number",
    "totalPrescriptions": "number",
    "pendingAppointments": "number"
  }
  ```

#### `GET /api/doctor/profile`
Get doctor's profile.
- **Auth:** Required (doctor)
- **Response:** Doctor profile object (decrypted fields).

#### `PUT /api/doctor/profile`
Update doctor's profile.
- **Auth:** Required (doctor)
- **Request body:** Profile fields to update (name, specialty, bio, etc.)
- **Response:** Updated profile.

#### `GET /api/doctor/appointments/today`
Get today's appointments for doctor.
- **Auth:** Required (doctor)
- **Response:** Array of appointments with patient details.

#### `GET /api/doctor/appointments`
Get all appointments for doctor.
- **Auth:** Required (doctor)
- **Query params:** `status` (optional)
- **Response:** Array of appointments.

#### `PATCH /api/doctor/appointments/:appointmentId`
Update appointment status (doctor actions: confirm/complete/cancel).
- **Auth:** Required (doctor)
- **Request body:** `{ "status": "Confirmed|Completed|Canceled" }`
- **Response:** Success confirmation.

#### `GET /api/doctor/patients`
Get doctor's patient list.
- **Auth:** Required (doctor)
- **Response:** Array of patients with basic info.

#### `GET /api/doctor/patients/:patientId/profile`
Get detailed patient profile (with authorization check).
- **Auth:** Required (doctor)
- **Response:** Patient profile including medical history, files, prescriptions.

#### `GET /api/doctor/medicines`
Search medicines database.
- **Auth:** Required (doctor)
- **Query params:** `q` (search query, optional)
- **Response:** Array of medicines.

#### `GET /api/doctor`
Get all doctors (for authorization/selection).
- **Auth:** Required
- **Response:** Array of doctors with basic info.

---

### 💊 Prescriptions (`/api/*`)

#### `POST /api/prescriptions`
Create a new prescription.
- **Auth:** Required (doctor only)
- **Request body:**
  ```json
  {
    "patientId": "number (required)",
    "items": [
      {
        "medicineId": "number",
        "dosage": "string",
        "frequency": "string",
        "duration": "string",
        "instructions": "string (optional)"
      }
    ],
    "diagnosis": "string (optional)",
    "notes": "string (optional)"
  }
  ```
- **Response:**
  ```json
  {
    "message": "Prescription created successfully",
    "prescriptionId": "number",
    "createdAt": "ISO date"
  }
  ```
- **Notes:** Creates notification for patient, encrypts sensitive fields.

#### `GET /api/doctor/prescriptions`
Get prescriptions created by doctor.
- **Auth:** Required (doctor)
- **Response:** Array of prescriptions with patient info.

#### `GET /api/patient/prescriptions`
Get prescriptions for patient.
- **Auth:** Required (patient)
- **Response:** Array of prescriptions with doctor info and items.

---

### 🛒 Orders (`/api/orders`)

#### `GET /api/orders`
Get user's pharmacy orders.
- **Auth:** Required (patient)
- **Query params:** `status` (optional)
- **Response:**
  ```json
  {
    "orders": [
      {
        "id": "string",
        "orderNumber": "string",
        "items": "array",
        "total": "number",
        "currency": "string",
        "status": "string",
        "deliveredAt": "ISO date|null",
        "createdAt": "ISO date"
      }
    ]
  }
  ```

#### `POST /api/orders`
Create a new order.
- **Auth:** Required (patient)
- **Request body:**
  ```json
  {
    "items": [
      {
        "medicineId": "number",
        "quantity": "number",
        "price": "number"
      }
    ],
    "subtotal": "number (required)",
    "tax": "number",
    "deliveryFee": "number",
    "total": "number (required)",
    "currency": "string (default: USD)",
    "deliveryAddress": "object (required)",
    "paymentMethod": "string (required)"
  }
  ```
- **Response:** Order object with tracking number, estimated delivery.
- **Notes:** Generates order number and tracking number, creates notification.

---

### 💬 Chat (`/api/chats`)

#### `GET /api/chats`
Get user's chat conversations.
- **Auth:** Required (patient)
- **Response:** Array of chats with last message preview.

#### `POST /api/chats/initiate`
Start a new chat with a doctor.
- **Auth:** Required (patient)
- **Request body:** `{ "doctorId": "number" }`
- **Response:** Chat object with ID.

#### `GET /api/chats/:chatId/messages`
Get messages for a specific chat.
- **Auth:** Required
- **Response:** Array of messages (decrypted).

#### `POST /api/chats/:chatId/messages`
Send a message in chat.
- **Auth:** Required
- **Request body:** `{ "message": "string" }`
- **Response:** Created message object.
- **Notes:** Encrypted in storage, emits WebSocket event.

#### `POST /api/chats/:chatId/upload`
Upload file to chat (max 10MB).
- **Auth:** Required
- **Request body:** `multipart/form-data` with `file` field
- **Response:** File URL and message object.

---

### 💬 Doctor Chat (`/api/doctor/chats`)

#### `GET /api/doctor/chats`
Get doctor's chat contacts.
- **Auth:** Required (doctor)
- **Response:** Array of chats with patient info.

#### `GET /api/doctor/chats/:chatId/messages`
Get messages for doctor's chat.
- **Auth:** Required (doctor)
- **Response:** Array of messages.

#### `POST /api/doctor/chats/:chatId/messages`
Send message as doctor.
- **Auth:** Required (doctor)
- **Request body:** `{ "message": "string" }`
- **Response:** Created message.

#### `POST /api/doctor/chats/initiate`
Doctor initiates chat with patient.
- **Auth:** Required (doctor)
- **Request body:** `{ "patientId": "number" }`
- **Response:** Chat object.

---

### 📄 Medical Files (`/api/files/medical`)

#### `GET /api/files/medical`
Get user's medical files.
- **Auth:** Required (patient)
- **Response:** Array of medical files (metadata + download URLs).

#### `POST /api/files/medical/upload`
Upload medical file (max 50MB).
- **Auth:** Required (patient)
- **Request body:** `multipart/form-data` with `file` field and optional `description`
- **Response:** File object with ID.
- **Notes:** Encrypted with El Gamal public key.

#### `GET /api/files/medical/:fileId/download`
Download medical file.
- **Auth:** Required
- **Response:** File stream (decrypted).

#### `DELETE /api/files/medical/:fileId`
Delete medical file.
- **Auth:** Required (patient)
- **Response:** Success confirmation.

#### `GET /api/files/medical/patient/:patientId`
Get patient's files (doctor view with authorization).
- **Auth:** Required (doctor)
- **Response:** Array of patient's medical files.

---

### 🔓 Authorization & Access (`/api/authorizations`, `/api/access`)

#### `POST /api/authorizations/grant`
Patient grants doctor access to medical records.
- **Auth:** Required (patient)
- **Request body:** `{ "doctorId": "number" }`
- **Response:** Authorization object.

#### `DELETE /api/authorizations/revoke/:doctorId`
Patient revokes doctor's access.
- **Auth:** Required (patient)
- **Response:** Success confirmation.

#### `GET /api/authorizations`
Get list of authorizations.
- **Auth:** Required
- **Response:** Array of authorized doctors (for patient) or patients (for doctor).

#### `POST /api/access/request`
Doctor requests access to patient records.
- **Auth:** Required (doctor)
- **Request body:** `{ "patientId": "number", "reason": "string" }`
- **Response:** Access request object.

#### `GET /api/access/requests`
Get access requests (pending/history).
- **Auth:** Required
- **Response:** Array of access requests.

#### `POST /api/access/requests/:requestId/respond`
Patient responds to access request.
- **Auth:** Required (patient)
- **Request body:** `{ "action": "approve|deny" }`
- **Response:** Success confirmation.

#### `GET /api/access/audit-log`
Get audit log of access events.
- **Auth:** Required
- **Response:** Array of audit log entries.

---

### 🔔 Notifications (`/api/notifications`)

#### `GET /api/notifications`
Get user's notifications.
- **Auth:** Required
- **Response:** Array of notifications (sorted by date).

#### `PATCH /api/notifications/:notificationId`
Mark notification as read.
- **Auth:** Required
- **Request body:** `{ "read": true }`
- **Response:** Success confirmation.

#### `POST /api/notifications/test`
Send test notification (development).
- **Auth:** Required
- **Request body:** `{ "title": "string", "body": "string" }`
- **Response:** Success confirmation.

---

### 👤 Profile (`/api/user`)

#### `GET /api/user/profile`
Get user profile.
- **Auth:** Required (patient)
- **Response:** User profile object (decrypted).

#### `PUT /api/user/profile`
Update user profile.
- **Auth:** Required (patient)
- **Request body:** Profile fields (name, phone, dob, height, weight, avatar)
- **Response:** Updated profile.
- **Notes:** Sensitive fields encrypted before storage.

#### `POST /api/user/push-token`
Register push notification token.
- **Auth:** Required
- **Request body:** `{ "token": "string", "platform": "ios|android" }`
- **Response:** Success confirmation.

---

### 💳 Payments (`/api/payments`)

#### `GET /api/payments`
Get payment history.
- **Auth:** Required (patient)
- **Response:** Array of payment transactions.

---

### ❓ FAQs (`/api/faqs`)

#### `GET /api/faqs`
Get frequently asked questions.
- **Auth:** None (public)
- **Response:** Array of FAQ items.

---

### 📊 App Data (`/api/*`)

#### `GET /api/app-data`
Get initial app data (doctors, hospitals, specialties, etc.).
- **Auth:** Required
- **Response:**
  ```json
  {
    "doctors": "array",
    "hospitals": "array",
    "specialties": "array",
    "medicines": "array (sample)"
  }
  ```

#### `GET /api/hospitals/:hospitalId/doctors`
Get doctors for a specific hospital.
- **Auth:** Required
- **Response:** Array of doctors.

---

### 🔧 Admin (`/api/admin`)

#### `POST /api/admin/login`
Admin login.
- **Auth:** None (public)
- **Request body:** `{ "email": "string", "password": "string" }`
- **Response:** JWT token + admin profile.

#### `GET /api/admin/dashboard/stats`
Get admin dashboard statistics.
- **Auth:** Required (admin)
- **Response:** Overall system stats (users, appointments, revenue, etc.).

#### `GET /api/admin/doctors`
Get all doctors (admin view).
- **Auth:** Required (admin)
- **Response:** Array of doctors with full details.

#### `POST /api/admin/doctors`
Create new doctor account.
- **Auth:** Required (admin)
- **Request body:** Doctor profile + credentials
- **Response:** Created doctor object.

#### `PUT /api/admin/doctors/:doctorId/hospitals`
Update doctor's hospital assignments.
- **Auth:** Required (admin)
- **Request body:** `{ "hospitalIds": ["array of IDs"] }`
- **Response:** Success confirmation.

#### `DELETE /api/admin/doctors/:doctorId`
Delete doctor account.
- **Auth:** Required (admin)
- **Response:** Success confirmation.

#### `GET /api/admin/patients`
View all patients (read-only).
- **Auth:** Required (admin)
- **Response:** Array of patients (limited info).

#### `GET /api/admin/medicines`
View all medicines (read-only).
- **Auth:** Required (admin)
- **Response:** Array of medicines.

#### `GET /api/admin/hospitals`
Get all hospitals.
- **Auth:** Required (admin)
- **Response:** Array of hospitals.

---

### 🔄 Migration (`/api/admin`)

#### `POST /api/admin/migrate-push-token`
Run database migration for push tokens.
- **Auth:** Admin (or none if run manually)
- **Response:** Migration success status.
- **Notes:** Adds `push_token` column to `patients` table.

---

**WebSocket Events (via Socket.IO)**
- Connected at server startup on the same port as HTTP
- Events: `new_message`, `message_read`, `typing`, etc.
- Authenticated via JWT token in handshake

**Error Response Format**
```json
{
  "success": false,
  "error": "Error message string"
}
```

**Common HTTP Status Codes**
- `200` — Success
- `201` — Created
- `400` — Bad Request (validation error)
- `401` — Unauthorized (invalid/missing token)
- `403` — Forbidden (insufficient permissions)
- `404` — Not Found
- `409` — Conflict (e.g., duplicate email)
- `500` — Internal Server Error

**Push Notifications**
- See `Backend/PUSH_NOTIFICATIONS.md` for details on how push notifications are handled and configured.

**Logging & Admin**
- `Backend/public/logs.html` and `src/logDashboard.js` provide server-side logging and a minimal dashboard.

**Scripts & Utilities**
- `runMigration.js` — migration helper
- `loadSampleData.js` / `loadMedicinesOnly.js` — CSV import helpers

**Testing**
- There are no explicit test folders in the top-level attachments; if the project includes tests, run them from the package scripts (e.g., `npm test`).

**Development Notes & Tips**
- Always copy `.env.example` to `.env` and populate required keys before starting the server.
- Check `Backend/package.json`, `Medics/package.json`, and `Medics-Doctor/package.json` for exact scripts and start commands.
- When running the mobile app against a locally-running backend, ensure your device can reach your machine (use LAN IPs or tunneling — Expo offers options).
- For Android builds (in `Medics/android/`) use the included Gradle wrappers (`gradlew.bat`) when building native artifacts.

**Where to look next (important files)**
- Backend entry: `Backend/src/index.js`
- Route definitions: `Backend/src/routes/*.js`
- Controller implementations: `Backend/src/controllers/*.js`
- Middleware: `Backend/src/middleware/*.js`
- Database schema: `Backend/db/schema.sql`
- Mobile app main: `Medics/app/` and `Medics/app.json`
- Doctor app main: `Medics-Doctor/src/`

**Contributing & Next Steps**
