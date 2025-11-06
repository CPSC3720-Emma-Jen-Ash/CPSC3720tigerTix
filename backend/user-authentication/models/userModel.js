import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Provide top-level exported function references; implementations assigned below
let createUser, findUserByEmail, findUserById, resetUsers;

if (process.env.NODE_ENV === 'test') {
  // In test mode keep a simple in-memory store to avoid sqlite native bindings in CI
  const users = []; // { id, email, passwordHash }
  let nextId = 1;

  createUser = (email, passwordHash) => {
    const existing = users.find(u => u.email === email.toLowerCase());
    if (existing) throw new Error('User already exists');
    const user = { id: nextId++, email: email.toLowerCase(), passwordHash };
    users.push(user);
    return { id: user.id, email: user.email };
  };

  findUserByEmail = (email) => users.find(u => u.email === email.toLowerCase());
  findUserById = (id) => users.find(u => u.id === Number(id));
  resetUsers = () => { users.length = 0; nextId = 1; };

} else {
  // Persist users in the shared SQLite DB (same location used by admin/client services)
  const localBase = process.env.LOCALAPPDATA || path.resolve(__dirname, '../../shared-db');
  const dbDir = path.resolve(localBase, 'TigerTix');
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
  const dbPath = path.join(dbDir, 'database.sqlite');

  // dynamic import of sqlite3
  const sqlite3mod = await import('sqlite3');
  const Sqlite3 = sqlite3mod.default;
  const dbLib = Sqlite3.verbose();

  const db = new dbLib.Database(dbPath, (err) => {
    if (err) console.error('userModel sqlite open error:', err.message);
  });

  // Ensure users table exists
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      passwordHash TEXT
    )`);
  });

  createUser = (email, passwordHash) => {
    return new Promise((resolve, reject) => {
      const sql = 'INSERT INTO Users (email, passwordHash) VALUES (?, ?)';
      db.run(sql, [email.toLowerCase(), passwordHash], function (err) {
        if (err) {
          if (err.code === 'SQLITE_CONSTRAINT') return reject(new Error('User already exists'));
          return reject(err);
        }
        resolve({ id: this.lastID, email: email.toLowerCase() });
      });
    });
  };

  findUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, email, passwordHash FROM Users WHERE email = ?', [email.toLowerCase()], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  };

  findUserById = (id) => {
    return new Promise((resolve, reject) => {
      db.get('SELECT id, email, passwordHash FROM Users WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  };

  resetUsers = () => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM Users', (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  };

}

export { createUser, findUserByEmail, findUserById, resetUsers };
