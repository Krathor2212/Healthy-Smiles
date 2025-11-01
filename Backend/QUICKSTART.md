# Quick Start Guide

## Prerequisites
- Node.js 14+ installed
- PostgreSQL 12+ installed and running
- Git (optional)

## Installation Steps

### 1. Install Dependencies
```bash
cd Backend
npm install
```

### 2. Setup Environment Variables
Create a `.env` file in the Backend directory:

```bash
# Generate encryption keys
node -e "console.log('ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log('HMAC_KEY=' + require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and create `.env`:
```env
PORT=4000
DATABASE_URL=postgresql://postgres:password@localhost:5432/healthy_smiles
JWT_SECRET=<generated-jwt-secret>
ENCRYPTION_KEY=<generated-encryption-key>
HMAC_KEY=<generated-hmac-key>
ENCRYPTION_IV_LENGTH=12
NODE_ENV=development
```

### 3. Create Database
```bash
# Windows (PowerShell)
createdb -U postgres healthy_smiles

# Or using psql
psql -U postgres -c "CREATE DATABASE healthy_smiles;"
```

### 4. Run Database Schema
```bash
psql -U postgres -d healthy_smiles -f db/schema.sql
```

### 5. Insert Sample Data (Optional)
```bash
psql -U postgres -d healthy_smiles -f db/sample_data.sql
```

### 6. Start Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

You should see:
```
============================================================
🏥 Healthy Smiles Backend Server
============================================================
📍 HTTP Server: http://192.168.1.x:4000
🔌 WebSocket Server: ws://192.168.1.x:4000
🔐 El Gamal encryption: Enabled
🔑 Diffie-Hellman key exchange: Enabled
📅 Started: 11/1/2025, 10:30:00 AM
============================================================
✓ Diffie-Hellman WebSocket chat initialized
```

## Test the API

### 1. Health Check
```bash
curl http://localhost:4000/
```

Expected response:
```json
{
  "status": "ok",
  "message": "Healthy Smiles API is running",
  "version": "1.0.0"
}
```

### 2. Register a User
```bash
curl -X POST http://localhost:4000/register \
  -H "Content-Type: application/json" \
  -d '{
    "role": "patient",
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

Expected response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "patient",
    ...
  }
}
```

### 3. Get App Data
```bash
# Save the token from registration
TOKEN="<your-token-here>"

curl http://localhost:4000/api/app-data \
  -H "Authorization: Bearer $TOKEN"
```

Expected response:
```json
{
  "doctors": [...],
  "medicines": [...],
  "hospitals": [...],
  "articles": {
    "trending": [...],
    "latest": [...]
  },
  "categories": {...}
}
```

### 4. Test File Upload (El Gamal Encryption)
```bash
# Create a test file
echo "This is a test medical file" > test.txt

# Upload it
curl -X POST http://localhost:4000/api/files/medical/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.txt" \
  -F "description=Test medical record"
```

Expected response:
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "fileId": "abc-123-def",
  "file": {
    "id": "abc-123-def",
    "name": "test.txt",
    "encryption": "ElGamal",
    ...
  }
}
```

### 5. Download Encrypted File
```bash
FILE_ID="<file-id-from-upload>"

curl http://localhost:4000/api/files/medical/$FILE_ID/download \
  -H "Authorization: Bearer $TOKEN" \
  -o downloaded_file.txt
```

## Common Issues

### Issue: "ENCRYPTION_KEY not set"
**Solution**: Make sure you created the `.env` file with proper encryption keys.

### Issue: "database does not exist"
**Solution**: Create the database first:
```bash
createdb -U postgres healthy_smiles
```

### Issue: Port 4000 already in use
**Solution**: Change the PORT in `.env` file or kill the process using port 4000:
```bash
# Windows
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:4000 | xargs kill -9
```

### Issue: Cannot connect to PostgreSQL
**Solution**: Check PostgreSQL is running:
```bash
# Windows
pg_ctl status

# Linux/Mac
sudo systemctl status postgresql
```

## Next Steps

1. **Frontend Integration**: Use the API endpoints in your React Native app
2. **WebSocket Chat**: Connect to `ws://<server-ip>:4000` for real-time chat
3. **Sample Data**: Explore the sample doctors, medicines, and hospitals
4. **Security**: Review the encryption implementations in `elgamalCrypto.js` and `chatSocket.js`

## Testing with Postman

1. Import the API endpoints into Postman
2. Set `Authorization` header: `Bearer <your-token>`
3. Test all CRUD operations
4. For WebSocket, use a WebSocket client like `Socket.io Client`

## Production Deployment

Before deploying to production:

1. ✅ Set `NODE_ENV=production` in `.env`
2. ✅ Use strong, unique encryption keys
3. ✅ Enable HTTPS/WSS (TLS/SSL)
4. ✅ Configure CORS properly
5. ✅ Set up database backups
6. ✅ Implement rate limiting
7. ✅ Add logging and monitoring
8. ✅ Use environment-specific configuration

## Support

For issues or questions, refer to:
- `API_ENDPOINTS.md` - Complete API documentation
- `IMPLEMENTATION.md` - Technical implementation details
- `schema.sql` - Database structure

---

Happy coding! 🚀
