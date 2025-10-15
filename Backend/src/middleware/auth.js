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

module.exports = { auth };
