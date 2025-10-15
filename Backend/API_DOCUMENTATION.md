# Healthy Smiles - API Documentation

This document lists the backend HTTP APIs, required headers, request payloads, and example responses for the Healthy Smiles Express backend. It also contains notes about encryption, DB schema, and troubleshooting.

Base URL (local dev):
- http://localhost:4000

Authentication
- All protected endpoints require a JSON Web Token (JWT) sent in the `Authorization` header as `Authorization: Bearer <token>`.
- Tokens are issued by the `/register` and `/login` endpoints on success.

Encryption notes
- All sensitive text fields (email, name, description, etc.) are encrypted server-side with AES-256-GCM before being stored in the database.
- File contents are encrypted using AES-256-GCM before storage (server-side) and stored in Postgres as `bytea`.
- The server expects an environment variable named `ENCRYPTION_KEY` (base64 encoded 32 bytes) to perform encryption/decryption. For deterministic lookup of emails we also use an HMAC key (env `HMAC_KEY`) or `JWT_SECRET` as fallback. Ensure these are configured in `.env`.

HTTP status codes used
- 200 OK — success, with a JSON response (or a file stream for download if implemented)
- 201 Created — occasionally used for creation (not required)
- 400 Bad Request — missing/invalid client data
- 401 Unauthorized — missing/invalid token or not authenticated
- 403 Forbidden — authenticated but not allowed to perform action
- 404 Not Found — resource doesn't exist
- 500 Internal Server Error — unexpected server error

Endpoints
---------

1) POST /register
- Purpose: Register a new user (doctor or patient) and receive a JWT token.
- URL: POST http://localhost:4000/register
- Headers: Content-Type: application/json
- Body (JSON):
  - role: string — either "doctor" or "patient"
  - email: string
  - password: string
  - name: string

Example request body:
{
  "role": "patient",
  "email": "patient1@example.com",
  "password": "TestPass123!",
  "name": "Patient One"
}

- Success response (200):
  {
    "token": "<jwt-token>",
    "id": "<user-uuid>"
  }

- Typical errors:
  - 400: missing fields
  - 500: internal_error (check server logs for details; often ENCRYPTION_KEY missing or DB error)

How to handle response:
- On success, store the `token` securely in your mobile app and use it in `Authorization: Bearer <token>` for protected endpoints.

2) POST /login
- Purpose: Authenticate an existing user (doctor or patient) and receive a JWT token.
- URL: POST http://localhost:4000/login
- Headers: Content-Type: application/json
- Body (JSON):
  - role: string — "doctor" or "patient"
  - email: string
  - password: string

Example request body:
{
  "role": "patient",
  "email": "patient1@example.com",
  "password": "TestPass123!"
}

- Success response (200):
  {
    "token": "<jwt-token>",
    "id": "<user-uuid>"
  }

- Errors:
  - 400: missing fields
  - 401: invalid_credentials (wrong email/password)
  - 500: internal_error

How to handle response:
- On success, store the `token` and user `id`. Use the token in the `Authorization` header for future requests.

3) POST /api/files/medical/upload
- Purpose: Upload encrypted medical files for a patient. Files are encrypted server-side and stored in the DB.
- URL: POST http://localhost:4000/api/files/medical/upload
- Headers:
  - Authorization: Bearer <token> (required) — doctor or the patient themselves
  - Content-Type: multipart/form-data
- Form fields (multipart):
  - file: file binary (form field name `file`)
  - patientId: string (UUID of the patient the file belongs to)
  - description: string (optional)

Notes:
- If the requester is a `patient` role, the `patientId` must match the authenticated user's id.
- Doctors may upload files for any patient (in this scaffold); you may want to add ACLs for assigned relationships.

- Success response (200):
  {
    "fileId": "<file-uuid>"
  }

- Errors:
  - 400: missing file or patientId
  - 401: unauthenticated
  - 403: forbidden (patient uploading for another patient)
  - 500: internal_error

Example curl (Windows PowerShell using curl.exe):
curl.exe -v -X POST "http://localhost:4000/api/files/medical/upload" \
  -H "Authorization: Bearer $token" \
  -F "patientId=<patient-uuid>" \
  -F "description=Test X-ray" \
  -F "file=@C:\path\to\image.jpg"

How to handle response:
- On 200, capture `fileId`. The mobile app can request file lists for a patient and (if implemented) download the file using its id.

4) GET /api/files/medical/patient/:patientId
- Purpose: List uploaded medical files for a patient (doctor view).
- URL: GET http://localhost:4000/api/files/medical/patient/:patientId
- Headers:
  - Authorization: Bearer <doctor-token> (required)

- Success response (200):
  {
    "files": [
      {
        "id": "<file-uuid>",
        "filename": "original-filename.jpg", // decrypted server-side if possible
        "uploaded_at": "2025-10-15T...",
        "uploaded_by_role": "doctor"
      },
      ...
    ]
  }

- Errors:
  - 403: forbidden (only doctors allowed in this scaffold)
  - 404: not_found
  - 500: internal_error

How to handle response:
- Iterate the `files` array and present filename/upload date in the UI. Save `id` if you plan to request download (download endpoint can be implemented on request).

5) GET /api/doctor/patients/:patientId/profile
- Purpose: Doctor views a patient's profile (server decrypts sensitive fields before returning).
- URL: GET http://localhost:4000/api/doctor/patients/:patientId/profile
- Headers:
  - Authorization: Bearer <doctor-token>

- Success response (200):
  {
    "profile": {
      "id": "<patient-uuid>",
      "name": "Patient Name",
      "email": "patient@example.com",
      "dob": "YYYY-MM-DD" // if available
    }
  }

- Errors:
  - 403: forbidden (non-doctor trying to access)
  - 404: not_found
  - 500: internal_error

How to handle response:
- Show the decrypted fields in the doctor UI. Do not expose these fields client-side unless necessary — treat them as sensitive data.

Database schema notes
- The SQL schema is provided in `db/schema.sql` and includes these tables:
  - patients (id, email_enc, email_hmac, password_hash, name_enc, dob_enc, created_at)
  - doctors (id, email_enc, email_hmac, password_hash, name_enc, specialty_enc, created_at)
  - medical_files (id, patient_id, uploaded_by_role, uploaded_by_id, filename_enc, description_enc, content_type, file_data, uploaded_at)

To create the database and apply schema (example):
```powershell
# create DB (if missing)
psql -h localhost -U postgres -c "CREATE DATABASE healthy_smiles;"
# run schema
psql -h localhost -U postgres -d healthy_smiles -f db/schema.sql
# enable pgcrypto if needed
psql -h localhost -U postgres -d healthy_smiles -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;"
```

Troubleshooting
- "ENCRYPTION_KEY not set": set `ENCRYPTION_KEY` in `.env` (base64 32 bytes) and restart the server.
- "invalid_credentials" on login after successful register: ensure the same `ENCRYPTION_KEY`/`HMAC_KEY` (or fallback `JWT_SECRET`) are used so email HMACs used for lookup match.
- If you see `internal_error`, check server terminal logs for stack traces. Most errors are either DB connectivity or missing env variables.

Security notes & recommendations
- Use a secrets manager for `ENCRYPTION_KEY` and `JWT_SECRET` in production.
- Consider storing files on an encrypted object store (S3 with SSE) instead of DB for scalability.
- Add strict ACLs so only assigned doctors can access a patient’s records.
- Add audit logging when doctors view or download patient records (important for compliance).

Want a download endpoint?
- The current scaffold stores encrypted files in the DB. A secure download endpoint (server decrypts and streams the file to authorized users) is recommended. If you want it, I can add `GET /api/files/medical/download/:fileId` which:
  - validates the JWT and role (doctor or owning patient),
  - decrypts the file server-side,
  - returns the file with `Content-Type` and `Content-Disposition` headers.

If you need example Postman collections or an automated smoke test script that runs through register/login/upload/list/download, tell me and I will add them.

End of documentation.
