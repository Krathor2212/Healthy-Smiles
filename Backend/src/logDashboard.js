const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

class LogDashboard {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 logs
    this.clients = new Set();
  }

  /**
   * Initialize WebSocket server for real-time log streaming
   */
  initializeWebSocket(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/logs-ws'
    });

    this.wss.on('connection', (ws) => {
      console.log('📊 Log dashboard client connected');
      this.clients.add(ws);

      // Send existing logs to new client
      ws.send(JSON.stringify({
        type: 'initial',
        logs: this.logs
      }));

      ws.on('close', () => {
        console.log('📊 Log dashboard client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });
    });
  }

  /**
   * Add a log entry and broadcast to all connected clients
   */
  addLog(logEntry) {
    const log = {
      ...logEntry,
      timestamp: new Date().toISOString(),
      id: Date.now() + Math.random()
    };

    this.logs.push(log);

    // Keep only last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Broadcast to all connected clients
    this.broadcast({
      type: 'new',
      log
    });
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(message) {
    const data = JSON.stringify(message);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  /**
   * Log HTTP request
   */
  logRequest(req, res, responseTime) {
    this.addLog({
      type: 'http',
      level: 'info',
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      responseTime,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });
  }

  /**
   * Log encryption operation
   */
  logEncryption(operation, algorithm, dataType, dataSize, success = true) {
    this.addLog({
      type: 'crypto',
      level: success ? 'info' : 'error',
      operation, // 'encrypt' or 'decrypt'
      algorithm, // 'AES-256-GCM', 'ElGamal', etc.
      dataType, // 'text', 'file', 'message', etc.
      dataSize,
      success
    });
  }

  /**
   * Log database operation
   */
  logDatabase(operation, table, rowCount, duration, success = true) {
    this.addLog({
      type: 'database',
      level: success ? 'info' : 'error',
      operation, // 'SELECT', 'INSERT', 'UPDATE', 'DELETE'
      table,
      rowCount,
      duration,
      success
    });
  }

  /**
   * Log error
   */
  logError(message, error, context = {}) {
    this.addLog({
      type: 'error',
      level: 'error',
      message,
      error: error?.message || error,
      stack: error?.stack,
      ...context
    });
  }

  /**
   * Log info message
   */
  logInfo(message, data = {}) {
    this.addLog({
      type: 'info',
      level: 'info',
      message,
      ...data
    });
  }

  /**
   * Log warning
   */
  logWarning(message, data = {}) {
    this.addLog({
      type: 'warning',
      level: 'warning',
      message,
      ...data
    });
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
    this.broadcast({ type: 'clear' });
  }
}

// Singleton instance
const logDashboard = new LogDashboard();

module.exports = logDashboard;
