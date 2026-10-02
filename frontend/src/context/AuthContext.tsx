import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  quickDemoLogin: (role: 'admin' | 'staff') => Promise<void>;
  logout: () => void;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('pos_token');
      const storedUser = localStorage.getItem('pos_user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));

          // Verify token validity by calling /auth/me
          const meResponse = await authService.getMe();
          if (meResponse.success && meResponse.user) {
            setUser(meResponse.user);
            localStorage.setItem('pos_user', JSON.stringify(meResponse.user));
          }
        } catch (err) {
          console.warn('Session expired or invalid token:', err);
          localStorage.removeItem('pos_token');
          localStorage.removeItem('pos_user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      if (response.success && response.token && response.user) {
        setToken(response.token);
        setUser(response.user);
        localStorage.setItem('pos_token', response.token);
        localStorage.setItem('pos_user', JSON.stringify(response.user));
        return { success: true };
      }
      return { success: false, message: response.message || 'Login failed' };
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      return { success: false, message: msg };
    }
  };

  const quickDemoLogin = async (role: 'admin' | 'staff') => {
    if (role === 'admin') {
      await login('admin@posdemo.com', 'Admin@123');
    } else {
      await login('staff@posdemo.com', 'Staff@123');
    }
  };

  const logout = () => {
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
    setToken(null);
    setUser(null);
    window.location.href = '/login';
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (user) {
      const nextUser = { ...user, ...updatedFields };
      setUser(nextUser);
      localStorage.setItem('pos_user', JSON.stringify(nextUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'ADMIN',
        isStaff: user?.role === 'STAFF',
        isLoading,
        login,
        quickDemoLogin,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
