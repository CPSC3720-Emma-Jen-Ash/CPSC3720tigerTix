/**
 * @file initDatabase.js
 * @description Shared DB schema initializer used by multiple services.
 */
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

let initDatabase = async function () {
  if (process.env.NODE_ENV === 'test') return Promise.resolve();

  // Dynamically import sqlite3 so tests don't require native addon
  const sqlite3mod = await import('sqlite3');
  const Sqlite3 = sqlite3mod.default;
  const { verbose } = Sqlite3;
  const dbLib = verbose();

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const localBase = process.env.LOCALAPPDATA || path.resolve(__dirname, '..');
  const dbDir = path.resolve(localBase, 'TigerTix');
  try { if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true }); } catch (e) { /* best-effort */ }
  const dbPath = path.join(dbDir, 'database.sqlite');

  return new Promise((resolve, reject) => {
    const db = new dbLib.Database(dbPath, (err) => {
      if (err) return reject(err);

      db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS Events (
          eventID INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          start_time TEXT,
          end_time TEXT,
          address TEXT,
          num_tickets INTEGER,
          organizerID INTEGER
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS Tickets (
          ticketID INTEGER PRIMARY KEY AUTOINCREMENT,
          eventID INTEGER,
          buyerID INTEGER,
          seat_number TEXT,
          price REAL,
          status TEXT,
          purchase_time TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS Transactions (
          transactionID INTEGER PRIMARY KEY AUTOINCREMENT,
          BuyerID INTEGER,
          ticketID INTEGER,
          amount REAL,
          payment_method TEXT,
          timestamp TEXT
        )`);
      });

      db.close((closeErr) => {
        if (closeErr) return reject(closeErr);
        resolve();
      });
    });
  });
};

export { initDatabase };
