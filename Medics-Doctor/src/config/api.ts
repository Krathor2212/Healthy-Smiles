// Centralized API configuration
// This file reads from environment variables and provides defaults

/**
 * Get the API base URL from environment variables
 * Falls back to localhost:4000 for development
 */
export const getApiBaseUrl = (): string => {
  return import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
};

/**
 * Get the Socket.IO server URL (without /api suffix)
 * Falls back to localhost:4000 for development
 */
export const getSocketUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
  // Remove /api suffix if present
  return apiUrl.replace(/\/api$/, '');
};

// Export constants for convenience
export const API_BASE_URL = getApiBaseUrl();
export const SOCKET_URL = getSocketUrl();
