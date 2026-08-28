import axios from 'axios';

// Get API base URL from environment or default to /api (uses Vite proxy in local dev)
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer token to headers if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Format error messages consistently
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Extract standardized message
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred. Please try again.';
    
    // Attach clean error message to error object
    error.customMessage = message;

    // Handle token expiration/unauthorized gracefully
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      // If we got 401 while holding a token, notify app/clear invalid token
      if (error.response.data?.message?.includes('expired') || error.response.data?.message?.includes('invalid')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }

    return Promise.reject(error);
  }
);

export default api;
