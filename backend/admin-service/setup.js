// backend/admin-service/setup.js
// Initializes database schema for admin-service only.

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Choose DB base path (same pattern you're using elsewhere)
const DB_BASE = process.env.RENDER
  ? "/opt/render/project/data"                // Render persistent disk
  : process.env.LOCALAPPDATA || path.resolve(__dirname, "..");

// Final directory for DB inside chosen base
const DB_DIR = path.join(DB_BASE, "TigerTix");

if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Final resolved DB path
export const DB_PATH = path.join(DB_DIR, "database.sqlite");
console.log("ADMIN SERVICE USING DB:", DB_PATH);

export async function initDatabase() {
  if (process.env.NODE_ENV === "test") return;

  const sqlite3mod = await import("sqlite3");
  const Sqlite3 = sqlite3mod.default;
  const dbLib = Sqlite3.verbose();

  return new Promise((resolve, reject) => {
    const db = new dbLib.Database(DB_PATH, (err) => {
      if (err) {
        console.error("SQLite open error (admin):", err);
        return reject(err);
      }

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
}