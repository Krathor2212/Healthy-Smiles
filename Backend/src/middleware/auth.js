const jwt = require('jsonwebtoken');

function auth(required = true) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      if (required) return res.status(401).json({ error: 'missing_token' });
      return next();
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2) return res.status(401).json({ error: 'bad_token' });
    const token = parts[1];
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
      req.user = payload;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'invalid_token' });
    }
  };
}

// Simpler authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ 
      success: false,
      error: 'Authentication required' 
    });
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ 
      success: false,
      error: 'Invalid token format' 
    });
  }

  const token = parts[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'devsecret');
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ 
      success: false,
      error: 'Invalid or expired token' 
    });
  }
}

// Admin authorization middleware
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }

  next();
}

// Doctor authorization middleware
function requireDoctor(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Doctor access required'
    });
  }

  next();
}

module.exports = { auth, authenticateToken, requireAdmin, requireDoctor };
