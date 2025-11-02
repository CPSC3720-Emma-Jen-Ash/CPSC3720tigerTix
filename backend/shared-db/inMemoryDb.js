// Simple in-memory DB used only during tests (NODE_ENV === 'test')
// Provides callback-style API compatible with adminModel and clientModel

const EVENTS = [];
const TICKETS = [];
let nextEventID = 1;
let nextTicketID = 1;

// Map of eventID -> Promise chain for serializing purchases
const purchaseQueues = new Map();

export function reset() {
  EVENTS.length = 0;
  TICKETS.length = 0;
  nextEventID = 1;
  nextTicketID = 1;
  purchaseQueues.clear();
}

export function createEvent(event, callback) {
  const eventID = nextEventID++;
  const stored = {
    eventID,
    title: event.title,
    description: event.description || "",
    start_time: event.start_time || null,
    end_time: event.end_time || null,
    address: event.address || "",
    num_tickets: event.num_tickets || 0,
    organizerID: event.organizerID || null,
  };
  EVENTS.push(stored);

  // create tickets
  const tickets_created = stored.num_tickets;
  for (let i = 1; i <= tickets_created; i++) {
    const seat = `SEAT-${String(i).padStart(3, "0")}`;
    TICKETS.push({
      ticketID: nextTicketID++,
      eventID,
      buyerID: null,
      seat_number: seat,
      price: event.ticket_price || 50.0,
      status: 'available',
      purchase_time: null
    });
  }

  process.nextTick(() => callback && callback(null, { eventID, tickets_created }));
}

export function getAllEvents(callback) {
  // return rows like { eventID, title, num_tickets, ... }
  const rows = EVENTS.map(e => ({
    eventID: e.eventID,
    title: e.title,
    start_time: e.start_time,
    num_tickets: TICKETS.filter(t => t.eventID === e.eventID && t.status === 'available').length
  }));
  process.nextTick(() => callback && callback(null, rows));
}

export function buyTicket(eventID, buyerID, callback) {
  // ensure serialized per-event using a Promise chain
  const id = Number(eventID);
  const prev = purchaseQueues.get(id) || Promise.resolve();
  const p = prev.then(() => {
    return new Promise((resolve) => {
      // find first available ticket
      const ticketIndex = TICKETS.findIndex(t => t.eventID === id && t.status === 'available');
      if (ticketIndex === -1) {
        const err = new Error('sold out');
        err.status = 400;
        resolve({ err });
        return;
      }

      const ticket = TICKETS[ticketIndex];
      ticket.status = 'sold';
      ticket.buyerID = buyerID;
      ticket.purchase_time = new Date().toISOString();

      // decrement event num_tickets
      const evt = EVENTS.find(e => e.eventID === id);
      if (evt) evt.num_tickets = Math.max(0, evt.num_tickets - 1);

      resolve({ result: {
        ticketID: ticket.ticketID,
        seat_number: ticket.seat_number,
        message: 'purchase successful'
      }});
    });
  });
  purchaseQueues.set(id, p.finally(() => {}));

  p.then(({ err, result }) => {
    if (err) return callback(err);
    callback(null, result);
  }).catch(err => callback(err));
}

export function getEventByName(name, callback) {
  const term = (name || '').toLowerCase();
  const evt = EVENTS.find(e => e.title.toLowerCase().includes(term));
  if (!evt) return process.nextTick(() => callback && callback(null, undefined));
  const total_tickets = TICKETS.filter(t => t.eventID === evt.eventID && t.status === 'available').length;
  process.nextTick(() => callback && callback(null, { id: evt.eventID, total_tickets }));
}
