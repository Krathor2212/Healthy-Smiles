require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const cors = require('cors');
const os = require('os');

// Import routes
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctor');
const fileRoutes = require('./routes/files');
const appDataRoutes = require('./routes/appData');
const profileRoutes = require('./routes/profile');
const appointmentRoutes = require('./routes/appointments');
const chatRoutes = require('./routes/chats');
const orderRoutes = require('./routes/orders');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');
const faqRoutes = require('./routes/faqs');

// Import controllers
const { register, login } = require('./controllers/authController');

// Import WebSocket handler
const DiffieHellmanChat = require('./chatSocket');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: '*', // Configure appropriately for production
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
// Increase body parser limits for file uploads (though files use multer)
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Healthy Smiles API is running',
    version: '1.0.0'
  });
});

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes); // Also mount under /auth for password reset
app.use('/api/doctor', doctorRoutes);
app.use('/api/files', fileRoutes);
app.use('/api', appDataRoutes);
app.use('/api/user', profileRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/faqs', faqRoutes);

// Root aliases to match requested endpoints
app.post('/register', register);
app.post('/login', login);

// Initialize secure WebSocket chat
const chatHandler = new DiffieHellmanChat(io);
chatHandler.initialize();

console.log('✓ Diffie-Hellman WebSocket chat initialized');

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const port = process.env.PORT || 4000;

function getLocalIPv4() {
  const ifaces = os.networkInterfaces();
  for (const ifaceList of Object.values(ifaces)) {
    for (const iface of ifaceList) {
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
    }
  }
  return '0.0.0.0';
}

const ip = getLocalIPv4();

// Listen on all interfaces (0.0.0.0) to be accessible from both localhost and network
server.listen(port, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log('🏥 Healthy Smiles Backend Server');
  console.log('='.repeat(60));
  console.log(`📍 Localhost: http://localhost:${port}`);
  console.log(`📍 Network: http://${ip}:${port}`);
  console.log(`🔌 WebSocket (localhost): ws://localhost:${port}`);
  console.log(`🔌 WebSocket (network): ws://${ip}:${port}`);
  console.log(`🔐 El Gamal encryption: Enabled`);
  console.log(`🔑 Diffie-Hellman key exchange: Enabled`);
  console.log(`📅 Started: ${new Date().toLocaleString()}`);
  console.log('='.repeat(60));
});
