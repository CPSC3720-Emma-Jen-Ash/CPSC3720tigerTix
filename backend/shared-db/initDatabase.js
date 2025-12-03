/**
 * @file initDatabase.js
 * @description Shared DB schema initializer used by multiple services.
 */
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

// Resolve __filename and __dirname for ES modules FIRST
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Choose the DB base path depending on environment
const DB_BASE = process.env.RENDER
  ? "/opt/render/project/data"                 // Render persistent storage
  : process.env.LOCALAPPDATA || path.resolve(__dirname, "..");

// Final directory for DB inside chosen base
const DB_DIR = path.join(DB_BASE, "TigerTix");

// Ensure DB directory exists
try {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
  }
} catch (e) {
  console.error("Failed to ensure DB directory:", DB_DIR, e);
}

// Final resolved DB path
export const DB_PATH = path.join(DB_DIR, "database.sqlite");
console.log("USING DATABASE:", DB_PATH);

let initDatabase = async function () {
  if (process.env.NODE_ENV === "test") return Promise.resolve();

  let dbLib;
  try {
    const sqlite3mod = await import("sqlite3");
    const Sqlite3 = sqlite3mod.default;
    const { verbose } = Sqlite3;
    dbLib = verbose();
  } catch (err) {
    console.error("Failed to import sqlite3:", err);
    throw err;
  }

  const dbPath = DB_PATH;

  return new Promise((resolve, reject) => {
    const db = new dbLib.Database(dbPath, (err) => {
      if (err) {
        console.error("SQLite open error:", err);
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
};

export { initDatabase };