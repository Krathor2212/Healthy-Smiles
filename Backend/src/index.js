require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const doctorRoutes = require('./routes/doctor');
const fileRoutes = require('./routes/files');
const { register, login } = require('./controllers/authController');
const os = require('os');

const app = express();
app.use(bodyParser.json());

app.use('/api/auth', authRoutes);
app.use('/api/doctor', doctorRoutes);
app.use('/api/files', fileRoutes);

// Root aliases to match requested endpoints
app.post('/register', register);
app.post('/login', login);

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
app.listen(port, ip, () => console.log(`Server running on http://${ip}:${port}`));
