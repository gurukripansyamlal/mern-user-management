import api from './api';

/**
 * Get current user profile
 */
export const fetchUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

/**
 * Update current user profile
 * @param {Object} profileData - { name, email }
 */
export const updateUserProfile = async (profileData) => {
  const response = await api.put('/users/profile', profileData);
  return response.data;
};

/**
 * Delete a user account (Self or Admin)
 * @param {string} userId
 */
export const deleteUserAccount = async (userId) => {
  const response = await api.delete(`/users/${userId}`);
  return response.data;
};

/**
 * Get all users (Admin only)
 */
export const fetchAllUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};
