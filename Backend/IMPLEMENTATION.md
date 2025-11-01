# Healthy Smiles Backend API

Complete backend implementation for the Healthy Smiles React Native application with advanced security features.

## 🔐 Security Features

### El Gamal Encryption for Medical Files
- **2048-bit key pairs** generated for each patient on registration
- **Asymmetric encryption** ensures only the patient can decrypt their files
- Support for **chunked encryption** for large files
- Private keys stored encrypted in database

### Diffie-Hellman Key Exchange for Chat
- **Real-time WebSocket** communication with Socket.io
- **2048-bit Diffie-Hellman** key exchange on connection
- Messages encrypted with **AES-256-CBC** using shared secret
- End-to-end encryption for all chat messages

### AES-256-GCM for User Data
- All sensitive user data encrypted at rest
- HMAC-based email lookups for privacy
- Deterministic encryption for searchable fields

## 📁 Project Structure

```
Backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js          # Registration, login, password reset
│   │   ├── appDataController.js       # Centralized data endpoint
│   │   ├── profileController.js       # User profile management
│   │   ├── appointmentController.js   # Appointment booking
│   │   ├── fileController.js          # Medical file upload/download (El Gamal)
│   │   ├── chatController.js          # Chat HTTP endpoints
│   │   ├── orderController.js         # Pharmacy orders
│   │   ├── paymentController.js       # Payment history
│   │   ├── notificationController.js  # Notifications
│   │   └── faqController.js           # FAQs
│   ├── routes/
│   │   ├── auth.js
│   │   ├── appData.js
│   │   ├── profile.js
│   │   ├── appointments.js
│   │   ├── files.js
│   │   ├── chats.js
│   │   ├── orders.js
│   │   ├── payments.js
│   │   ├── notifications.js
│   │   └── faqs.js
│   ├── middleware/
│   │   └── auth.js                    # JWT authentication
│   ├── elgamalCrypto.js               # El Gamal encryption utility
│   ├── chatSocket.js                  # Diffie-Hellman WebSocket handler
│   ├── cryptoUtil.js                  # AES-256-GCM utilities
│   ├── db.js                          # PostgreSQL connection
│   └── index.js                       # Main server file
├── db/
│   ├── schema.sql                     # Database schema
│   └── sample_data.sql                # Sample data for testing
├── package.json
└── .env.example
```

## 🚀 Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create `.env` file:

```env
PORT=4000
DATABASE_URL=postgresql://user:password@localhost:5432/healthy_smiles
JWT_SECRET=your-super-secret-jwt-key-here
ENCRYPTION_KEY=base64-encoded-32-byte-key
HMAC_KEY=base64-encoded-32-byte-key
NODE_ENV=development
```

Generate encryption keys:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 3. Setup Database

```bash
# Create database
createdb healthy_smiles

# Run schema
psql healthy_smiles < db/schema.sql

# Insert sample data
psql healthy_smiles < db/sample_data.sql
```

### 4. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

Server will start on:
- **HTTP**: `http://<your-ip>:4000`
- **WebSocket**: `ws://<your-ip>:4000`

## 📡 API Endpoints

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/register` | POST | Register new user with El Gamal key generation |
| `/login` | POST | Login and receive JWT token |
| `/auth/forgot-password` | POST | Request password reset code |
| `/auth/verify-code` | POST | Verify reset code |
| `/auth/reset-password` | POST | Reset password |

### Core Data (Centralized)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/app-data` | GET | ✅ | Get ALL doctors, medicines, hospitals, articles |

### User Profile

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/user/profile` | GET | ✅ | Get user profile with stats |
| `/api/user/profile` | PUT | ✅ | Update profile |

### Appointments

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/appointments` | GET | ✅ | Get user appointments (filter by status) |
| `/api/appointments` | POST | ✅ | Create appointment |
| `/api/appointments/:id` | PATCH | ✅ | Update appointment status |

### Medical Files (El Gamal Encrypted)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/files/medical` | GET | ✅ | Get user's medical files |
| `/api/files/medical/upload` | POST | ✅ | Upload encrypted file |
| `/api/files/medical/:id/download` | GET | ✅ | Download and decrypt file |
| `/api/files/medical/:id` | DELETE | ✅ | Delete file |

### Chat (Diffie-Hellman Encrypted)

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `ws://<ip>:4000` | WebSocket | ✅ | Real-time chat with DH key exchange |
| `/api/chats` | GET | ✅ | Get chat contacts |
| `/api/chats/:id/messages` | GET | ✅ | Get messages (encrypted) |
| `/api/chats/:id/messages` | POST | ✅ | Send message (HTTP fallback) |

### Orders

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/orders` | GET | ✅ | Get user orders |
| `/api/orders` | POST | ✅ | Create order |

### Other Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/payments` | GET | ✅ | Payment history |
| `/api/notifications` | GET | ✅ | Get notifications |
| `/api/notifications/:id` | PATCH | ✅ | Mark as read |
| `/api/faqs` | GET | ❌ | Get FAQs |

## 🔌 WebSocket Events

### Client → Server

```javascript
// Send encrypted message
socket.emit('send-message', {
  chatId: 'chat-001',
  encryptedData: 'base64_encrypted_text',
  iv: 'hex_iv'
});

// Typing indicator
socket.emit('typing', {
  chatId: 'chat-001',
  isTyping: true
});
```

### Server → Client

```javascript
// Diffie-Hellman initialization
socket.on('dh-init', ({ p, g, A }) => {
  // Client calculates shared secret
});

// Incoming message
socket.on('message', ({ chatId, messageId, encryptedData, iv, sender, timestamp }) => {
  // Decrypt and display message
});

// Encryption ready
socket.on('encryption-ready', () => {
  // Can now send messages
});
```

## 🧪 Testing

### Test Registration with El Gamal Keys

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

Response includes JWT token and user data. El Gamal keys generated automatically.

### Test File Upload

```bash
curl -X POST http://localhost:4000/api/files/medical/upload \
  -H "Authorization: Bearer <token>" \
  -F "file=@test.pdf" \
  -F "patientId=<patient-id>" \
  -F "description=Test medical file"
```

File is encrypted with patient's El Gamal public key before storage.

### Test WebSocket Chat

See `test-websocket-client.js` in the examples folder.

## 📦 Dependencies

### Core
- **express** - Web framework
- **pg** - PostgreSQL client
- **bcrypt** - Password hashing
- **jsonwebtoken** - JWT authentication
- **multer** - File upload handling

### Security
- **socket.io** - WebSocket server
- **big-integer** - Large number arithmetic for El Gamal
- **node-forge** - Cryptographic utilities
- **crypto-js** - Client-side crypto (for reference)
- **cors** - CORS middleware

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` file
2. **HTTPS**: Use HTTPS in production
3. **JWT Expiry**: Tokens expire after 30 days
4. **Password Reset**: Codes expire after 5 minutes
5. **File Size Limits**: 50MB max file upload
6. **Rate Limiting**: Implement in production
7. **Input Validation**: All inputs validated
8. **SQL Injection**: Using parameterized queries
9. **CORS**: Configure allowed origins in production

## 📊 Database Tables

- `patients` - User accounts with El Gamal keys
- `doctors` - Doctor accounts
- `doctors_data` - Static doctor information
- `medicines` - Pharmacy catalog
- `hospitals` - Hospital directory
- `articles` - Health articles
- `appointments` - Patient appointments
- `medical_files` - Encrypted medical files (El Gamal)
- `chat_contacts` - Chat sessions
- `messages` - Encrypted chat messages
- `orders` - Pharmacy orders
- `notifications` - User notifications
- `password_reset_codes` - Password reset tokens
- `faqs` - Frequently asked questions

## 🎯 Response Format

All endpoints return consistent JSON format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error description"
}
```

## 🚦 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## 📝 License

MIT

## 👥 Contributors

Healthy Smiles Development Team

---

**Version**: 1.0.0  
**Last Updated**: November 1, 2025
