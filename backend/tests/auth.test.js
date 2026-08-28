import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../server.js';
import User from '../models/User.js';

describe('Auth Endpoints (POST /api/auth/signup & POST /api/auth/login)', () => {
  const validUser = {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    password: 'password123',
  };

  describe('POST /api/auth/signup', () => {
    it('should register a new user successfully with 201 Created and return JWT + sanitized user', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.name).toBe('Alice Johnson');
      expect(res.body.user.email).toBe('alice@example.com');
      expect(res.body.user.role).toBe('user');
      expect(res.body.user.password).toBeUndefined();
      expect(res.body.password).toBeUndefined();

      // Verify user in DB
      const dbUser = await User.findOne({ email: 'alice@example.com' });
      expect(dbUser).not.toBeNull();
      expect(dbUser.password).not.toBe('password123'); // Password must be hashed
    });

    it('should reject duplicate signup with 400 Bad Request and clean error message', async () => {
      // First signup
      await request(app).post('/api/auth/signup').send(validUser);

      // Duplicate signup
      const res = await request(app).post('/api/auth/signup').send(validUser);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should reject signup with missing required fields', async () => {
      const res1 = await request(app)
        .post('/api/auth/signup')
        .send({ email: 'alice@example.com', password: 'password123' });
      expect(res1.status).toBe(400);

      const res2 = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Alice', password: 'password123' });
      expect(res2.status).toBe(400);

      const res3 = await request(app)
        .post('/api/auth/signup')
        .send({ name: 'Alice', email: 'alice@example.com' });
      expect(res3.status).toBe(400);
    });

    it('should reject invalid email formats', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Invalid Email User',
          email: 'not-an-email',
          password: 'password123',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/valid email/i);
    });

    it('should reject short passwords (< 6 characters)', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Short Pass User',
          email: 'shortpass@example.com',
          password: '12345',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/at least 6 characters/i);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/signup').send(validUser);
    });

    it('should authenticate user with valid credentials and return JWT token', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'alice@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.name).toBe('Alice Johnson');
      expect(res.body.user.email).toBe('alice@example.com');
      expect(res.body.user.password).toBeUndefined();
      expect(res.body.password).toBeUndefined();
    });

    it('should reject login with wrong password (401 Unauthorized)', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'alice@example.com',
        password: 'wrongpassword',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid email or password/i);
      expect(res.body.token).toBeUndefined();
    });

    it('should reject login with nonexistent email (401 Unauthorized)', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'password123',
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it('should reject login when fields are missing (400 Bad Request)', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'alice@example.com',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
