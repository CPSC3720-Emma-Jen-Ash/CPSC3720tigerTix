/**
 * @file adminModel.js
 * @description SQL logic for creating events and generating tickets
 */

import { fileURLToPath } from "url";
import { dirname } from "path";
import { DB_PATH } from "../setup.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let createEvent;

if (process.env.NODE_ENV === "test") {

  const mod = await import("../../shared-db/inMemoryDb.js");
  createEvent = mod.createEvent;

} else {

  const sqlite3mod = await import("sqlite3");
  const Sqlite3 = sqlite3mod.default;
  const dbLib = Sqlite3.verbose();

  const db = new dbLib.Database(
    DB_PATH,
    dbLib.OPEN_READWRITE | dbLib.OPEN_CREATE,
    (err) => {
      if (err) {
        console.error("SQLite connection error (admin model):", err.message);
      } else {
        console.log("AdminModel connected to DB:", DB_PATH);
      }
    }
  );

  createEvent = function (event, callback) {
    const {
      title,
      description,
      start_time,
      end_time,
      address,
      num_tickets,
      organizerID,
      ticket_price = 50.0
    } = event;

    const insertEvent = `
      INSERT INTO Events (title, description, start_time, end_time, address, num_tickets, organizerID)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(
      insertEvent,
      [title, description, start_time, end_time, address, num_tickets, organizerID],
      function (err) {
        if (err) return callback(err);

        const eventID = this.lastID;

        const insertTicket = `
          INSERT INTO Tickets (eventID, seat_number, price, status)
          VALUES (?, ?, ?, 'available')
        `;

        for (let i = 1; i <= num_tickets; i++) {
          const seat = `SEAT-${String(i).padStart(3, "0")}`;
          db.run(insertTicket, [eventID, seat, ticket_price]);
        }

        callback(null, { eventID, tickets_created: num_tickets });
      }
    );
  };
}

export { createEvent };