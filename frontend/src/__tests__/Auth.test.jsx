import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import * as authService from '../services/authService';

// Mock auth & user services
vi.mock('../services/authService');
vi.mock('../services/userService');

describe('Frontend Authentication Components', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Login Component', () => {
    it('renders login form properly with inputs and submit button', () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('displays client-side validation errors when submitting empty form', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </MemoryRouter>
      );

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      expect(await screen.findByText(/email is required/i)).toBeInTheDocument();
      expect(await screen.findByText(/password is required/i)).toBeInTheDocument();
    });

    it('submits form with valid data and calls loginUser API', async () => {
      const mockUserData = {
        token: 'mock-jwt-token-123',
        user: { _id: '123', name: 'John Doe', email: 'john@example.com', role: 'user' },
      };
      authService.loginUser.mockResolvedValueOnce(mockUserData);

      render(
        <MemoryRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText(/enter your password/i), {
        target: { value: 'password123' },
      });

      fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

      await waitFor(() => {
        expect(authService.loginUser).toHaveBeenCalledWith({
          email: 'john@example.com',
          password: 'password123',
        });
      });
    });
  });

  describe('Signup Component', () => {
    it('renders signup form with full name, email, password, and role selector', () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <Signup />
          </AuthProvider>
        </MemoryRouter>
      );

      expect(screen.getByRole('heading', { name: /create an account/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/minimum 6 characters/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/account role/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    });

    it('validates password length on signup', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <Signup />
          </AuthProvider>
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'John' } });
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'john@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText(/minimum 6 characters/i), { target: { value: '123' } });

      fireEvent.click(screen.getByRole('button', { name: /create account/i }));

      expect(await screen.findByText(/at least 6 characters long/i)).toBeInTheDocument();
    });
  });
});
