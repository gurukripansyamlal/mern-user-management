import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';

describe('Profile Endpoints (GET & PUT /api/users/profile)', () => {
  let userToken;
  let userId;
  let userEmail = 'bob@example.com';

  beforeEach(async () => {
    // Create base user
    const res = await request(app).post('/api/auth/signup').send({
      name: 'Bob Smith',
      email: userEmail,
      password: 'password123',
    });

    userToken = res.body.token;
    userId = res.body.user._id;
  });

  describe('GET /api/users/profile', () => {
    it('should reject request without Bearer token (401 Unauthorized)', async () => {
      const res = await request(app).get('/api/users/profile');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/no token/i);
    });

    it('should reject request with invalid Bearer token (401 Unauthorized)', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalidtoken123');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return profile for authenticated user with valid token', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user).toBeDefined();
      expect(res.body.user._id).toBe(userId);
      expect(res.body.user.name).toBe('Bob Smith');
      expect(res.body.user.email).toBe(userEmail);
      expect(res.body.user.role).toBe('user');
      expect(res.body.user.password).toBeUndefined();
      expect(res.body.password).toBeUndefined();
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user name and email successfully', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Robert Smith',
          email: 'robert.smith@example.com',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.user.name).toBe('Robert Smith');
      expect(res.body.user.email).toBe('robert.smith@example.com');

      // Verify in DB
      const updatedUser = await User.findById(userId);
      expect(updatedUser.name).toBe('Robert Smith');
      expect(updatedUser.email).toBe('robert.smith@example.com');
    });

    it('should reject email update if email is already taken by another user (409 Conflict)', async () => {
      // Create another user
      await request(app).post('/api/auth/signup').send({
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        password: 'password123',
      });

      // Try updating Bob's email to Charlie's email
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'charlie@example.com',
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already in use/i);
    });

    it('should prevent arbitrary role modification by normal user', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Bob Hacked',
          role: 'admin',
        });

      expect(res.status).toBe(200);
      expect(res.body.user.role).toBe('user');

      // Verify role did not change in DB
      const dbUser = await User.findById(userId);
      expect(dbUser.role).toBe('user');
    });

    it('should reject invalid email format during profile update', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email: 'invalid-email-format',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/valid email/i);
    });
  });
});
