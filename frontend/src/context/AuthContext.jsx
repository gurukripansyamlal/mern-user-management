import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/authService';
import { fetchUserProfile, deleteUserAccount } from '../services/userService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Validate stored token and load fresh user profile on initial mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const data = await fetchUserProfile();
          setUser(data.user);
          setToken(storedToken);
        } catch (error) {
          console.error('Session restoration failed:', error.customMessage || error.message);
          // Clean invalid state
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  /**
   * Log in user with credentials
   */
  const login = async (credentials) => {
    setAuthError(null);
    try {
      const data = await loginUser(credentials);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (error) {
      const errorMsg = error.customMessage || 'Login failed. Please check your credentials.';
      setAuthError(errorMsg);
      throw error;
    }
  };

  /**
   * Register a new user
   */
  const signup = async (userData) => {
    setAuthError(null);
    try {
      const data = await registerUser(userData);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data;
    } catch (error) {
      const errorMsg = error.customMessage || 'Signup failed. Please try again.';
      setAuthError(errorMsg);
      throw error;
    }
  };

  /**
   * Log out user and clear storage
   */
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setAuthError(null);
  };

  /**
   * Update locally stored user data (e.g. after profile update)
   */
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  /**
   * Delete user's own account and clear auth state
   */
  const deleteSelf = async () => {
    if (!user?._id) return;
    await deleteUserAccount(user._id);
    logout();
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    loading,
    authError,
    setAuthError,
    login,
    signup,
    logout,
    updateUser,
    deleteSelf,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
