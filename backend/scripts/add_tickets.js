import sqlite3 from 'sqlite3';
import path from 'path';
const { verbose } = sqlite3;
const dbLib = verbose();
const localBase = process.env.LOCALAPPDATA || path.resolve(process.cwd(), '../../shared-db');
const dbDir = path.resolve(localBase, 'TigerTix');
const dbPath = path.join(dbDir, 'database.sqlite');
const db = new dbLib.Database(dbPath);

const eventID = Number(process.argv[2] || process.env.EVENT_ID || 2);
const seats = (process.argv[3] || process.env.SEATS || 'B2,B3').split(',');
const price = Number(process.argv[4] || process.env.PRICE || 20);

db.serialize(() => {
  const stmt = db.prepare('INSERT INTO Tickets (eventID, seat_number, price, status) VALUES (?,?,?,?)');
  for (const seat of seats) {
    stmt.run(eventID, seat, price, 'available');
  }
  stmt.finalize();
  db.run("UPDATE Events SET num_tickets = (SELECT COUNT(*) FROM Tickets WHERE eventID=Events.eventID AND status='available') WHERE eventID=?", [eventID]);
});

db.all('SELECT ticketID,eventID,seat_number,status,buyerID FROM Tickets WHERE eventID=? ORDER BY ticketID',[eventID],(err, rows) => {
  if (err) { console.error(err); process.exit(1); }
  console.log('Inserted tickets for event', eventID, rows);
  process.exit(0);
});
