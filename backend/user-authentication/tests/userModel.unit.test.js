import { createUser, findUserByEmail, resetUsers } from '../models/userModel.js';

process.env.NODE_ENV = 'test';

beforeEach(() => {
  resetUsers();
});

test('createUser creates a new user and lowercases the email', () => {
  const user = createUser('email@example.com', 'hash123');

  expect(user.email).toBe('email@example.com');

  const found = findUserByEmail('email@example.com');
  expect(found.passwordHash).toBe('hash123');
});

test('createUser throws error when email already exists', () => {
  createUser('duplicate@example.com', 'hash1');

  expect(() => {
    createUser('duplicate@example.com', 'hash2');
  }).toThrow('User already exists');
});

test('findUserByEmail returns undefined for non-existent email', () => {
  resetUsers(); // ensure clean state

  const result = findUserByEmail('notfound@example.com');

  expect(result).toBeUndefined();
});

import { findUserById } from '../models/userModel.js'; // added import for findUserById

test('findUserById returns the correct user', () => {
  resetUsers();

  const user1 = createUser('a@example.com', 'hashA');
  const user2 = createUser('b@example.com', 'hashB');

  const found1 = findUserById(user1.id);
  const found2 = findUserById(user2.id);

  expect(found1.email).toBe('a@example.com');
  expect(found2.email).toBe('b@example.com');
});

test('resetUsers clears all users and resets ID counter', () => {
  // Add two users
  const user1 = createUser('test1@example.com', 'hash1');
  const user2 = createUser('test2@example.com', 'hash2');

  // check both created
  expect(findUserById(user1.id)).toBeDefined();
  expect(findUserById(user2.id)).toBeDefined();

  // Reset users
  resetUsers();

  // Users should be gone
  expect(findUserById(user1.id)).toBeUndefined();
  expect(findUserById(user2.id)).toBeUndefined();

  // New user should start at ID 1 again
  const user3 = createUser('new@example.com', 'hash3');
  expect(user3.id).toBe(1);
});