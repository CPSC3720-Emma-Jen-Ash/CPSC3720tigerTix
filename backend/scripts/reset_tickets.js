import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
const { verbose } = sqlite3;
const dbLib = verbose();

// Resolve DB path like other services (LOCALAPPDATA/TigerTix/database.sqlite)
const localBase = process.env.LOCALAPPDATA || path.resolve(process.cwd(), '../../shared-db');
const dbDir = path.resolve(localBase, 'TigerTix');
const dbPath = path.join(dbDir, 'database.sqlite');
const db = new dbLib.Database(dbPath);

// Usage: node reset_tickets.js <eventID> <seat1,seat2,...> [price]
// Example: node reset_tickets.js 2 B1,B2,B3 25
const eventID = Number(process.argv[2] || process.env.EVENT_ID || 2);
const seats = (process.argv[3] || process.env.SEATS || 'A1,A2,A3').split(',');
const price = Number(process.argv[4] || process.env.PRICE || 20);

if (!eventID) {
  console.error('Please provide an eventID as the first argument.');
  process.exit(1);
}

console.log('Resetting tickets for event', eventID, 'seats=', seats, 'price=', price);

db.serialize(() => {
  db.run('BEGIN TRANSACTION');

  // Remove existing tickets for the event
  db.run('DELETE FROM Tickets WHERE eventID = ?', [eventID], function (delErr) {
    if (delErr) {
      console.error('Error deleting existing tickets:', delErr.message);
      db.run('ROLLBACK');
      process.exit(1);
    }

    // Insert fresh available tickets
    const stmt = db.prepare('INSERT INTO Tickets (eventID, seat_number, price, status) VALUES (?,?,?,?)');
    for (const seat of seats) {
      stmt.run(eventID, seat, price, 'available');
    }
    stmt.finalize((stmtErr) => {
      if (stmtErr) {
        console.error('Error inserting tickets:', stmtErr.message);
        db.run('ROLLBACK');
        process.exit(1);
      }

      // Update Events.num_tickets to match available tickets
      db.run(
        'UPDATE Events SET num_tickets = (SELECT COUNT(*) FROM Tickets WHERE eventID=Events.eventID AND status=\'available\') WHERE eventID = ?',
        [eventID],
        (updErr) => {
          if (updErr) {
            console.error('Error updating Events.num_tickets:', updErr.message);
            db.run('ROLLBACK');
            process.exit(1);
          }

          db.run('COMMIT', (commitErr) => {
            if (commitErr) {
              console.error('Commit failed:', commitErr.message);
              process.exit(1);
            }

            db.all('SELECT ticketID,eventID,seat_number,status,buyerID FROM Tickets WHERE eventID=? ORDER BY ticketID', [eventID], (err, rows) => {
              if (err) {
                console.error('Query error:', err.message);
                process.exit(1);
              }
              console.log('Reset tickets for event', eventID, rows);
              process.exit(0);
            });
          });
        }
      );
    });

  });
});
