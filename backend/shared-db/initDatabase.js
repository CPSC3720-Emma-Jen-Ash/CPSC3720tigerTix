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
  let dbLib;
  try {
    const sqlite3mod = await import('sqlite3');
    const Sqlite3 = sqlite3mod.default;
    const { verbose } = Sqlite3;
    dbLib = verbose();
  } catch (err) {
    console.error('Failed to import `sqlite3` from shared-db/initDatabase.js');
    console.error('Error:', err && err.message ? err.message : err);
    console.error('Diagnostic info:');
    try { console.error('process.cwd():', process.cwd()); } catch (e) {}
    try { console.error('__filename:', fileURLToPath(import.meta.url)); } catch (e) {}
    try { console.error('__dirname:', dirname(fileURLToPath(import.meta.url))); } catch (e) {}
    try { console.error('Looking for node_modules in these paths:'); } catch (e) {}
    try {
      const p = dirname(fileURLToPath(import.meta.url));
      let cur = p;
      for (let i = 0; i < 6; i++) {
        console.error(' -', path.join(cur, 'node_modules'));
        const parent = path.dirname(cur);
        if (parent === cur) break;
        cur = parent;
      }
    } catch (e) {}
    console.error('Ensure the service you deploy runs `npm ci` in the service Root Directory so `sqlite3` is installed.');
    console.error('Render/CI tip: set the service Root Directory to the service folder (e.g. `backend/client-service`) and Install Command `npm ci`.');
    // In CI we want the process to fail loudly so deployment logs contain the diagnostics
    throw err;
  }

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const localBase = process.env.LOCALAPPDATA || path.resolve(__dirname, '..');
  const dbDir = path.resolve(localBase, 'TigerTix');
  try { if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true }); } catch (e) { /* best-effort */ }
  const dbPath = path.join(dbDir, 'database.sqlite');
  console.log("DEBUG :: Resolved absolute DB path:", dbPath);
console.log("DEBUG :: DB directory exists?", fs.existsSync(dbDir));

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
