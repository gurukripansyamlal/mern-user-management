import api from './api';

/**
 * Register a new user
 * @param {Object} userData - { name, email, password, role }
 */
export const registerUser = async (userData) => {
  const response = await api.post('/auth/signup', userData);
  return response.data;
};

/**
 * Authenticate user & get token
 * @param {Object} credentials - { email, password }
 */
export const loginUser = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  return response.data;
};
