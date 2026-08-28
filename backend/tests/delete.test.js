import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';

describe('Delete User Endpoints (DELETE /api/users/:id) & Admin List (GET /api/users)', () => {
  let user1Token, user1Id;
  let user2Token, user2Id;
  let adminToken, adminId;

  beforeEach(async () => {
    // Create User 1
    const res1 = await request(app).post('/api/auth/signup').send({
      name: 'User One',
      email: 'user1@example.com',
      password: 'password123',
    });
    user1Token = res1.body.token;
    user1Id = res1.body.user._id;

    // Create User 2
    const res2 = await request(app).post('/api/auth/signup').send({
      name: 'User Two',
      email: 'user2@example.com',
      password: 'password123',
    });
    user2Token = res2.body.token;
    user2Id = res2.body.user._id;

    // Create Admin User
    const resAdmin = await request(app).post('/api/auth/signup').send({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });
    adminToken = resAdmin.body.token;
    adminId = resAdmin.body.user._id;
  });

  describe('DELETE /api/users/:id', () => {
    it('should allow a user to delete their own account (self-deletion)', async () => {
      const res = await request(app)
        .delete(`/api/users/${user1Id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/deleted successfully/i);

      // Verify user no longer exists in DB
      const userInDb = await User.findById(user1Id);
      expect(userInDb).toBeNull();
    });

    it('should allow an admin to delete any user account', async () => {
      const res = await request(app)
        .delete(`/api/users/${user2Id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/deleted successfully/i);

      // Verify user 2 no longer exists in DB
      const userInDb = await User.findById(user2Id);
      expect(userInDb).toBeNull();
    });

    it('should reject a normal user trying to delete another user (403 Forbidden)', async () => {
      const res = await request(app)
        .delete(`/api/users/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/not authorized/i);

      // Verify user 2 still exists
      const userInDb = await User.findById(user2Id);
      expect(userInDb).not.toBeNull();
    });

    it('should return 404 when trying to delete a non-existent user with admin token', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .delete(`/api/users/${nonExistentId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/user not found/i);
    });

    it('should return 400 when an invalid ObjectId format is passed', async () => {
      const res = await request(app)
        .delete('/api/users/invalid-id-format')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid user id format/i);
    });
  });

  describe('GET /api/users (Admin user listing)', () => {
    it('should allow admin to retrieve list of all users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.users).toBeInstanceOf(Array);
      expect(res.body.users.length).toBe(3);

      // Verify passwords are not included
      res.body.users.forEach((u) => {
        expect(u.password).toBeUndefined();
      });
    });

    it('should reject regular user from accessing list of all users (403 Forbidden)', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/admin privileges required/i);
    });
  });
});
