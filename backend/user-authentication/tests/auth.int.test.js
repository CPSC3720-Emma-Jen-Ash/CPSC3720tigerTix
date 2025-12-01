import request from 'supertest';
import express from 'express';

import cookieParser from 'cookie-parser';

import authRoutes from '../routes/authRoutes.js';
import { resetUsers } from '../models/userModel.js';

process.env.NODE_ENV = 'test';

let app;

beforeEach(() => {
  app = express();
  app.use(express.json());

  app.use(cookieParser());

  app.use('/', authRoutes);
  resetUsers();
});

test('registers a user successfully', async () => {
  const res = await request(app)
    .post('/register')
    .send({ email: 'email@example.com', password: 'Pass123' });

  expect(res.statusCode).toBe(201);
  expect(res.body.user.email).toBe('email@example.com');
});

test('logs in successfully and returns JWT cookie', async () => {
  // register a user
  await request(app)
    .post('/register')
    .send({ email: 'login@test.com', password: 'Password123' });

  // Then attempt login
  const res = await request(app)
    .post('/login')
    .send({ email: 'login@test.com', password: 'Password123' });

  expect(res.statusCode).toBe(200);
  expect(res.headers['set-cookie']).toBeDefined();
});

// Invalid login test

test('rejects login with wrong password', async () => {
  // Register the user first
  await request(app)
    .post('/register')
    .send({ email: 'wrong@test.com', password: 'CorrectPass123' });

  // Attempt login with wrong password
  const res = await request(app)
    .post('/login')
    .send({ email: 'wrong@test.com', password: 'IncorrectPass' });

  expect(res.statusCode).toBe(401);
  expect(res.body.message).toBe('invalid credentials');
});

// Access protected route test

test('allows access to /me with a valid token', async () => {
  // Register user
  await request(app)
    .post('/register')
    .send({ email: 'me@test.com', password: 'Password123' });

  // Login to receive cookie
  const loginRes = await request(app)
    .post('/login')
    .send({ email: 'me@test.com', password: 'Password123' });

  const cookie = loginRes.headers['set-cookie'][0];

  // Access /me with cookie
  const res = await request(app)
    .get('/me')
    .set('Cookie', cookie);

  expect(res.statusCode).toBe(200);
  expect(res.body.email).toBe('me@test.com');
});

// Access protected route without token test

test('blocks access to /me when no token is provided', async () => {
  const res = await request(app)
    .get('/me');

  expect(res.statusCode).toBe(401);
  expect(res.body.message).toBe('no token');
});

// Logout test
test('logout clears the token cookie', async () => {
  // Register user
  await request(app)
    .post('/register')
    .send({ email: 'logout@test.com', password: 'Password123' });

  // Login to receive cookie
  const loginRes = await request(app)
    .post('/login')
    .send({ email: 'logout@test.com', password: 'Password123' });

  const cookie = loginRes.headers['set-cookie'][0];

  // Logout using the cookie
  const res = await request(app)
    .post('/logout')
    .set('Cookie', cookie);

  expect(res.statusCode).toBe(200);
  expect(res.body.message).toBe('logged out');
});
