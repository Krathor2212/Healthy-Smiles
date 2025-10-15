Healthy Smiles - Backend

This is a minimal Express backend scaffold for the Healthy Smiles React Native app. It includes endpoints for user register/login (doctor and patient), secure file upload with encryption, and endpoints for doctors to fetch patient data.

Important notes:
- The user asked for A-DES; AES-256-GCM is used instead because A-DES is not a standard secure block cipher. If you specifically need DES, let me know but it is not recommended.
- The project expects a PostgreSQL database. See `db/schema.sql` for schema creation.

Quick start

1. Copy `.env.example` to `.env` and set values.
2. npm install
3. npm run dev
