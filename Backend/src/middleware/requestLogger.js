const logDashboard = require('../logDashboard');

/**
 * Middleware to log all HTTP requests
 */
function requestLogger(req, res, next) {
  const startTime = Date.now();

  // Store original end function
  const originalEnd = res.end;

  // Override end function to capture response
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    
    // Log the request
    logDashboard.logRequest(req, res, responseTime);

    // Call original end function
    originalEnd.apply(res, args);
  };

  next();
}

module.exports = requestLogger;
