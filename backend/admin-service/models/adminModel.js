/**
 * @file adminModel.js
 * @description  SQL logic for creating events and generating tickets
 */

import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const { verbose } = sqlite3;
const dbLib = verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.resolve(__dirname, "../../shared-db/database.sqlite");
const db = new dbLib.Database(dbPath, dbLib.OPEN_READWRITE, (err) => {
  if (err) console.error("SQLite connection error:", err.message);
  else console.log("Connected to shared SQLite database.");
});
/**
 * Inserts an event and auto-generates tickets using a default price if not provided.
 * @param {Object} event - Event details including title, description, start_time, end_time, address, num_tickets, organizerID, and optional ticket_price
 * @param {Function} createEvent used to create an event in the database by running SQL insert statements into the Events and Tickets tables
 * @param {Function} callback - Callback function to handle the result or error.
 * @param {number} [event.ticket_price=50.0] - Optional ticket price, defaults to 50.0 if not provided.
 */

export function createEvent(event, callback) {
  const { title, description, start_time, end_time, address, num_tickets, organizerID, ticket_price = 50.0 } = event;
  //insert event into Events table using positional placeholders for title, description, start_time, end_time, address, num_tickets, organizerID
  const query = `INSERT INTO Events (title, description, start_time, end_time, address, num_tickets, organizerID)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
//execute the insert query by passing in the event details and a callback to handle the result
  db.run(query, [title, description, start_time, end_time, address, num_tickets, organizerID], function (err) {
    if (err) return callback(err);
    // After inserting the event, generate tickets for it and define each ticket with a seat number and price
    //then set the status to 'available'
    //use this.lastID to get the eventID of the newly created event
    const eventID = this.lastID;
    const ticketQuery = `INSERT INTO Tickets (eventID, seat_number, price, status)
                         VALUES (?, ?, ?, 'available')`;

    // converts each loop indext to a string like SEAT-001, SEAT-002, etc and uses padStart to ensure 3 digits like
    // 001, 002 so that the IDs are consistent
    // then do another db.run to insert each ticket into the Tickets table
    //not using callback because we don't need to wait for each insert to complete
    for (let i = 1; i <= num_tickets; i++) {
      const seat = `SEAT-${String(i).padStart(3, "0")}`;
      db.run(ticketQuery, [eventID, seat, ticket_price]);
    }
    //final callback with null error and an object containing the eventID and number of tickets created
    callback(null, { eventID, tickets_created: num_tickets });
  });
}

